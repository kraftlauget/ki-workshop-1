'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface Room {
  id: string
  name: string
  capacity: number
}

export default function BookRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchRooms()
    
    // Pre-select room if passed via URL parameter
    const roomParam = searchParams.get('room')
    if (roomParam) {
      setSelectedRoomId(roomParam)
    }
  }, [searchParams])

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name')

      if (error) {
        setError(error.message)
      } else {
        setRooms(data || [])
      }
    } catch (err) {
      setError('Failed to fetch rooms')
    }
  }

  const checkConflict = async (roomId: string, startDateTime: string, endDateTime: string) => {
    const { data, error } = await supabase.rpc('check_booking_conflict', {
      p_room_id: roomId,
      p_start_time: startDateTime,
      p_end_time: endDateTime
    })

    if (error) {
      throw new Error('Failed to check for conflicts')
    }

    return data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedRoomId || !startDate || !startTime || !endDate || !endTime) {
      setError('Please fill in all required fields')
      return
    }

    const startDateTime = `${startDate}T${startTime}:00`
    const endDateTime = `${endDate}T${endTime}:00`

    if (new Date(endDateTime) <= new Date(startDateTime)) {
      setError('End time must be after start time')
      return
    }

    try {
      setLoading(true)

      // Check for conflicts
      const hasConflict = await checkConflict(selectedRoomId, startDateTime, endDateTime)
      if (hasConflict) {
        setError('This room is already booked for the selected time. Please choose a different time.')
        return
      }

      // Create booking
      const { error: insertError } = await supabase
        .from('bookings')
        .insert({
          room_id: selectedRoomId,
          user_id: user?.id,
          title: title || null,
          start_time: startDateTime,
          end_time: endDateTime
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setSuccess('Booking created successfully!')
        setTimeout(() => {
          router.push('/dashboard/bookings')
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book a Meeting Room</h1>
        <p className="text-gray-600">Schedule your meeting by filling out the form below.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Room *
            </label>
            <select
              id="room"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a room...</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title (Optional)
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Team Standup, Client Meeting"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating Booking...' : 'Book Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}