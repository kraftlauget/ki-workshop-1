// Calendar utility functions for Phase 3

export interface TimeSlot {
  hour: number
  minute: number
  label: string
}

export interface CalendarDay {
  date: Date
  dayName: string
  dayNumber: number
  isToday: boolean
  isWeekend: boolean
}

export interface CalendarWeek {
  weekStart: Date
  weekEnd: Date
  days: CalendarDay[]
}

// Generate business hours time slots (8 AM - 6 PM, 30-minute intervals)
export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  
  for (let hour = 8; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      slots.push({
        hour,
        minute,
        label: formatTime(hour, minute)
      })
    }
  }
  
  return slots
}

// Format time as "9:00 AM" or "2:30 PM"
export function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const displayMinute = minute.toString().padStart(2, '0')
  
  return `${displayHour}:${displayMinute} ${period}`
}

// Get the current week (Monday to Sunday)
export function getCurrentWeek(referenceDate: Date = new Date()): CalendarWeek {
  const startOfWeek = getStartOfWeek(referenceDate)
  const days: CalendarDay[] = []
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    
    days.push({
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: isToday(date),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    })
  }
  
  const weekEnd = new Date(startOfWeek)
  weekEnd.setDate(startOfWeek.getDate() + 6)
  
  return {
    weekStart: startOfWeek,
    weekEnd,
    days
  }
}

// Get Monday of the current week
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

// Check if a date is today
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Navigate to previous/next week
export function navigateWeek(currentDate: Date, direction: 'prev' | 'next'): Date {
  const result = new Date(currentDate)
  const daysToAdd = direction === 'next' ? 7 : -7
  result.setDate(result.getDate() + daysToAdd)
  return result
}

// Format week range for display (e.g., "Dec 4 - Dec 10, 2024")
export function formatWeekRange(week: CalendarWeek): string {
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

// Create a datetime string for a specific time slot on a date
export function createSlotDateTime(date: Date, timeSlot: TimeSlot): string {
  const result = new Date(date)
  result.setHours(timeSlot.hour, timeSlot.minute, 0, 0)
  return result.toISOString()
}

// Parse booking time to get hour and minute
export function parseBookingTime(dateTimeString: string): { hour: number; minute: number } {
  const date = new Date(dateTimeString)
  return {
    hour: date.getHours(),
    minute: date.getMinutes()
  }
}

// Check if a booking overlaps with a time slot
export function isBookingInSlot(
  bookingStart: string,
  bookingEnd: string,
  slotDate: Date,
  timeSlot: TimeSlot
): boolean {
  const slotStart = createSlotDateTime(slotDate, timeSlot)
  const slotEnd = createSlotDateTime(slotDate, {
    hour: timeSlot.minute === 30 ? timeSlot.hour + 1 : timeSlot.hour,
    minute: timeSlot.minute === 30 ? 0 : 30,
    label: ''
  })
  
  const bookingStartTime = new Date(bookingStart).getTime()
  const bookingEndTime = new Date(bookingEnd).getTime()
  const slotStartTime = new Date(slotStart).getTime()
  const slotEndTime = new Date(slotEnd).getTime()
  
  return bookingStartTime < slotEndTime && bookingEndTime > slotStartTime
}

// Get booking duration in minutes
export function getBookingDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  return Math.round((end - start) / (1000 * 60))
}

// Calculate booking height in grid cells (30-minute slots)
export function getBookingHeight(startTime: string, endTime: string): number {
  const duration = getBookingDuration(startTime, endTime)
  return Math.max(1, Math.round(duration / 30))
}

// Get booking position in grid (starting slot)
export function getBookingPosition(startTime: string, timeSlots: TimeSlot[]): number {
  const { hour, minute } = parseBookingTime(startTime)
  return timeSlots.findIndex(slot => slot.hour === hour && slot.minute === minute)
}

// Format duration for display
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}