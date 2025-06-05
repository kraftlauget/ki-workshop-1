'use client'

import { useState, useEffect, useMemo } from 'react'
import { getRooms } from '@/lib/api/rooms'
import { getRoomBookings } from '@/lib/api/bookings'
import { getCurrentWeek, navigateWeek, generateTimeSlots, createSlotDateTime, isBookingInSlot, getBookingPosition, getBookingHeight } from '@/lib/calendar-utils'
import type { Room, ExtendedBooking } from '@/types/database'
import type { CalendarWeek, CalendarRoom, CalendarDay, CalendarTimeSlot, CalendarBooking, CalendarViewState } from '@/types/calendar'

interface UseCalendarStateReturn {
  calendarWeek: CalendarWeek | null
  viewState: CalendarViewState
  loading: boolean
  error: string | null
  navigateToWeek: (direction: 'prev' | 'next') => void
  setCurrentWeek: (date: Date) => void
  toggleRoom: (roomId: string) => void
  refreshCalendar: () => Promise<void>
}

export function useCalendarState(): UseCalendarStateReturn {
  const [viewState, setViewState] = useState<CalendarViewState>({
    currentWeek: new Date(),
    viewMode: 'week',
    showWeekends: false
  })
  
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<ExtendedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const timeSlots = useMemo(() => generateTimeSlots(), [])

  useEffect(() => {
    fetchCalendarData()
  }, [viewState.currentWeek])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)

      const week = getCurrentWeek(viewState.currentWeek)
      const startDate = week.weekStart.toISOString().split('T')[0]
      const endDate = week.weekEnd.toISOString().split('T')[0]

      // Fetch rooms and bookings for the week
      const [roomsData, bookingsData] = await Promise.all([
        getRooms(),
        fetchWeekBookings(startDate, endDate)
      ])

      setRooms(roomsData)
      setBookings(bookingsData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar data')
    } finally {
      setLoading(false)
    }
  }

  const fetchWeekBookings = async (startDate: string, endDate: string): Promise<ExtendedBooking[]> => {
    // For now, we'll fetch all bookings and filter client-side
    // In production, you'd want a dedicated API endpoint for week bookings
    const allBookings: ExtendedBooking[] = []
    
    for (const room of await getRooms()) {
      const roomBookings = await getRoomBookings(room.id, startDate, endDate)
      allBookings.push(...roomBookings)
    }
    
    return allBookings
  }

  const calendarWeek = useMemo((): CalendarWeek | null => {
    if (!rooms.length) return null

    const week = getCurrentWeek(viewState.currentWeek)
    const calendarRooms: CalendarRoom[] = []

    for (const room of rooms) {
      const roomBookings = bookings.filter(booking => booking.room_id === room.id)
      const days: CalendarDay[] = []

      for (const day of week.days) {
        if (!viewState.showWeekends && day.isWeekend) continue

        const timeSlots: CalendarTimeSlot[] = []

        for (const slot of timeSlots) {
          const slotDateTime = createSlotDateTime(day.date, slot)
          const slotBookings: CalendarBooking[] = []

          // Find bookings that overlap with this time slot
          for (const booking of roomBookings) {
            if (isBookingInSlot(booking.start_time, booking.end_time, day.date, slot)) {
              const calendarBooking: CalendarBooking = {
                ...booking,
                gridPosition: getBookingPosition(booking.start_time, timeSlots),
                gridHeight: getBookingHeight(booking.start_time, booking.end_time),
                color: generateBookingColor(booking.user_id)
              }
              slotBookings.push(calendarBooking)
            }
          }

          timeSlots.push({
            ...slot,
            dateTime: slotDateTime,
            isAvailable: slotBookings.length === 0,
            bookings: slotBookings
          })
        }

        days.push({
          ...day,
          timeSlots
        })
      }

      calendarRooms.push({
        room,
        days
      })
    }

    return {
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      rooms: calendarRooms
    }
  }, [rooms, bookings, viewState.currentWeek, viewState.showWeekends, timeSlots])

  const navigateToWeek = (direction: 'prev' | 'next') => {
    const newDate = navigateWeek(viewState.currentWeek, direction)
    setViewState(prev => ({ ...prev, currentWeek: newDate }))
  }

  const setCurrentWeek = (date: Date) => {
    setViewState(prev => ({ ...prev, currentWeek: date }))
  }

  const toggleRoom = (roomId: string) => {
    setViewState(prev => ({
      ...prev,
      selectedRoom: prev.selectedRoom === roomId ? undefined : roomId
    }))
  }

  const refreshCalendar = async () => {
    await fetchCalendarData()
  }

  return {
    calendarWeek,
    viewState,
    loading,
    error,
    navigateToWeek,
    setCurrentWeek,
    toggleRoom,
    refreshCalendar
  }
}

// Generate a consistent color for bookings based on user ID
function generateBookingColor(userId: string): string {
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16'  // lime
  ]
  
  // Simple hash to get consistent color
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) & 0xffffffff
  }
  
  return colors[Math.abs(hash) % colors.length]
}