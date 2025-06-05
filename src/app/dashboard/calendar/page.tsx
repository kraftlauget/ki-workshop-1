'use client'

import { useState } from 'react'
import { WeeklyCalendar } from '@/components/calendar/WeeklyCalendar'
import { QuickBookModal } from '@/components/modals/QuickBookModal'
import type { CalendarBooking } from '@/types/calendar'

export default function CalendarPage() {
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [quickBookModal, setQuickBookModal] = useState<{
    open: boolean
    roomId?: string
    startTime?: string
  }>({ open: false })

  const handleQuickBook = (roomId: string, dateTime: string) => {
    setQuickBookModal({
      open: true,
      roomId,
      startTime: dateTime
    })
  }

  const handleBookingSuccess = () => {
    // Calendar will refresh automatically due to real-time subscriptions
    // or we can trigger a refresh here if needed
  }

  const handleBookingClick = (booking: CalendarBooking) => {
    setSelectedBooking(booking)
    // We'll implement booking details modal later
    console.log('Booking clicked:', booking)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600">
          View all room bookings in a weekly calendar format. Click any empty time slot to quickly book a room.
        </p>
      </div>

      {/* Calendar Component */}
      <div className="h-[calc(100vh-12rem)]">
        <WeeklyCalendar
          onQuickBook={handleQuickBook}
          onBookingClick={handleBookingClick}
        />
      </div>

      {/* Booking details will be shown in a modal/sidebar later */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {selectedBooking.title || 'Untitled Meeting'}
            </h3>
            <div className="space-y-2 text-sm">
              <div><strong>Room:</strong> {selectedBooking.rooms.name}</div>
              <div><strong>Time:</strong> {new Date(selectedBooking.start_time).toLocaleString()} - {new Date(selectedBooking.end_time).toLocaleTimeString()}</div>
              <div><strong>Organizer:</strong> {selectedBooking.profiles.full_name || selectedBooking.profiles.email}</div>
              {selectedBooking.rooms.location && (
                <div><strong>Location:</strong> {selectedBooking.rooms.location}</div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Book Modal */}
      <QuickBookModal
        open={quickBookModal.open}
        onOpenChange={(open) => setQuickBookModal(prev => ({ ...prev, open }))}
        roomId={quickBookModal.roomId}
        startTime={quickBookModal.startTime}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}