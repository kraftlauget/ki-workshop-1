'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Users, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/toast'
import { createBooking } from '@/lib/api/bookings'
import { getRoomById } from '@/lib/api/rooms'
import { formatTime } from '@/lib/calendar-utils'
import type { Room } from '@/types/database'

interface QuickBookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId?: string
  startTime?: string
  duration?: number // in minutes
  onSuccess?: () => void
}

export function QuickBookModal({
  open,
  onOpenChange,
  roomId,
  startTime,
  duration = 60,
  onSuccess
}: QuickBookModalProps) {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: duration
  })

  useEffect(() => {
    if (open && roomId) {
      fetchRoom()
      setFormData(prev => ({ ...prev, duration }))
    }
  }, [open, roomId, duration])

  const fetchRoom = async () => {
    if (!roomId) return
    
    try {
      setLoading(true)
      const roomData = await getRoomById(roomId)
      setRoom(roomData)
    } catch (error) {
      console.error('Error fetching room:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomId || !startTime || !formData.title.trim()) return

    try {
      setSubmitting(true)
      
      const bookingStart = new Date(startTime)
      const bookingEnd = new Date(bookingStart)
      bookingEnd.setMinutes(bookingStart.getMinutes() + formData.duration)

      await createBooking({
        room_id: roomId,
        title: formData.title.trim(),
        start_time: bookingStart.toISOString(),
        end_time: bookingEnd.toISOString()
      })

      // Reset form
      setFormData({ title: '', description: '', duration: 60 })
      onOpenChange(false)
      
      // Show success toast
      toast({
        type: 'success',
        title: 'Booking Created!',
        message: `${formData.title} has been booked successfully.`
      })
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast({
        type: 'error',
        title: 'Booking Failed',
        message: error.message || 'Failed to create booking. Please try again.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    let dateStr = ''
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow'
    } else {
      dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const timeStr = formatTime(date.getHours(), date.getMinutes())
    return `${dateStr} at ${timeStr}`
  }

  const getEndTime = () => {
    if (!startTime) return ''
    const start = new Date(startTime)
    const end = new Date(start)
    end.setMinutes(start.getMinutes() + formData.duration)
    return formatTime(end.getHours(), end.getMinutes())
  }

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Quick Book Meeting
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {!loading && room && startTime && (
          <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-0">
            {/* Room Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{room.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Capacity: {room.capacity} people</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatDateTime(startTime)}</span>
              </div>
            </div>

            {/* Meeting Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter meeting title"
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <div className="grid grid-cols-2 gap-2">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                    className={`
                      p-2 text-sm rounded border text-center transition-colors
                      ${formData.duration === option.value
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Ends at {getEndTime()}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add meeting details, agenda, or notes"
                rows={3}
              />
            </div>
          </form>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || loading || !formData.title.trim()}
          >
            {submitting ? 'Booking...' : 'Book Meeting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}