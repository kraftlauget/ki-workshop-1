import { supabase } from '@/lib/supabase'
import type { 
  Room, 
  RoomFilters, 
  RoomAvailability, 
  RoomUtilization,
  NextAvailableSlot 
} from '@/types/database'

export async function getRooms(filters?: RoomFilters): Promise<Room[]> {
  let query = supabase
    .from('rooms')
    .select('*')
    .eq('is_active', true)

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
  }

  if (filters?.capacity_min) {
    query = query.gte('capacity', filters.capacity_min)
  }

  if (filters?.capacity_max) {
    query = query.lte('capacity', filters.capacity_max)
  }

  if (filters?.location) {
    query = query.eq('location', filters.location)
  }

  if (filters?.floor) {
    query = query.eq('floor', filters.floor)
  }

  if (filters?.equipment && filters.equipment.length > 0) {
    query = query.contains('equipment', filters.equipment)
  }

  if (filters?.features && filters.features.length > 0) {
    query = query.contains('features', filters.features)
  }

  // If filtering by availability at specific time
  if (filters?.available_at) {
    // This would require a more complex query or post-processing
    // For now, we'll handle this in the component
  }

  const { data, error } = await query.order('name')

  if (error) throw error
  return data || []
}

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No rows returned
    }
    throw error
  }
  return data
}

export async function getRoomAvailability(
  roomId: string, 
  date: string
): Promise<RoomAvailability[]> {
  const { data, error } = await supabase
    .rpc('get_room_availability', {
      p_room_id: roomId,
      p_date: date
    })

  if (error) throw error
  return data || []
}

export async function getRoomUtilization(
  roomId: string,
  startDate: string,
  endDate: string
): Promise<RoomUtilization | null> {
  const { data, error } = await supabase
    .rpc('get_room_utilization', {
      p_room_id: roomId,
      p_start_date: startDate,
      p_end_date: endDate
    })

  if (error) throw error
  return data?.[0] || null
}

export async function checkRoomAvailableAt(
  roomId: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_booking_conflict', {
      p_room_id: roomId,
      p_start_time: startTime,
      p_end_time: endTime
    })

  if (error) throw error
  return !data // function returns true if conflict exists
}

export async function getNextAvailableSlot(
  roomId: string,
  fromTime: string,
  durationMinutes: number = 60
): Promise<NextAvailableSlot | null> {
  const { data, error } = await supabase
    .rpc('get_next_available_slot', {
      p_room_id: roomId,
      p_from_time: fromTime,
      p_duration_minutes: durationMinutes
    })

  if (error) throw error
  return data?.[0] || null
}

// Get unique locations for filtering
export async function getRoomLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('location')
    .eq('is_active', true)
    .not('location', 'is', null)

  if (error) throw error
  
  const locations = [...new Set(data?.map(room => room.location).filter(Boolean))]
  return locations.sort()
}

// Get unique equipment types for filtering
export async function getRoomEquipment(): Promise<string[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('equipment')
    .eq('is_active', true)

  if (error) throw error
  
  const allEquipment = data?.flatMap(room => room.equipment || []) || []
  const uniqueEquipment = [...new Set(allEquipment)]
  return uniqueEquipment.sort()
}

// Get unique features for filtering
export async function getRoomFeatures(): Promise<string[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('features')
    .eq('is_active', true)

  if (error) throw error
  
  const allFeatures = data?.flatMap(room => room.features || []) || []
  const uniqueFeatures = [...new Set(allFeatures)]
  return uniqueFeatures.sort()
}

// Get room capacity range for filtering
export async function getRoomCapacityRange(): Promise<{ min: number; max: number }> {
  const { data, error } = await supabase
    .from('rooms')
    .select('capacity')
    .eq('is_active', true)
    .order('capacity')

  if (error) throw error
  
  if (!data || data.length === 0) {
    return { min: 1, max: 20 }
  }

  return {
    min: data[0].capacity,
    max: data[data.length - 1].capacity
  }
}

// Check if room is currently available (right now)
export async function isRoomCurrentlyAvailable(roomId: string): Promise<boolean> {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setHours(now.getHours() + 1, 0, 0, 0)

  return checkRoomAvailableAt(
    roomId,
    now.toISOString(),
    nextHour.toISOString()
  )
}

// Get rooms with their current availability status
export async function getRoomsWithAvailability(filters?: RoomFilters): Promise<(Room & { isCurrentlyAvailable: boolean })[]> {
  const rooms = await getRooms(filters)
  
  const roomsWithAvailability = await Promise.all(
    rooms.map(async (room) => {
      const isCurrentlyAvailable = await isRoomCurrentlyAvailable(room.id)
      return { ...room, isCurrentlyAvailable }
    })
  )

  return roomsWithAvailability
}