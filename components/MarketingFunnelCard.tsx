'use client'

import { Calendar, Users } from 'lucide-react'

interface MarketingFunnelCardProps {
  leadBookedPercent: number | null
  bookedShowPercent: number | null
  className?: string
}

export function MarketingFunnelCard({ leadBookedPercent, bookedShowPercent, className = '' }: MarketingFunnelCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Lead Conversion Rates</h3>
        <p className="text-sm text-gray-600 mt-1">Key marketing funnel metrics</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Lead Booked Percentage */}
        <div className="text-center">
          <div className="bg-blue-50 rounded-lg p-4 mb-3">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {leadBookedPercent !== null ? `${(leadBookedPercent * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-2">Lead Booking Rate</div>
          <div className="text-xs text-gray-500 mt-1">% of leads that book appointments</div>
        </div>

        {/* Booked Show Percentage */}
        <div className="text-center">
          <div className="bg-green-50 rounded-lg p-4 mb-3">
            <Users className="h-8 w-8 text-green-600 mx-auto" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {bookedShowPercent !== null ? `${(bookedShowPercent * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm font-medium text-gray-700 mt-2">Show Rate</div>
          <div className="text-xs text-gray-500 mt-1">% of booked appointments that show</div>
        </div>
      </div>
    </div>
  )
}