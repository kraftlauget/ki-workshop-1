'use client'

import { useState } from 'react'
import { AlertTriangle, Clock, MapPin } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { cancelBooking } from '@/lib/api/bookings'
import { formatTime } from '@/lib/calendar-utils'
import type { ExtendedBooking } from '@/types/database'

interface CancelBookingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking?: ExtendedBooking | null
  onSuccess?: () => void
}

export function CancelBookingModal({
  open,
  onOpenChange,
  booking,
  onSuccess
}: CancelBookingModalProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirmCancel = async () => {
    if (!booking) return

    try {
      setLoading(true)
      await cancelBooking(booking.id, booking.user_id)
      onOpenChange(false)
      
      // Show success toast
      toast({
        type: 'success',
        title: 'Booking Cancelled',
        message: `${booking.title || 'Meeting'} has been cancelled successfully.`
      })
      
      onSuccess?.()
    } catch (error: any) {
      console.error('Error cancelling booking:', error)
      toast({
        type: 'error',
        title: 'Cancellation Failed',
        message: error.message || 'Failed to cancel booking. Please try again.'
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

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))
    
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Cancel Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-0">
          <p className="text-gray-600">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">
              {booking.title || 'Untitled Meeting'}
            </h4>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{booking.rooms.name}</span>
                {booking.rooms.location && (
                  <span>• {booking.rooms.location}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatDateTime(booking.start_time)}</span>
                <span>• {getDuration(booking.start_time, booking.end_time)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" />
              <div className="text-sm">
                <p className="text-yellow-800 font-medium">
                  Please cancel with adequate notice
                </p>
                <p className="text-yellow-700 mt-1">
                  Consider notifying other attendees if this is a shared meeting.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Keep Booking
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}