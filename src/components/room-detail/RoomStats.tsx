'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getRoomUtilization } from '@/lib/api/rooms'
import type { RoomUtilization } from '@/types/database'

interface RoomStatsProps {
  roomId: string
}

export function RoomStats({ roomId }: RoomStatsProps) {
  const [weeklyStats, setWeeklyStats] = useState<RoomUtilization | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<RoomUtilization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [roomId])

  const fetchStats = async () => {
    try {
      setLoading(true)

      const now = new Date()
      
      // This week stats
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1) // Monday
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 4) // Friday

      // This month stats
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

      const [weekData, monthData] = await Promise.all([
        getRoomUtilization(roomId, weekStart.toISOString().split('T')[0], weekEnd.toISOString().split('T')[0]),
        getRoomUtilization(roomId, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0])
      ])

      setWeeklyStats(weekData)
      setMonthlyStats(monthData)
    } catch (error) {
      console.error('Error fetching room stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Weekly Utilization */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">This Week</div>
              <div className="text-2xl font-bold">
                {weeklyStats?.utilization_percentage.toFixed(0) || 0}%
              </div>
              <div className="text-xs text-gray-400">Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Utilization */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">This Month</div>
              <div className="text-2xl font-bold">
                {monthlyStats?.utilization_percentage.toFixed(0) || 0}%
              </div>
              <div className="text-xs text-gray-400">Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Hours */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Weekly Hours</div>
              <div className="text-2xl font-bold">
                {weeklyStats?.booked_hours || 0}h
              </div>
              <div className="text-xs text-gray-400">
                of {weeklyStats?.total_hours || 50}h available
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-2xl font-bold">Active</div>
              <div className="text-xs text-gray-400">Available for booking</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}