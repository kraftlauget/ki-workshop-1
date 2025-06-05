'use client'

import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatWeekRange } from '@/lib/calendar-utils'
import type { CalendarWeek } from '@/types/calendar'

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
          {week ? formatWeekRange(week) : 'Loading...'}
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