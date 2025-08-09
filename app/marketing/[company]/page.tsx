'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import MetricsGrid from '@/components/marketing/MetricsGrid'
import ChannelGrid from '@/components/marketing/ChannelGrid'
import WeeklyMetricsGrid from '@/components/marketing/WeeklyMetricsGrid'
import WeeklyChannelGrid from '@/components/marketing/WeeklyChannelGrid'
import PaidChannelGrid from '@/components/PaidChannelGrid'
import SEOChannelGrid from '@/components/SEOChannelGrid'

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

// Company display names for better formatting
const COMPANY_DISPLAY_NAMES: Record<string, string> = {
  'advancedlifeclinic.com': 'Advanced Life Clinic',
  'alluraderm.com': 'Alluraderm',
  'bismarckbotox.com': 'Bismarck Botox',
  'drridha.com': 'Dr. Ridha',
  'genesis-medspa.com': 'Genesis Med Spa',
  'greenspringaesthetics.com': 'Green Spring Aesthetics',
  'kovakcosmeticcenter.com': 'Kovak Cosmetic Center',
  'mirabilemd.com': 'Mirabile MD',
  'myskintastic.com': 'My Skintastic',
  'skincareinstitute.net': 'Skin Care Institute',
  'skinjectables.com': 'Skinjectables'
}

export default function MarketingDashboard() {
  const params = useParams()
  const company = params.company as string
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'channels' | 'weekly' | 'paid' | 'seo'>('overview')
  const [isTransitioning, setIsTransitioning] = useState(false)

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
      // Fetch last 6 months of monthly data dynamically
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
      sixMonthsAgo.setDate(1) // First day of month
      
      const currentDate = new Date()
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const { data: channelData, error: monthlyError } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .eq('clinic', company)
        .gte('month', sixMonthsAgo.toISOString().split('T')[0])
        .lte('month', endOfMonth.toISOString().split('T')[0])
        .order('month', { ascending: true })
      
      if (monthlyError) throw monthlyError
      
      // Fetch last 12 weeks of weekly data
      const { data: weekData, error: weeklyError } = await supabase
        .from('executive_weekly_reports')
        .select('*')
        .eq('clinic', company)
        .order('week', { ascending: false })
        .limit(500) // Get enough records for 12 weeks across all traffic sources
      
      if (weeklyError) throw weeklyError
      
      setData(channelData || [])
      setWeeklyData(weekData || [])
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
      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex overflow-x-auto scrollbar-hide flex-1" aria-label="Tabs">
            <button
              onClick={() => {
                setIsTransitioning(true)
                setActiveTab('overview')
                setTimeout(() => setIsTransitioning(false), 150)
              }}
              className={`whitespace-nowrap py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                setIsTransitioning(true)
                setActiveTab('channels')
                setTimeout(() => setIsTransitioning(false), 150)
              }}
              className={`whitespace-nowrap py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'channels'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Channels
            </button>
            <button
              onClick={() => {
                setIsTransitioning(true)
                setActiveTab('weekly')
                setTimeout(() => setIsTransitioning(false), 150)
              }}
              className={`whitespace-nowrap py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'weekly'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => {
                setIsTransitioning(true)
                setActiveTab('paid')
                setTimeout(() => setIsTransitioning(false), 150)
              }}
              className={`whitespace-nowrap py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'paid'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => {
                setIsTransitioning(true)
                setActiveTab('seo')
                setTimeout(() => setIsTransitioning(false), 150)
              }}
              className={`whitespace-nowrap py-3 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'seo'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              SEO
            </button>
            </nav>
            <div className="hidden sm:flex items-center px-4 py-3 border-l border-gray-200">
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {COMPANY_DISPLAY_NAMES[company] || company}
              </span>
            </div>
          </div>
        </div>
        {/* Mobile Company Name */}
        <div className="sm:hidden bg-gray-50 px-2 py-2 border-t border-gray-200">
          <span className="text-xs font-medium text-gray-700">
            {COMPANY_DISPLAY_NAMES[company] || company}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {activeTab === 'overview' ? (
            <MetricsGrid data={data} />
          ) : activeTab === 'channels' ? (
          <div className="space-y-4 sm:space-y-6">
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
        ) : activeTab === 'weekly' ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Weekly View</h3>
              <p className="text-xs sm:text-sm text-blue-800">Showing last 12 weeks of performance data</p>
            </div>
            <WeeklyMetricsGrid data={weeklyData} />
            <WeeklyChannelGrid 
              data={weeklyData} 
              channelName="Google Ads" 
              channels={['google ads']} 
            />
            <WeeklyChannelGrid 
              data={weeklyData} 
              channelName="Social Ads" 
              channels={['social ads']} 
            />
            <WeeklyChannelGrid 
              data={weeklyData} 
              channelName="SEO" 
              channels={['local seo', 'organic seo']} 
            />
          </div>
        ) : activeTab === 'paid' ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Paid Ads by Campaign</h3>
              <p className="text-xs sm:text-sm text-blue-800">Campaign-level performance metrics across months</p>
              <p className="text-xs text-blue-700 mt-2">
                <span className="font-medium">Note:</span> Leads data is aggregated at the traffic source level. 
                For campaign-specific leads metrics, please refer to the Channels tab.
              </p>
            </div>
            <PaidChannelGrid clinic={company} />
          </div>
        ) : activeTab === 'seo' ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">SEO Channels</h3>
              <p className="text-xs sm:text-sm text-blue-800">Organic and Local SEO performance metrics across months</p>
            </div>
            <SEOChannelGrid clinic={company} />
          </div>
        ) : null}
        </div>
      </main>
    </div>
  )
}