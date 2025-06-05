'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { BookingBlock } from './BookingBlock'
import type { CalendarTimeSlot, CalendarBooking } from '@/types/calendar'

interface TimeSlotCellProps {
  timeSlot: CalendarTimeSlot
  roomId: string
  onQuickBook?: (roomId: string, dateTime: string) => void
  onBookingClick?: (booking: CalendarBooking) => void
}

export function TimeSlotCell({ 
  timeSlot, 
  roomId, 
  onQuickBook, 
  onBookingClick 
}: TimeSlotCellProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleSlotClick = () => {
    if (timeSlot.isAvailable && onQuickBook) {
      onQuickBook(roomId, timeSlot.dateTime)
    }
  }

  const hasBookings = timeSlot.bookings.length > 0

  return (
    <div
      className={`
        relative h-10 border-b border-gray-100 
        ${timeSlot.isAvailable ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}
        ${isHovered && timeSlot.isAvailable ? 'bg-blue-50' : ''}
        transition-colors duration-150
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSlotClick}
    >
      {/* Available slot hover indicator */}
      {isHovered && timeSlot.isAvailable && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600 text-white rounded-full p-1 opacity-80">
            <Plus className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Render booking blocks */}
      {hasBookings && timeSlot.bookings.map((booking) => (
        <BookingBlock
          key={booking.id}
          booking={booking}
          onClick={onBookingClick}
        />
      ))}
    </div>
  )
}