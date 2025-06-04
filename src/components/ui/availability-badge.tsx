import { Badge } from '@/components/ui/badge'
import { Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvailabilityBadgeProps {
  isAvailable: boolean
  nextAvailable?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AvailabilityBadge({ 
  isAvailable, 
  nextAvailable, 
  className,
  size = 'md'
}: AvailabilityBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-xs px-2.5 py-1.5', 
    lg: 'text-sm px-3 py-2'
  }

  const iconSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  if (isAvailable) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "text-green-700 border-green-200 bg-green-50 font-medium",
          sizeClasses[size],
          className
        )}
      >
        <Circle className={cn("fill-green-500 mr-1.5", iconSizes[size])} />
        Available
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-red-700 border-red-200 bg-red-50 font-medium",
        sizeClasses[size],
        className
      )}
    >
      <Circle className={cn("fill-red-500 mr-1.5", iconSizes[size])} />
      {nextAvailable ? (
        <span className="flex items-center gap-1">
          <Clock className={cn("", iconSizes[size])} />
          {nextAvailable}
        </span>
      ) : (
        'Busy'
      )}
    </Badge>
  )
}

// Variant for showing detailed status
interface DetailedAvailabilityBadgeProps {
  status: 'available' | 'busy' | 'available_soon' | 'unknown'
  nextAvailable?: string
  currentBooking?: string
  className?: string
}

export function DetailedAvailabilityBadge({
  status,
  nextAvailable,
  currentBooking,
  className
}: DetailedAvailabilityBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          color: 'text-green-700 border-green-200 bg-green-50',
          icon: <Circle className="w-2 h-2 fill-green-500 mr-1.5" />,
          text: 'Available Now'
        }
      case 'busy':
        return {
          color: 'text-red-700 border-red-200 bg-red-50',
          icon: <Circle className="w-2 h-2 fill-red-500 mr-1.5" />,
          text: currentBooking || 'Busy'
        }
      case 'available_soon':
        return {
          color: 'text-orange-700 border-orange-200 bg-orange-50',
          icon: <Clock className="w-2 h-2 mr-1.5" />,
          text: `Free at ${nextAvailable}`
        }
      default:
        return {
          color: 'text-gray-700 border-gray-200 bg-gray-50',
          icon: <Circle className="w-2 h-2 fill-gray-400 mr-1.5" />,
          text: 'Status unknown'
        }
    }
  }

  const { color, icon, text } = getStatusConfig()

  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium", color, className)}
    >
      {icon}
      {text}
    </Badge>
  )
}