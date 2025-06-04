'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EQUIPMENT_LABELS, FEATURE_LABELS, type RoomFilters } from '@/types/database'

interface FilterBarProps {
  filters: RoomFilters
  onFiltersChange: (filters: RoomFilters) => void
  locations: string[]
  equipment: string[]
  features: string[]
  capacityRange: { min: number; max: number }
}

export function FilterBar({ 
  filters, 
  onFiltersChange, 
  locations, 
  equipment,
  features,
  capacityRange
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof RoomFilters, value: any) => {
    const newFilters = { ...filters }
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const clearSpecificFilter = (key: keyof RoomFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof RoomFilters]
    return value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)
  }).length

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="space-y-4">
      {/* Main search and filter toggle */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search rooms by name, description, or location..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeFilterCount}
            </Badge>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearSpecificFilter('search')}
              />
            </Badge>
          )}
          
          {(filters.capacity_min || filters.capacity_max) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Capacity: {filters.capacity_min || capacityRange.min}-{filters.capacity_max || capacityRange.max}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => {
                  clearSpecificFilter('capacity_min')
                  clearSpecificFilter('capacity_max')
                }}
              />
            </Badge>
          )}

          {filters.location && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Location: {filters.location}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearSpecificFilter('location')}
              />
            </Badge>
          )}

          {filters.floor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Floor: {filters.floor}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearSpecificFilter('floor')}
              />
            </Badge>
          )}

          {filters.equipment && filters.equipment.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Equipment: {filters.equipment.map(eq => EQUIPMENT_LABELS[eq as keyof typeof EQUIPMENT_LABELS] || eq).join(', ')}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearSpecificFilter('equipment')}
              />
            </Badge>
          )}

          {filters.features && filters.features.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Features: {filters.features.map(feat => FEATURE_LABELS[feat as keyof typeof FEATURE_LABELS] || feat).join(', ')}
              <X 
                className="w-3 h-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearSpecificFilter('features')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
          {/* Capacity Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Capacity</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.capacity_min || ''}
                onChange={(e) => handleFilterChange('capacity_min', parseInt(e.target.value) || undefined)}
                min={capacityRange.min}
                max={capacityRange.max}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.capacity_max || ''}
                onChange={(e) => handleFilterChange('capacity_max', parseInt(e.target.value) || undefined)}
                min={capacityRange.min}
                max={capacityRange.max}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Range: {capacityRange.min}-{capacityRange.max} people
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Select
              value={filters.location || ''}
              onValueChange={(value) => handleFilterChange('location', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any location</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Floor</label>
            <Select
              value={filters.floor?.toString() || ''}
              onValueChange={(value) => handleFilterChange('floor', parseInt(value) || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any floor</SelectItem>
                <SelectItem value="1">Floor 1</SelectItem>
                <SelectItem value="2">Floor 2</SelectItem>
                <SelectItem value="3">Floor 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Equipment Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Equipment</label>
            <Select
              value={filters.equipment?.[0] || ''}
              onValueChange={(value) => handleFilterChange('equipment', value ? [value] : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any equipment</SelectItem>
                {equipment.map((item) => (
                  <SelectItem key={item} value={item}>
                    {EQUIPMENT_LABELS[item as keyof typeof EQUIPMENT_LABELS] || item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}