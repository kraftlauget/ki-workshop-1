'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { checkRoomAvailableAt } from '@/lib/api/rooms'
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings'
import { formatTime } from '@/lib/calendar-utils'

interface QuickBookSlotsProps {
  roomId: string
  onQuickBook?: (roomId: string, dateTime: string, duration?: number) => void
}

interface AvailableSlot {
  startTime: string
  endTime: string
  duration: number
  label: string
}

export function QuickBookSlots({ roomId, onQuickBook }: QuickBookSlotsProps) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)

  const findAvailableSlots = useCallback(async () => {
    try {
      setLoading(true)
      const now = new Date()
      const slots: AvailableSlot[] = []

      // Round to next 30-minute slot
      const currentMinutes = now.getMinutes()
      const nextSlotMinutes = currentMinutes < 30 ? 30 : 60
      const startTime = new Date(now)
      startTime.setMinutes(nextSlotMinutes, 0, 0)

      // Check next 8 hours for available slots
      for (let i = 0; i < 16; i++) { // 16 half-hour slots = 8 hours
        const slotStart = new Date(startTime)
        slotStart.setMinutes(startTime.getMinutes() + (i * 30))
        
        // Skip if outside business hours (8 AM - 6 PM)
        if (slotStart.getHours() < 8 || slotStart.getHours() >= 18) continue

        // Check different durations
        const durations = [30, 60, 120] // 30min, 1hr, 2hr
        
        for (const duration of durations) {
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotStart.getMinutes() + duration)
          
          // Skip if end time is outside business hours
          if (slotEnd.getHours() > 18) continue

          try {
            const isAvailable = await checkRoomAvailableAt(
              roomId,
              slotStart.toISOString(),
              slotEnd.toISOString()
            )

            if (isAvailable) {
              const startHour = slotStart.getHours()
              const startMinute = slotStart.getMinutes()
              const endHour = slotEnd.getHours()
              const endMinute = slotEnd.getMinutes()

              slots.push({
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
                duration,
                label: `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`
              })
            }
          } catch (error) {
            console.error('Error checking slot availability:', error)
          }
        }

        // Limit to 6 slots to keep UI clean
        if (slots.length >= 6) break
      }

      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error finding available slots:', error)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    findAvailableSlots()
  }, [findAvailableSlots])

  // Enable real-time updates for available slots
  useRealtimeBookings({
    onBookingInsert: (booking) => {
      if (booking.room_id === roomId) {
        findAvailableSlots()
      }
    },
    onBookingUpdate: (booking) => {
      if (booking.room_id === roomId) {
        findAvailableSlots()
      }
    },
    onBookingDelete: (booking) => {
      if (booking.room_id === roomId) {
        findAvailableSlots()
      }
    }
  })

  const handleQuickBook = (slot: AvailableSlot) => {
    onQuickBook?.(roomId, slot.startTime, slot.duration)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    return `${minutes / 60}h`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Book
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableSlots.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">No available slots</div>
            <div className="text-xs text-gray-400">
              Try booking for a different time or date
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {availableSlots.map((slot, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{slot.label}</div>
                  <div className="text-xs text-gray-500">
                    {formatDuration(slot.duration)} duration
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleQuickBook(slot)}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Book
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            className="w-full text-sm"
            onClick={() => window.location.href = `/dashboard/book?room=${roomId}`}
          >
            <Plus className="w-4 h-4 mr-2" />
            Book Different Time
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}