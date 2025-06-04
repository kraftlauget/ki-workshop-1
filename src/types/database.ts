// Enhanced TypeScript type definitions for Phase 2

export interface Room {
  id: string
  name: string
  capacity: number
  description: string | null
  location: string | null
  equipment: string[]
  features: string[]
  image_url: string | null
  floor: number | null
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  room_id: string
  user_id: string
  title: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  status: 'confirmed' | 'cancelled' | 'pending'
  created_at: string
}

export interface ExtendedBooking extends Booking {
  rooms: {
    name: string
    capacity: number
    location: string | null
  }
  profiles: {
    email: string
    full_name: string | null
  }
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

// Room availability and utilization types
export interface RoomAvailability {
  hour_slot: number
  is_available: boolean
  booking_id: string | null
  booking_title: string | null
}

export interface RoomUtilization {
  total_hours: number
  booked_hours: number
  utilization_percentage: number
}

export interface NextAvailableSlot {
  next_available_time: string
  next_available_end: string
}

// Form and filter types
export interface BookingFormData {
  room_id: string
  title: string
  start_date: string
  start_time: string
  end_date: string
  end_time: string
  duration_preset?: number // minutes
  attendee_count?: number
  equipment_required?: string[]
}

export interface RoomFilters {
  search?: string
  capacity_min?: number
  capacity_max?: number
  equipment?: string[]
  features?: string[]
  location?: string
  floor?: number
  available_at?: string // ISO datetime
}

// Quick booking types
export interface QuickBookingSlot {
  start_time: string
  end_time: string
  duration_minutes: number
  is_available: boolean
}

export interface DurationPreset {
  label: string
  minutes: number
  popular?: boolean
}

// Equipment and features enums for consistency
export const EQUIPMENT_TYPES = [
  'projector',
  'tv_screen',
  'sound_system',
  'microphone',
  'whiteboard',
  'flip_chart',
  'video_conference',
  'phone_conference',
  'wireless_presentation',
  'wifi'
] as const

export const FEATURE_TYPES = [
  'natural_light',
  'air_conditioning',
  'sound_proofing',
  'kitchen_access',
  'city_view',
  'quiet_zone',
  'executive_access',
  'premium_furniture',
  'private_entrance',
  'flexible_seating',
  'creative_tools',
  'standing_desks',
  'privacy_glass',
  'classroom_setup',
  'parking_nearby',
  'coffee_station'
] as const

export type EquipmentType = typeof EQUIPMENT_TYPES[number]
export type FeatureType = typeof FEATURE_TYPES[number]

// View and component types
export interface RoomCardProps {
  room: Room
  showQuickBook?: boolean
  onQuickBook?: (roomId: string) => void
}

export interface RoomDetailViewType {
  today: 'today'
  week: 'week'
}

export interface FilterBarState {
  isExpanded: boolean
  activeFilters: number
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// Real-time subscription types
export interface RealtimeBookingEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: Booking
  old?: Booking
}

export interface RealtimeRoomEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: Room
  old?: Room
}

// Utility types for better type safety
export type BookingStatus = Booking['status']
export type CreateBookingRequest = Omit<Booking, 'id' | 'created_at' | 'duration_minutes'>
export type UpdateBookingRequest = Partial<Pick<Booking, 'title' | 'start_time' | 'end_time'>>

// Component state types
export interface UseRoomAvailabilityState {
  isAvailable: boolean | null
  nextSlot: string | null
  loading: boolean
  error: string | null
}

export interface UseBookingFormState {
  formData: BookingFormData
  errors: Record<string, string>
  isSubmitting: boolean
  conflictCheck: {
    hasConflict: boolean
    loading: boolean
  }
}

// Common duration presets
export const DURATION_PRESETS: DurationPreset[] = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30, popular: true },
  { label: '1 hour', minutes: 60, popular: true },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120, popular: true },
  { label: '3 hours', minutes: 180 },
  { label: '4 hours', minutes: 240 },
  { label: 'All day', minutes: 480 }
]

// Common capacity ranges for filtering
export const CAPACITY_RANGES = [
  { label: '1-2 people', min: 1, max: 2 },
  { label: '3-6 people', min: 3, max: 6 },
  { label: '7-12 people', min: 7, max: 12 },
  { label: '13-20 people', min: 13, max: 20 },
  { label: '20+ people', min: 20, max: 100 }
]

// Equipment labels for display
export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  projector: 'Projector',
  tv_screen: 'TV Screen',
  sound_system: 'Sound System',
  microphone: 'Microphone',
  whiteboard: 'Whiteboard',
  flip_chart: 'Flip Chart',
  video_conference: 'Video Conference',
  phone_conference: 'Phone Conference',
  wireless_presentation: 'Wireless Presentation',
  wifi: 'WiFi'
}

// Feature labels for display
export const FEATURE_LABELS: Record<FeatureType, string> = {
  natural_light: 'Natural Light',
  air_conditioning: 'Air Conditioning',
  sound_proofing: 'Sound Proofing',
  kitchen_access: 'Kitchen Access',
  city_view: 'City View',
  quiet_zone: 'Quiet Zone',
  executive_access: 'Executive Access',
  premium_furniture: 'Premium Furniture',
  private_entrance: 'Private Entrance',
  flexible_seating: 'Flexible Seating',
  creative_tools: 'Creative Tools',
  standing_desks: 'Standing Desks',
  privacy_glass: 'Privacy Glass',
  classroom_setup: 'Classroom Setup',
  parking_nearby: 'Parking Nearby',
  coffee_station: 'Coffee Station'
}