'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import KPICards from '@/components/marketing/KPICards'
import ChannelMixCharts from '@/components/marketing/ChannelMixCharts'
import PerformanceMatrix from '@/components/marketing/PerformanceMatrix'
import ChannelTrends from '@/components/marketing/ChannelTrends'
import ChannelTable from '@/components/marketing/ChannelTable'
import FunnelAnalysis from '@/components/marketing/FunnelAnalysis'
import CostEfficiency from '@/components/marketing/CostEfficiency'
import MonthlyComparison from '@/components/marketing/MonthlyComparison'
import { format, subMonths } from 'date-fns'

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
  const [data, setData] = useState<any>(null)
  const [monthlyData, setMonthlyData] = useState<any>(null)

  // Get last 5 months of data
  const endDate = new Date('2025-08-31') // Latest data point
  const startDate = subMonths(endDate, 4) // 5 months total

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
      // Fetch last 5 months of data
      const { data: channelData, error: channelError } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .eq('clinic', company)
        .gte('month', format(startDate, 'yyyy-MM-dd'))
        .lte('month', format(endDate, 'yyyy-MM-dd'))
        .order('month', { ascending: true })
      
      if (channelError) throw channelError

      // Process monthly comparisons
      const monthlyComparisons = processMonthlyData(channelData || [])
      setMonthlyData(monthlyComparisons)

      // Process overall data for current month
      const currentMonthData = channelData?.filter(
        d => d.month.startsWith('2025-08')
      ) || []
      
      // Process data with all months for trends but focus on current month for other metrics
      const processedData = processChannelData(currentMonthData)
      // Add all raw data for trend charts
      processedData.rawData = channelData || []
      setData(processedData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (rawData: any[]) => {
    // Group by month
    const monthlyGroups = rawData.reduce((acc, row) => {
      const month = row.month.substring(0, 7) // YYYY-MM format
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(row)
      return acc
    }, {} as Record<string, any[]>)

    // Calculate monthly totals - using the existing calculated columns from database
    const monthlyTotals = Object.entries(monthlyGroups).map(([month, data]) => {
      const totals = data.reduce((acc, row) => ({
        spend: acc.spend + (row.spend || 0),
        leads: acc.leads + (row.leads || 0),
        visits: acc.visits + (row.visits || 0),
        impressions: acc.impressions + (row.impressions || 0),
        appointments: acc.appointments + (row.total_appointments || 0),
        revenue: acc.revenue + (row.total_estimated_revenue || 0),
        roasSum: acc.roasSum + (row.total_roas || 0),
        conversionSum: acc.conversionSum + (row.total_conversion || 0),
        cacSum: acc.cacSum + (row.cac_total || 0),
        count: acc.count + 1
      }), {
        spend: 0,
        leads: 0,
        visits: 0,
        impressions: 0,
        appointments: 0,
        revenue: 0,
        roasSum: 0,
        conversionSum: 0,
        cacSum: 0,
        count: 0
      })

      return {
        month,
        spend: totals.spend,
        leads: totals.leads,
        visits: totals.visits,
        impressions: totals.impressions,
        appointments: totals.appointments,
        revenue: totals.revenue,
        avgROAS: totals.count > 0 ? totals.roasSum / totals.count : 0, // Use average of total_roas from DB
        avgConversion: totals.count > 0 ? (totals.conversionSum / totals.count) * 100 : 0, // Convert from decimal to percentage
        avgCAC: totals.count > 0 ? totals.cacSum / totals.count : 0 // Use average of cac_total from DB
      }
    })

    // Calculate month-over-month changes
    return monthlyTotals.map((month, index) => {
      if (index === 0) {
        return { ...month, changes: {} }
      }
      
      const prevMonth = monthlyTotals[index - 1]
      return {
        ...month,
        changes: {
          spend: calculateChange(prevMonth.spend, month.spend),
          leads: calculateChange(prevMonth.leads, month.leads),
          roas: calculateChange(prevMonth.avgROAS, month.avgROAS),
          conversion: calculateChange(prevMonth.avgConversion, month.avgConversion),
          cac: calculateChange(prevMonth.avgCAC, month.avgCAC, true), // Inverse for CAC
          revenue: calculateChange(prevMonth.revenue, month.revenue)
        }
      }
    })
  }

  const calculateChange = (oldVal: number, newVal: number, inverse = false) => {
    if (oldVal === 0 && newVal === 0) return { value: 0, percent: 0 }
    if (oldVal === 0) return { value: newVal, percent: 100 }
    const change = newVal - oldVal
    const percent = (change / oldVal) * 100
    return {
      value: change,
      percent: inverse ? -percent : percent // Inverse for metrics where lower is better
    }
  }

  const processChannelData = (rawData: any[]) => {
    // Group by traffic source for current month
    const byChannel = rawData.reduce((acc, row) => {
      const channel = row.traffic_source
      if (!acc[channel]) {
        acc[channel] = {
          traffic_source: channel,
          spend: 0,
          impressions: 0,
          visits: 0,
          leads: 0,
          appointments: 0,
          conversations: 0,
          revenue: 0,
          roasSum: 0,
          conversionSum: 0,
          cacSum: 0,
          count: 0
        }
      }
      
      acc[channel].spend += row.spend || 0
      acc[channel].impressions += row.impressions || 0
      acc[channel].visits += row.visits || 0
      acc[channel].leads += row.leads || 0
      acc[channel].appointments += row.total_appointments || 0
      acc[channel].conversations += row.total_conversations || 0
      acc[channel].revenue += row.total_estimated_revenue || 0
      acc[channel].roasSum += row.total_roas || 0
      acc[channel].conversionSum += row.total_conversion || 0
      acc[channel].cacSum += row.cac_total || 0
      acc[channel].count += 1
      
      return acc
    }, {} as Record<string, any>)

    // Use the pre-calculated metrics from database
    const channels = Object.values(byChannel).map((ch: any) => ({
      ...ch,
      avg_roas: ch.count > 0 ? ch.roasSum / ch.count : 0, // Use average of total_roas
      avg_conversion: ch.count > 0 ? (ch.conversionSum / ch.count) * 100 : 0, // Convert from decimal to percentage
      cac: ch.count > 0 ? ch.cacSum / ch.count : 0, // Use average of cac_total
      appointment_rate: ch.leads > 0 ? (ch.appointments / ch.leads) * 100 : 0,
      cost_per_visit: ch.visits > 0 ? ch.spend / ch.visits : 0,
      visit_to_lead: ch.visits > 0 ? (ch.leads / ch.visits) * 100 : 0
    }))

    // Filter out channels with no activity
    const activeChannels = channels.filter(ch => 
      ch.spend > 0 || ch.leads > 0 || ch.visits > 0
    )

    // Calculate totals for KPIs
    const totals = activeChannels.reduce((acc, ch) => ({
      totalSpend: acc.totalSpend + ch.spend,
      totalLeads: acc.totalLeads + ch.leads,
      totalVisits: acc.totalVisits + ch.visits,
      totalAppointments: acc.totalAppointments + ch.appointments,
      totalRevenue: acc.totalRevenue + ch.revenue,
      roasSum: acc.roasSum + ch.roasSum,
      conversionSum: acc.conversionSum + ch.conversionSum,
      cacSum: acc.cacSum + ch.cacSum,
      count: acc.count + ch.count
    }), { 
      totalSpend: 0, 
      totalLeads: 0, 
      totalVisits: 0, 
      totalAppointments: 0,
      totalRevenue: 0,
      roasSum: 0,
      conversionSum: 0,
      cacSum: 0,
      count: 0
    })

    // Use averages of the pre-calculated metrics
    return {
      channels: activeChannels,
      totals: {
        ...totals,
        avgROAS: totals.count > 0 ? totals.roasSum / totals.count : 0,
        avgConversion: totals.count > 0 ? (totals.conversionSum / totals.count) * 100 : 0, // Convert to percentage
        avgCAC: totals.count > 0 ? totals.cacSum / totals.count : 0
      },
      rawData: []
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

  // Get latest month's data and MoM change
  const latestMonth = monthlyData?.[monthlyData.length - 1]
  const monthOverMonthChanges = latestMonth?.changes || {}

  // Data quality warning
  const hasLowDataQuality = latestMonth && (
    latestMonth.spend < 1000 || 
    latestMonth.leads < 50 ||
    latestMonth.revenue < 1000
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Marketing Performance Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {company.replace('.com', '').replace('.net', '').toUpperCase()}
              </p>
            </div>
            
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Last 5 Months:</span> {format(startDate, 'MMM yyyy')} - {format(endDate, 'MMM yyyy')}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Quality Warning */}
        {hasLowDataQuality && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Limited Data Available</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  The current month has limited data which may affect metric accuracy. 
                  Some channels may show zero or minimal activity.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Comparison Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Month-over-Month Performance</CardTitle>
              <p className="text-sm text-gray-600">Comparing last 5 months of data</p>
            </CardHeader>
            <CardContent>
              <MonthlyComparison data={monthlyData} />
            </CardContent>
          </Card>
        </div>

        {/* Current Month KPI Cards with MoM changes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Month Performance (August 2025)</h2>
          <KPICards data={data?.totals} changes={monthOverMonthChanges} />
        </div>

        {/* Only show visualizations if there's meaningful data */}
        {data?.channels && data.channels.length > 0 ? (
          <>
            {/* Channel Mix Charts - Current Month */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChannelMixCharts channels={data?.channels} type="spend" />
              <ChannelMixCharts channels={data?.channels} type="leads" />
            </div>

            {/* Performance Matrix - Current Month */}
            <div className="mb-8">
              <PerformanceMatrix channels={data?.channels} />
            </div>

            {/* Channel Comparison Table - Current Month */}
            <div className="mb-8">
              <ChannelTable channels={data?.channels} />
            </div>

            {/* Funnel Analysis - Current Month */}
            <div className="mb-8">
              <FunnelAnalysis channels={data?.channels} />
            </div>

            {/* Cost Efficiency - Current Month */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CostEfficiency channels={data?.channels} metric="cpl" />
              <CostEfficiency channels={data?.channels} metric="appointment_rate" />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Channel Data Available</h3>
              <p className="text-gray-600">
                No active marketing channels found for the current month.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}