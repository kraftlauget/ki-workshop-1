import { 
  Projector, 
  Monitor, 
  Mic, 
  Wifi, 
  Volume2,
  Video,
  PenTool,
  Clipboard,
  Phone,
  Presentation,
  LucideIcon
} from 'lucide-react'
import { EQUIPMENT_LABELS, type EquipmentType } from '@/types/database'

const equipmentIcons: Record<EquipmentType, LucideIcon> = {
  projector: Projector,
  tv_screen: Monitor,
  sound_system: Volume2,
  microphone: Mic,
  wifi: Wifi,
  video_conference: Video,
  whiteboard: PenTool,
  flip_chart: Clipboard,
  phone_conference: Phone,
  wireless_presentation: Presentation
}

interface EquipmentIconsProps {
  equipment: string[]
  className?: string
  showLabels?: boolean
  maxItems?: number
}

export function EquipmentIcons({ 
  equipment, 
  className = "w-4 h-4", 
  showLabels = false,
  maxItems 
}: EquipmentIconsProps) {
  const displayEquipment = maxItems ? equipment.slice(0, maxItems) : equipment
  const remainingCount = maxItems ? Math.max(0, equipment.length - maxItems) : 0

  return (
    <div className="flex flex-wrap gap-2">
      {displayEquipment.map((item) => {
        const Icon = equipmentIcons[item as EquipmentType]
        if (!Icon) return null
        
        const label = EQUIPMENT_LABELS[item as EquipmentType] || item.replace(/_/g, ' ')
        
        return (
          <div 
            key={item} 
            className="flex items-center gap-1"
            title={showLabels ? undefined : label}
          >
            <Icon className={className} />
            {showLabels && (
              <span className="text-xs text-gray-600 capitalize">
                {label}
              </span>
            )}
          </div>
        )
      })}
      
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 flex items-center">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}