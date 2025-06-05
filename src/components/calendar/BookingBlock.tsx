'use client'

import { useState } from 'react'
import { Clock, User, MapPin } from 'lucide-react'
import { formatDuration, parseBookingTime, formatTime } from '@/lib/calendar-utils'
import type { CalendarBooking } from '@/types/calendar'

interface BookingBlockProps {
  booking: CalendarBooking
  onClick?: (booking: CalendarBooking) => void
}

export function BookingBlock({ booking, onClick }: BookingBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const startTime = parseBookingTime(booking.start_time)
  const endTime = parseBookingTime(booking.end_time)
  const duration = formatDuration(booking.duration_minutes)
  
  const handleClick = () => {
    onClick?.(booking)
  }

  return (
    <div
      className={`
        absolute left-0 right-0 mx-1 rounded-md border-l-4 cursor-pointer
        transition-all duration-150 ease-in-out
        ${isHovered ? 'shadow-md z-10 scale-105' : 'shadow-sm'}
      `}
      style={{
        backgroundColor: booking.color ? `${booking.color}20` : '#3B82F620',
        borderLeftColor: booking.color || '#3B82F6',
        top: `${booking.gridPosition * 2.5}rem`,
        height: `${booking.gridHeight * 2.5}rem`,
        minHeight: '2.5rem'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="p-2 h-full flex flex-col justify-between">
        <div className="min-w-0">
          <div 
            className="font-medium text-sm text-gray-900 truncate"
            title={booking.title || 'Untitled Meeting'}
          >
            {booking.title || 'Untitled Meeting'}
          </div>
          
          {booking.gridHeight > 1 && (
            <div className="text-xs text-gray-600 mt-1 space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  {formatTime(startTime.hour, startTime.minute)} - {formatTime(endTime.hour, endTime.minute)}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {booking.profiles.full_name || booking.profiles.email}
                </span>
              </div>

              {booking.rooms.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{booking.rooms.location}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {booking.gridHeight === 1 && (
          <div className="text-xs text-gray-500 truncate">
            {duration} • {booking.profiles.full_name || booking.profiles.email}
          </div>
        )}
      </div>

      {/* Hover tooltip for small bookings */}
      {isHovered && booking.gridHeight === 1 && (
        <div className="absolute left-full top-0 ml-2 z-20 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          <div className="font-medium">{booking.title || 'Untitled Meeting'}</div>
          <div>
            {formatTime(startTime.hour, startTime.minute)} - {formatTime(endTime.hour, endTime.minute)} ({duration})
          </div>
          <div>{booking.profiles.full_name || booking.profiles.email}</div>
          {booking.rooms.location && <div>{booking.rooms.location}</div>}
        </div>
      )}
    </div>
  )
}