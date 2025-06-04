'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FilterBar } from '@/components/ui/filter-bar'
import { RoomCard } from '@/components/RoomCard'
import { Badge } from '@/components/ui/badge'
import { Grid, List, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { 
  getRooms, 
  getRoomLocations, 
  getRoomEquipment, 
  getRoomFeatures,
  getRoomCapacityRange 
} from '@/lib/api/rooms'
import type { Room, RoomFilters } from '@/types/database'

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter and view states
  const [filters, setFilters] = useState<RoomFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Filter options
  const [locations, setLocations] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [capacityRange, setCapacityRange] = useState({ min: 1, max: 20 })

  useEffect(() => {
    fetchRoomsAndFilters()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [rooms, filters])

  const fetchRoomsAndFilters = async () => {
    try {
      setLoading(true)
      
      const [
        roomsData,
        locationsData,
        equipmentData,
        featuresData,
        capacityData
      ] = await Promise.all([
        getRooms(),
        getRoomLocations(),
        getRoomEquipment(),
        getRoomFeatures(),
        getRoomCapacityRange()
      ])

      setRooms(roomsData)
      setLocations(locationsData)
      setEquipment(equipmentData)
      setFeatures(featuresData)
      setCapacityRange(capacityData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...rooms]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm) ||
        room.description?.toLowerCase().includes(searchTerm) ||
        room.location?.toLowerCase().includes(searchTerm)
      )
    }

    // Apply capacity filters
    if (filters.capacity_min) {
      filtered = filtered.filter(room => room.capacity >= filters.capacity_min!)
    }
    if (filters.capacity_max) {
      filtered = filtered.filter(room => room.capacity <= filters.capacity_max!)
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(room => room.location === filters.location)
    }

    // Apply floor filter
    if (filters.floor) {
      filtered = filtered.filter(room => room.floor === filters.floor)
    }

    // Apply equipment filter
    if (filters.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter(room =>
        filters.equipment!.every(eq => room.equipment?.includes(eq))
      )
    }

    // Apply features filter
    if (filters.features && filters.features.length > 0) {
      filtered = filtered.filter(room =>
        filters.features!.every(feat => room.features?.includes(feat))
      )
    }

    setFilteredRooms(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg">Loading rooms...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading rooms: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Rooms</h1>
          <p className="text-gray-600">Browse available meeting rooms and book one for your meeting.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          
          <Link href="/dashboard/book">
            <Button>Book a Room</Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        locations={locations}
        equipment={equipment}
        features={features}
        capacityRange={capacityRange}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredRooms.length} of {rooms.length} rooms
          </span>
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary">
              Filtered
            </Badge>
          )}
        </div>
      </div>

      {/* Room Display */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {Object.keys(filters).length > 0 ? 'No rooms match your filters' : 'No rooms available'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {Object.keys(filters).length > 0 
              ? 'Try adjusting your search criteria or clearing filters.' 
              : 'No meeting rooms have been set up yet.'}
          </p>
          {Object.keys(filters).length > 0 && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => setFilters({})}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredRooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              compact={viewMode === 'list'}
              showQuickBook={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}