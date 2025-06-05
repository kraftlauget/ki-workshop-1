'use client'

import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { ExtendedBooking } from '@/types/database'

interface UseRealtimeBookingsProps {
  onBookingInsert?: (booking: any) => void
  onBookingUpdate?: (booking: any) => void
  onBookingDelete?: (booking: any) => void
  enabled?: boolean
}

export function useRealtimeBookings({
  onBookingInsert,
  onBookingUpdate,
  onBookingDelete,
  enabled = true
}: UseRealtimeBookingsProps = {}) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Create a channel for booking changes
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking inserted:', payload)
          onBookingInsert?.(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking updated:', payload)
          onBookingUpdate?.(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking deleted:', payload)
          onBookingDelete?.(payload.old)
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [enabled, onBookingInsert, onBookingUpdate, onBookingDelete])

  // Function to manually unsubscribe
  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  return { unsubscribe }
}

// Hook specifically for calendar real-time updates
export function useRealtimeCalendar(onDataChange?: () => void) {
  return useRealtimeBookings({
    onBookingInsert: () => onDataChange?.(),
    onBookingUpdate: () => onDataChange?.(),
    onBookingDelete: () => onDataChange?.(),
  })
}

// Hook specifically for user's personal bookings
export function useRealtimeUserBookings(userId: string, onDataChange?: () => void) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // Create a channel specifically for this user's bookings
    const channel = supabase
      .channel(`user-bookings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('User booking changed:', payload)
          onDataChange?.()
        }
      )
      .subscribe((status) => {
        console.log('User bookings subscription status:', status)
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, onDataChange])

  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  return { unsubscribe }
}