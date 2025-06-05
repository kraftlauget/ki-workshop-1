'use client'

import { MapPin, Users, Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EquipmentIcons } from '@/components/ui/equipment-icons'
import { FEATURE_LABELS, type Room } from '@/types/database'

interface RoomHeaderProps {
  room: Room
}

export function RoomHeader({ room }: RoomHeaderProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
            <Badge variant="secondary" className="text-sm">
              Active
            </Badge>
          </div>
          
          {room.description && (
            <p className="text-gray-600 mb-4 max-w-2xl">{room.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Capacity */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Capacity</div>
                <div className="font-semibold">{room.capacity} people</div>
              </div>
            </div>

            {/* Location */}
            {room.location && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-semibold">{room.location}</div>
                </div>
              </div>
            )}

            {/* Floor */}
            {room.floor && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Building className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Floor</div>
                  <div className="font-semibold">Floor {room.floor}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Equipment and Features */}
      {(room.equipment?.length > 0 || room.features?.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment */}
            {room.equipment?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Equipment</h3>
                <EquipmentIcons 
                  equipment={room.equipment} 
                  showLabels={true} 
                  className="w-5 h-5"
                />
              </div>
            )}

            {/* Features */}
            {room.features?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {room.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-sm">
                      {FEATURE_LABELS[feature as keyof typeof FEATURE_LABELS] || 
                       feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}