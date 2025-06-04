'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Booking {
  id: string
  title: string | null
  start_time: string
  end_time: string
  created_at: string
  rooms: {
    name: string
    capacity: number
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchBookings()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          rooms (
            name,
            capacity
          )
        `)
        .eq('user_id', user?.id)
        .order('start_time', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setBookings(data || [])
      }
    } catch (err) {
      setError('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const deleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return
    }

    try {
      setDeleteLoading(bookingId)
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) {
        alert('Failed to delete booking: ' + error.message)
      } else {
        // Remove booking from state
        setBookings(prev => prev.filter(booking => booking.id !== bookingId))
      }
    } catch (err) {
      alert('Failed to delete booking')
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading your bookings...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading bookings: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">View and manage your meeting room reservations.</p>
        </div>
        <Link href="/dashboard/book">
          <Button>New Booking</Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't made any room reservations yet.</p>
          <div className="mt-6">
            <Link href="/dashboard/book">
              <Button>Book Your First Room</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => {
              const startFormatted = formatDateTime(booking.start_time)
              const endFormatted = formatDateTime(booking.end_time)
              const upcoming = isUpcoming(booking.start_time)
              
              return (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {booking.title || 'Untitled Meeting'}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          upcoming 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {upcoming ? 'Upcoming' : 'Past'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {booking.rooms.name}
                        </div>
                        <div className="flex items-center">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
                          </svg>
                          {startFormatted.date}
                        </div>
                        <div className="flex items-center">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {startFormatted.time} - {endFormatted.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBooking(booking.id)}
                        disabled={deleteLoading === booking.id}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        {deleteLoading === booking.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}