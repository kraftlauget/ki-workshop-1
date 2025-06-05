'use client'

import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CalendarWeek } from '@/types/calendar'

// Helper function to format week range
function formatCalendarWeekRange(week: CalendarWeek): string {
  const startMonth = week.weekStart.toLocaleDateString('en-US', { month: 'short' })
  const startDay = week.weekStart.getDate()
  const endMonth = week.weekEnd.toLocaleDateString('en-US', { month: 'short' })
  const endDay = week.weekEnd.getDate()
  const year = week.weekEnd.getFullYear()
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
  }
}

interface CalendarHeaderProps {
  week: CalendarWeek | null
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
  onRefresh: () => void
  loading?: boolean
}

export function CalendarHeader({ 
  week, 
  onNavigate, 
  onToday, 
  onRefresh, 
  loading = false 
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white p-4 border-b border-gray-200">
      {/* Left side - Week navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
            disabled={loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
            disabled={loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          disabled={loading}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Today
        </Button>

        <div className="text-lg font-semibold text-gray-900">
          {week ? formatCalendarWeekRange(week) : 'Loading...'}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  )
}