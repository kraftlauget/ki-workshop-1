// Enhanced API utilities for Phase 2
export * from './rooms'
export * from './bookings'

// Re-export commonly used functions for convenience
export { 
  getRooms, 
  getRoomById, 
  checkRoomAvailableAt,
  getRoomsWithAvailability,
  getRoomAvailability,
  getRoomUtilization 
} from './rooms'

export { 
  createBooking, 
  getUserBookings, 
  deleteBooking,
  getRoomBookings,
  getTodayBookings,
  getWeekBookings,
  createQuickBooking 
} from './bookings'