'use client'

import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { useCalendarState } from '@/hooks/useCalendarState'
import type { CalendarBooking } from '@/types/calendar'

interface WeeklyCalendarProps {
  onQuickBook?: (roomId: string, dateTime: string) => void
  onBookingClick?: (booking: CalendarBooking) => void
}

export function WeeklyCalendar({ onQuickBook, onBookingClick }: WeeklyCalendarProps) {
  const {
    calendarWeek,
    viewState,
    loading,
    error,
    navigateToWeek,
    setCurrentWeek,
    refreshCalendar
  } = useCalendarState()

  const handleToday = () => {
    setCurrentWeek(new Date())
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-red-200">
        <div className="text-center">
          <div className="text-red-600 font-medium">Error loading calendar</div>
          <div className="text-red-500 text-sm mt-1">{error}</div>
          <button 
            onClick={refreshCalendar}
            className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <CalendarHeader
        week={calendarWeek}
        onNavigate={navigateToWeek}
        onToday={handleToday}
        onRefresh={refreshCalendar}
        loading={loading}
      />

      {loading && !calendarWeek ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading calendar...</div>
        </div>
      ) : calendarWeek ? (
        <CalendarGrid
          week={calendarWeek}
          onQuickBook={onQuickBook}
          onBookingClick={onBookingClick}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">No calendar data available</div>
        </div>
      )}
    </div>
  )
}