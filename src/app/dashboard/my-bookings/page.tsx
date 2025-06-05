'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, TrendingUp, MapPin, Users, Star, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EditBookingModal } from '@/components/modals/EditBookingModal'
import { CancelBookingModal } from '@/components/modals/CancelBookingModal'
import { useRealtimeUserBookings } from '@/hooks/useRealtimeBookings'
import { getUserBookings, getUserBookingStats } from '@/lib/api/bookings'
import { useAuth } from '@/contexts/AuthContext'
import type { ExtendedBooking } from '@/types/database'

interface BookingStats {
  totalBookings: number
  upcomingBookings: number
  totalHoursBooked: number
  favoriteRoom: string | null
}

export default function MyBookingsPage() {
  const { user } = useAuth()
  const [upcomingBookings, setUpcomingBookings] = useState<ExtendedBooking[]>([])
  const [allBookings, setAllBookings] = useState<ExtendedBooking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editModal, setEditModal] = useState<{
    open: boolean
    booking: ExtendedBooking | null
  }>({ open: false, booking: null })
  const [cancelModal, setCancelModal] = useState<{
    open: boolean
    booking: ExtendedBooking | null
  }>({ open: false, booking: null })

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  // Enable real-time updates for user's bookings
  useRealtimeUserBookings(user?.id || '', fetchUserData)

  const fetchUserData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const [upcoming, all, userStats] = await Promise.all([
        getUserBookings(user.id, false), // Only upcoming
        getUserBookings(user.id, true),  // All bookings including history
        getUserBookingStats(user.id)
      ])

      setUpcomingBookings(upcoming)
      setAllBookings(all)
      setStats(userStats)
    } catch (err: any) {
      setError(err.message || 'Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditBooking = (booking: ExtendedBooking) => {
    setEditModal({ open: true, booking })
  }

  const handleCancelBooking = (booking: ExtendedBooking) => {
    setCancelModal({ open: true, booking })
  }

  const handleModalSuccess = () => {
    // Refresh data after successful edit/cancel
    fetchUserData()
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    let dateStr = ''
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow'
    } else {
      dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }

    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `${dateStr} at ${timeStr}`
  }

  const getDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.round(diffMs / (1000 * 60))
    
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getBookingStatus = (startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'ongoing' 
    return 'completed'
  }

  const getStatusBadge = (startTime: string, endTime: string) => {
    const status = getBookingStatus(startTime, endTime)
    
    switch (status) {
      case 'upcoming':
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Upcoming</Badge>
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Ongoing</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">Loading your booking dashboard...</p>
          </div>
        </div>
        
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">
            Manage your meeting room reservations and view booking analytics
          </p>
        </div>
        
        <Link href="/dashboard/book">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Bookings</div>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Upcoming</div>
                  <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Hours Booked</div>
                  <div className="text-2xl font-bold">{stats.totalHoursBooked}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Favorite Room</div>
                  <div className="text-lg font-bold text-purple-700">
                    {stats.favoriteRoom || 'None yet'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bookings Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            History ({allBookings.length - upcomingBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-gray-500 mb-4">
                  You don't have any upcoming meeting room reservations.
                </p>
                <Link href="/dashboard/book">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Book a Room
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {booking.title || 'Untitled Meeting'}
                          </h3>
                          {getStatusBadge(booking.start_time, booking.end_time)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{booking.rooms.name}</span>
                            {booking.rooms.location && (
                              <span>• {booking.rooms.location}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(booking.start_time)}</span>
                            <span>• {getDuration(booking.start_time, booking.end_time)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>Room capacity: {booking.rooms.capacity} people</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditBooking(booking)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleCancelBooking(booking)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {allBookings.filter(b => getBookingStatus(b.start_time, b.end_time) === 'completed').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No booking history
                </h3>
                <p className="text-gray-500">
                  Your completed bookings will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {allBookings
                .filter(b => getBookingStatus(b.start_time, b.end_time) === 'completed')
                .map((booking) => (
                <Card key={booking.id} className="opacity-80">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {booking.title || 'Untitled Meeting'}
                          </h3>
                          {getStatusBadge(booking.start_time, booking.end_time)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{booking.rooms.name}</span>
                            {booking.rooms.location && (
                              <span>• {booking.rooms.location}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(booking.start_time)}</span>
                            <span>• {getDuration(booking.start_time, booking.end_time)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Booking Modal */}
      <EditBookingModal
        open={editModal.open}
        onOpenChange={(open) => setEditModal(prev => ({ ...prev, open }))}
        booking={editModal.booking}
        onSuccess={handleModalSuccess}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        open={cancelModal.open}
        onOpenChange={(open) => setCancelModal(prev => ({ ...prev, open }))}
        booking={cancelModal.booking}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}