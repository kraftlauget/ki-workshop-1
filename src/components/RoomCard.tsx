'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Users, Clock, Building, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AvailabilityBadge } from '@/components/ui/availability-badge'
import { EquipmentIcons } from '@/components/ui/equipment-icons'
import { checkRoomAvailableAt, getNextAvailableSlot } from '@/lib/api/rooms'
import { FEATURE_LABELS, type Room } from '@/types/database'

interface RoomCardProps {
  room: Room
  showQuickBook?: boolean
  compact?: boolean
  onQuickBook?: (roomId: string) => void
}

export function RoomCard({ 
  room, 
  showQuickBook = true, 
  compact = false,
  onQuickBook 
}: RoomCardProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [nextSlot, setNextSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkCurrentAvailability()
  }, [room.id])

  const checkCurrentAvailability = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const nextHour = new Date(now)
      nextHour.setHours(now.getHours() + 1, 0, 0, 0)

      const available = await checkRoomAvailableAt(
        room.id,
        now.toISOString(),
        nextHour.toISOString()
      )

      setIsAvailable(available)

      if (!available) {
        // Get next available slot
        const nextAvailable = await getNextAvailableSlot(
          room.id,
          now.toISOString(),
          60
        )

        if (nextAvailable) {
          const nextTime = new Date(nextAvailable.next_available_time)
          setNextSlot(nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickBook = () => {
    if (onQuickBook) {
      onQuickBook(room.id)
    }
  }

  const getPopularFeatures = () => {
    const popularFeatures = ['natural_light', 'air_conditioning', 'video_conference', 'city_view']
    return room.features?.filter(feature => popularFeatures.includes(feature)) || []
  }

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{room.name}</h3>
            {!loading && isAvailable !== null && (
              <AvailabilityBadge 
                isAvailable={isAvailable} 
                nextAvailable={nextSlot || undefined}
                size="sm"
              />
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{room.capacity}</span>
            </div>
            {room.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{room.location}</span>
              </div>
            )}
          </div>

          {room.equipment && room.equipment.length > 0 && (
            <div className="mb-3">
              <EquipmentIcons equipment={room.equipment} maxItems={4} />
            </div>
          )}

          <div className="flex gap-2">
            <Link href={`/dashboard/rooms/${room.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Details
              </Button>
            </Link>
            {showQuickBook && (
              <Link href={`/dashboard/book?room=${room.id}`} className="flex-1">
                <Button 
                  size="sm"
                  className="w-full" 
                  disabled={isAvailable === false || loading}
                >
                  {loading ? '...' : isAvailable === false ? 'Busy' : 'Book'}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {room.name}
            </CardTitle>
            {room.floor && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Building className="w-3 h-3" />
                <span>Floor {room.floor}</span>
              </div>
            )}
          </div>
          {!loading && isAvailable !== null && (
            <AvailabilityBadge 
              isAvailable={isAvailable} 
              nextAvailable={nextSlot || undefined}
            />
          )}
        </div>
        
        {room.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
            {room.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Room Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.capacity} people</span>
          </div>
          
          {room.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{room.location}</span>
            </div>
          )}
        </div>

        {/* Equipment */}
        {room.equipment && room.equipment.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Equipment</div>
            <EquipmentIcons 
              equipment={room.equipment} 
              showLabels={false}
              maxItems={6}
            />
          </div>
        )}

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-700 mb-2">Features</div>
            <div className="flex flex-wrap gap-1">
              {getPopularFeatures().slice(0, 3).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS] || feature.replace(/_/g, ' ')}
                </Badge>
              ))}
              {room.features.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{room.features.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        <Link href={`/dashboard/rooms/${room.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
        
        {showQuickBook && (
          <div className="flex-1">
            {onQuickBook ? (
              <Button 
                className="w-full" 
                disabled={isAvailable === false || loading}
                onClick={handleQuickBook}
              >
                {loading ? 'Checking...' : isAvailable === false ? 'Busy' : 'Quick Book'}
              </Button>
            ) : (
              <Link href={`/dashboard/book?room=${room.id}`}>
                <Button 
                  className="w-full" 
                  disabled={isAvailable === false || loading}
                >
                  {loading ? 'Checking...' : isAvailable === false ? 'Busy' : 'Book Now'}
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}