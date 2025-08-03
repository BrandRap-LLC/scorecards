'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import MetricsGrid from '@/components/marketing/MetricsGrid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Company list - actual companies from database
const COMPANIES = [
  'advancedlifeclinic.com',
  'alluraderm.com',
  'bismarckbotox.com',
  'drridha.com',
  'genesis-medspa.com',
  'greenspringaesthetics.com',
  'kovakcosmeticcenter.com',
  'mirabilemd.com',
  'myskintastic.com',
  'skincareinstitute.net',
  'skinjectables.com'
]

export default function MarketingDashboard() {
  const params = useParams()
  const company = params.company as string
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])

  // Validate company
  useEffect(() => {
    if (!COMPANIES.includes(company)) {
      console.error('Invalid company:', company)
    }
  }, [company])

  // Fetch data
  useEffect(() => {
    fetchDashboardData()
  }, [company])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch March through July 2025 data
      const { data: channelData, error } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .eq('clinic', company)
        .gte('month', '2025-03-01')
        .lte('month', '2025-07-31')
        .order('month', { ascending: true })
      
      if (error) throw error
      
      setData(channelData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Marketing Performance Dashboard
              </h1>
              <p className="text-sm text-gray-700 mt-1">
                {company.replace('.com', '').replace('.net', '').toUpperCase()}
              </p>
            </div>
            
            <div className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Period:</span> March - July 2025
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MetricsGrid data={data} />
      </main>
    </div>
  )
}