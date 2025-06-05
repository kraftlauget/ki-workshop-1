'use client'

import { generateTimeSlots, formatTime } from '@/lib/calendar-utils'
import { TimeSlotCell } from './TimeSlotCell'
import type { CalendarWeek, CalendarBooking } from '@/types/calendar'

interface CalendarGridProps {
  week: CalendarWeek
  onQuickBook?: (roomId: string, dateTime: string) => void
  onBookingClick?: (booking: CalendarBooking) => void
}

export function CalendarGrid({ week, onQuickBook, onBookingClick }: CalendarGridProps) {
  const timeSlots = generateTimeSlots()
  
  // Get all days from all rooms (should be consistent)
  const days = week.rooms[0]?.days || []
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-[auto_1fr] min-w-fit">
        {/* Time column header */}
        <div className="sticky left-0 z-10 bg-gray-50 border-r border-gray-200">
          <div className="h-16 border-b border-gray-200"></div> {/* Day headers spacer */}
          {timeSlots.map((slot) => (
            <div 
              key={`${slot.hour}-${slot.minute}`}
              className="h-10 px-4 py-2 text-xs text-gray-500 border-b border-gray-100 flex items-center"
            >
              {slot.minute === 0 ? formatTime(slot.hour, slot.minute) : ''}
            </div>
          ))}
        </div>

        {/* Calendar content */}
        <div className="min-w-0">
          {/* Day headers */}
          <div className="grid grid-cols-[repeat(var(--rooms),1fr)] bg-gray-50 border-b border-gray-200 h-16" 
               style={{ '--rooms': week.rooms.length } as React.CSSProperties}>
            {week.rooms.map((roomData) => (
              <div key={roomData.room.id} className="border-r border-gray-200 last:border-r-0">
                <div className="p-2 text-center">
                  <div className="font-semibold text-sm text-gray-900 truncate">
                    {roomData.room.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {roomData.room.capacity} people
                  </div>
                  {roomData.room.location && (
                    <div className="text-xs text-gray-400 truncate">
                      {roomData.room.location}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          <div 
            className="grid grid-cols-[repeat(var(--rooms),1fr)]"
            style={{ '--rooms': week.rooms.length } as React.CSSProperties}
          >
            {timeSlots.map((slot) => (
              week.rooms.map((roomData) => {
                // Find the time slot for this room and time
                const dayTimeSlot = roomData.days
                  .flatMap(day => day.timeSlots)
                  .find(ts => ts.hour === slot.hour && ts.minute === slot.minute)

                return (
                  <div 
                    key={`${roomData.room.id}-${slot.hour}-${slot.minute}`}
                    className="border-r border-gray-200 last:border-r-0"
                  >
                    {dayTimeSlot && (
                      <TimeSlotCell
                        timeSlot={dayTimeSlot}
                        roomId={roomData.room.id}
                        onQuickBook={onQuickBook}
                        onBookingClick={onBookingClick}
                      />
                    )}
                  </div>
                )
              })
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}