'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import MetricsGrid from '@/components/marketing/MetricsGrid'
import ChannelGrid from '@/components/marketing/ChannelGrid'
import HeatmapLegend from '@/components/HeatmapLegend'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'channels'>('overview')

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
      // Fetch last 6 months of data
      const { data: channelData, error } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .eq('clinic', company)
        .gte('month', '2025-03-01')
        .lte('month', '2025-08-31')
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
      <header className="bg-white border-b border-gray-200 sticky top-16 z-10 shadow-sm">
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
              <span className="font-semibold text-gray-900">Period:</span> March - August 2025
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'channels'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Channel Breakdown
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <MetricsGrid data={data} />
        ) : (
          <div className="space-y-6">
            <HeatmapLegend showInverted={true} />
            <ChannelGrid 
              data={data} 
              channelName="Google Ads" 
              channels={['google ads']} 
            />
            <ChannelGrid 
              data={data} 
              channelName="Social Ads" 
              channels={['social ads']} 
            />
            <ChannelGrid 
              data={data} 
              channelName="SEO" 
              channels={['local seo', 'organic seo']} 
            />
          </div>
        )}
      </main>
    </div>
  )
}