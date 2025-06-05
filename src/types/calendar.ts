// Calendar-specific types for Phase 3

import type { ExtendedBooking, Room } from './database'

export interface CalendarBooking extends ExtendedBooking {
  // Additional calendar-specific properties
  gridPosition: number
  gridHeight: number
  color?: string
}

export interface CalendarTimeSlot {
  hour: number
  minute: number
  label: string
  dateTime: string
  isAvailable: boolean
  bookings: CalendarBooking[]
}

export interface CalendarDay {
  date: Date
  dayName: string
  dayNumber: number
  isToday: boolean
  isWeekend: boolean
  timeSlots: CalendarTimeSlot[]
}

export interface CalendarRoom {
  room: Room
  days: CalendarDay[]
}

export interface CalendarWeek {
  weekStart: Date
  weekEnd: Date
  rooms: CalendarRoom[]
}

export interface CalendarViewState {
  currentWeek: Date
  selectedRoom?: string
  selectedTimeSlot?: {
    roomId: string
    dateTime: string
  }
  viewMode: 'week' | 'day'
  showWeekends: boolean
}

export interface QuickBookingData {
  roomId: string
  dateTime: string
  duration: number // minutes
  title?: string
}

export interface CalendarEvent {
  type: 'booking_created' | 'booking_updated' | 'booking_deleted'
  booking: ExtendedBooking
  roomId: string
}