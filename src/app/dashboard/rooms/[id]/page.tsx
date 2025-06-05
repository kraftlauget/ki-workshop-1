'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RoomHeader } from '@/components/room-detail/RoomHeader'
import { RoomStats } from '@/components/room-detail/RoomStats'
import { TodayTimeline } from '@/components/room-detail/TodayTimeline'
import { QuickBookSlots } from '@/components/room-detail/QuickBookSlots'
import { QuickBookModal } from '@/components/modals/QuickBookModal'
import { getRoomById } from '@/lib/api/rooms'
import type { Room } from '@/types/database'

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickBookModal, setQuickBookModal] = useState<{
    open: boolean
    roomId?: string
    startTime?: string
    duration?: number
  }>({ open: false })

  useEffect(() => {
    fetchRoom()
  }, [roomId])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      const roomData = await getRoomById(roomId)
      
      if (!roomData) {
        setError('Room not found')
        return
      }
      
      setRoom(roomData)
    } catch (err: any) {
      setError(err.message || 'Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickBook = (roomId: string, dateTime: string, duration: number = 60) => {
    setQuickBookModal({
      open: true,
      roomId,
      startTime: dateTime,
      duration
    })
  }

  const handleBookingSuccess = () => {
    // Refresh the room data to show updated bookings
    fetchRoom()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rooms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-lg">Loading room details...</div>
        </div>
        
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/rooms">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rooms
          </Button>
        </Link>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="font-medium">Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/rooms">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        
        <Link href={`/dashboard/book?room=${room.id}`}>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Book This Room
          </Button>
        </Link>
      </div>

      {/* Room Header */}
      <RoomHeader room={room} />

      {/* Room Statistics */}
      <RoomStats roomId={room.id} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today's Schedule
          </TabsTrigger>
          <TabsTrigger value="quick-book" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Quick Book
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TodayTimeline 
                roomId={room.id} 
                onQuickBook={handleQuickBook}
              />
            </div>
            <div>
              <QuickBookSlots 
                roomId={room.id}
                onQuickBook={handleQuickBook}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quick-book" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickBookSlots 
              roomId={room.id}
              onQuickBook={handleQuickBook}
            />
            
            <div className="md:col-span-1 lg:col-span-2">
              <TodayTimeline 
                roomId={room.id} 
                onQuickBook={handleQuickBook}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Book Modal */}
      <QuickBookModal
        open={quickBookModal.open}
        onOpenChange={(open) => setQuickBookModal(prev => ({ ...prev, open }))}
        roomId={quickBookModal.roomId}
        startTime={quickBookModal.startTime}
        duration={quickBookModal.duration}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}