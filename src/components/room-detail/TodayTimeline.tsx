'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, User, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getRoomBookings } from '@/lib/api/bookings'
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings'
import { generateTimeSlots, formatTime, isBookingInSlot, type TimeSlot } from '@/lib/calendar-utils'
import type { ExtendedBooking } from '@/types/database'

interface TodayTimelineProps {
  roomId: string
  onQuickBook?: (roomId: string, dateTime: string, duration?: number) => void
}

export function TodayTimeline({ roomId, onQuickBook }: TodayTimelineProps) {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTodayBookings = useCallback(async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const todayBookings = await getRoomBookings(roomId, today, today)
      setBookings(todayBookings)
    } catch (error) {
      console.error('Error fetching today bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    fetchTodayBookings()
  }, [fetchTodayBookings])

  // Enable real-time updates for room bookings
  useRealtimeBookings({
    onBookingInsert: (booking) => {
      if (booking.room_id === roomId) {
        fetchTodayBookings()
      }
    },
    onBookingUpdate: (booking) => {
      if (booking.room_id === roomId) {
        fetchTodayBookings()
      }
    },
    onBookingDelete: (booking) => {
      if (booking.room_id === roomId) {
        fetchTodayBookings()
      }
    }
  })

  const timeSlots = generateTimeSlots()
  const today = new Date()

  const getSlotBookings = (slot: TimeSlot) => {
    return bookings.filter(booking => 
      isBookingInSlot(booking.start_time, booking.end_time, today, slot)
    )
  }

  const handleQuickBook = (slot: TimeSlot) => {
    const slotDateTime = new Date(today)
    slotDateTime.setHours(slot.hour, slot.minute, 0, 0)
    onQuickBook?.(roomId, slotDateTime.toISOString(), 60)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4].map((i) => (
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
          <Clock className="w-5 h-5" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="max-h-96 overflow-y-auto space-y-1">
          {timeSlots.map((slot) => {
            const slotBookings = getSlotBookings(slot)
            const isAvailable = slotBookings.length === 0
            const isPast = today.getHours() > slot.hour || 
                          (today.getHours() === slot.hour && today.getMinutes() >= slot.minute)

            return (
              <div 
                key={`${slot.hour}-${slot.minute}`}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${isAvailable ? 'bg-gray-50 hover:bg-blue-50' : 'bg-red-50'}
                  ${isPast ? 'opacity-50' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-16">
                    {slot.label}
                  </div>
                  
                  {isAvailable ? (
                    <div className="text-sm text-gray-500">Available</div>
                  ) : (
                    <div className="flex-1">
                      {slotBookings.map((booking) => (
                        <div key={booking.id} className="space-y-1">
                          <div className="font-medium text-sm">
                            {booking.title || 'Untitled Meeting'}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <User className="w-3 h-3" />
                            <span>{booking.profiles.full_name || booking.profiles.email}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isAvailable && !isPast && onQuickBook && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickBook(slot)}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Book
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <div className="text-sm">No bookings today</div>
            <div className="text-xs text-gray-400">This room is available all day</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}