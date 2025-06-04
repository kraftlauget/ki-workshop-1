import { supabase } from '@/lib/supabase'
import type { 
  ExtendedBooking, 
  BookingFormData, 
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest 
} from '@/types/database'

export async function createBooking(data: BookingFormData, userId: string): Promise<string> {
  const startDateTime = `${data.start_date}T${data.start_time}:00`
  const endDateTime = `${data.end_date}T${data.end_time}:00`

  // Validate that end time is after start time
  if (new Date(endDateTime) <= new Date(startDateTime)) {
    throw new Error('End time must be after start time')
  }

  // Check for conflicts first
  const { data: conflictData, error: conflictError } = await supabase
    .rpc('check_booking_conflict', {
      p_room_id: data.room_id,
      p_start_time: startDateTime,
      p_end_time: endDateTime
    })

  if (conflictError) throw conflictError

  if (conflictData) {
    throw new Error('Room is not available for the selected time')
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      room_id: data.room_id,
      user_id: userId,
      title: data.title || null,
      start_time: startDateTime,
      end_time: endDateTime,
      status: 'confirmed'
    })
    .select('id')
    .single()

  if (error) throw error
  return booking.id
}

export async function getUserBookings(
  userId: string,
  includeHistory: boolean = true
): Promise<ExtendedBooking[]> {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        name,
        capacity,
        location
      ),
      profiles (
        email,
        full_name
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')

  if (!includeHistory) {
    // Only future bookings
    const now = new Date().toISOString()
    query = query.gte('start_time', now)
  }

  const { data, error } = await query.order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getRoomBookings(
  roomId: string,
  startDate?: string,
  endDate?: string,
  includeUserInfo: boolean = false
): Promise<ExtendedBooking[]> {
  let selectClause = `
    *,
    rooms (
      name,
      capacity,
      location
    )
  `

  if (includeUserInfo) {
    selectClause += `,
    profiles (
      email,
      full_name
    )`
  }

  let query = supabase
    .from('bookings')
    .select(selectClause)
    .eq('room_id', roomId)
    .eq('status', 'confirmed')

  if (startDate) {
    query = query.gte('start_time', `${startDate}T00:00:00`)
  }

  if (endDate) {
    query = query.lte('start_time', `${endDate}T23:59:59`)
  }

  const { data, error } = await query.order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getTodayBookings(roomId: string): Promise<ExtendedBooking[]> {
  const today = new Date().toISOString().split('T')[0]
  return getRoomBookings(roomId, today, today)
}

export async function getWeekBookings(roomId: string): Promise<ExtendedBooking[]> {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1)
  const friday = new Date(now)
  friday.setDate(now.getDate() - now.getDay() + 5)

  const startDate = monday.toISOString().split('T')[0]
  const endDate = friday.toISOString().split('T')[0]

  return getRoomBookings(roomId, startDate, endDate)
}

export async function deleteBooking(bookingId: string, userId: string): Promise<void> {
  // Verify the booking belongs to the user before deleting
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)
    .eq('user_id', userId) // Ensure user can only delete their own bookings

  if (error) throw error
}

export async function updateBooking(
  bookingId: string, 
  userId: string, 
  updates: UpdateBookingRequest
): Promise<void> {
  // If updating times, check for conflicts
  if (updates.start_time || updates.end_time) {
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    const startTime = updates.start_time || existingBooking.start_time
    const endTime = updates.end_time || existingBooking.end_time

    // Check for conflicts (excluding current booking)
    const { data: conflictData, error: conflictError } = await supabase
      .rpc('check_booking_conflict', {
        p_room_id: existingBooking.room_id,
        p_start_time: startTime,
        p_end_time: endTime,
        p_booking_id: bookingId
      })

    if (conflictError) throw conflictError

    if (conflictData) {
      throw new Error('Room is not available for the updated time')
    }
  }

  const { error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function cancelBooking(bookingId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', userId)

  if (error) throw error
}

export async function getBookingById(bookingId: string): Promise<ExtendedBooking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        name,
        capacity,
        location
      ),
      profiles (
        email,
        full_name
      )
    `)
    .eq('id', bookingId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw error
  }
  return data
}

// Get all bookings for a specific date across all rooms
export async function getBookingsForDate(date: string): Promise<ExtendedBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      rooms (
        name,
        capacity,
        location
      ),
      profiles (
        email,
        full_name
      )
    `)
    .gte('start_time', `${date}T00:00:00`)
    .lte('start_time', `${date}T23:59:59`)
    .eq('status', 'confirmed')
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

// Get booking statistics for a user
export async function getUserBookingStats(userId: string): Promise<{
  totalBookings: number
  upcomingBookings: number
  totalHoursBooked: number
  favoriteRoom: string | null
}> {
  const now = new Date().toISOString()

  // Get all user bookings
  const { data: allBookings, error: allError } = await supabase
    .from('bookings')
    .select('*, rooms(name)')
    .eq('user_id', userId)
    .eq('status', 'confirmed')

  if (allError) throw allError

  // Get upcoming bookings
  const { data: upcomingBookings, error: upcomingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .gte('start_time', now)

  if (upcomingError) throw upcomingError

  // Calculate total hours
  const totalHours = allBookings?.reduce((total, booking) => {
    return total + booking.duration_minutes
  }, 0) || 0

  // Find favorite room (most booked)
  const roomCounts: Record<string, number> = {}
  allBookings?.forEach(booking => {
    if (booking.rooms?.name) {
      roomCounts[booking.rooms.name] = (roomCounts[booking.rooms.name] || 0) + 1
    }
  })

  const favoriteRoom = Object.keys(roomCounts).length > 0 
    ? Object.keys(roomCounts).reduce((a, b) => roomCounts[a] > roomCounts[b] ? a : b)
    : null

  return {
    totalBookings: allBookings?.length || 0,
    upcomingBookings: upcomingBookings?.length || 0,
    totalHoursBooked: Math.round(totalHours / 60 * 10) / 10, // Convert to hours with 1 decimal
    favoriteRoom
  }
}

// Quick booking function for immediate time slots
export async function createQuickBooking(
  roomId: string,
  userId: string,
  durationMinutes: number,
  title?: string
): Promise<string> {
  const now = new Date()
  
  // Round to next 15-minute slot
  const minutes = now.getMinutes()
  const roundedMinutes = Math.ceil(minutes / 15) * 15
  now.setMinutes(roundedMinutes, 0, 0)
  
  const endTime = new Date(now)
  endTime.setMinutes(now.getMinutes() + durationMinutes)

  const startDateTime = now.toISOString()
  const endDateTime = endTime.toISOString()

  // Check for conflicts
  const { data: conflictData, error: conflictError } = await supabase
    .rpc('check_booking_conflict', {
      p_room_id: roomId,
      p_start_time: startDateTime,
      p_end_time: endDateTime
    })

  if (conflictError) throw conflictError

  if (conflictData) {
    throw new Error('Room is not available for quick booking')
  }

  // Create the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      room_id: roomId,
      user_id: userId,
      title: title || 'Quick Booking',
      start_time: startDateTime,
      end_time: endDateTime,
      status: 'confirmed'
    })
    .select('id')
    .single()

  if (error) throw error
  return booking.id
}