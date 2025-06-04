'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Meeting Room Booking
        </h1>
        <p className="mt-2 text-gray-600">
          Hello {user?.email}! Manage your meeting room bookings below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Browse Rooms Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Browse Rooms</h3>
                <p className="text-sm text-gray-500">View all available meeting rooms</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/rooms">
                <Button className="w-full">
                  View Rooms
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Book Room Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Book Room</h3>
                <p className="text-sm text-gray-500">Schedule a new meeting</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/book">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* My Bookings Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-500">View and manage your bookings</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/dashboard/bookings">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Bookings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}