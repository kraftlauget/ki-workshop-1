'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
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
import { toast } from '@/components/ui/toast'
import { updateBooking } from '@/lib/api/bookings'
import { formatTime } from '@/lib/calendar-utils'
import type { ExtendedBooking } from '@/types/database'

interface EditBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: ExtendedBooking | null
  onSuccess?: () => void
}

export function EditBookingModal({
  open,
  onOpenChange,
  booking,
  onSuccess
}: EditBookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    description: ''
  })

  useEffect(() => {
    if (booking && open) {
      const start = new Date(booking.start_time)
      const end = new Date(booking.end_time)

      setFormData({
        title: booking.title || '',
        startDate: start.toISOString().split('T')[0],
        startTime: start.toTimeString().slice(0, 5),
        endDate: end.toISOString().split('T')[0],
        endTime: end.toTimeString().slice(0, 5),
        description: '' // We don't have description in the current schema
      })
    }
  }, [booking, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking || !formData.title.trim()) return

    try {
      setLoading(true)
      
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`

      // Validate that end time is after start time
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        alert('End time must be after start time')
        return
      }

      await updateBooking(booking.id, booking.user_id, {
        title: formData.title.trim(),
        start_time: startDateTime,
        end_time: endDateTime
      })

      onOpenChange(false)
      
      // Show success toast
      toast({
        type: 'success',
        title: 'Booking Updated!',
        message: `${formData.title} has been updated successfully.`
      })
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating booking:', error)
      toast({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update booking. Please try again.'
      })
    } finally {
      setLoading(false)
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

  const getDuration = () => {
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      return ''
    }

    const start = new Date(`${formData.startDate}T${formData.startTime}:00`)
    const end = new Date(`${formData.endDate}T${formData.endTime}:00`)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))
    
    if (diffMins < 60) return `${diffMins} minutes`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Edit Booking
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-0">
          {/* Room Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{booking.rooms.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Capacity: {booking.rooms.capacity} people</span>
            </div>
            {booking.rooms.location && (
              <div className="text-sm text-gray-600">
                Location: {booking.rooms.location}
              </div>
            )}
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

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          {getDuration() && (
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration: {getDuration()}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
          >
            {loading ? 'Updating...' : 'Update Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}