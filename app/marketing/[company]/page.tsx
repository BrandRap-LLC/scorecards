'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react'
import KPICards from '@/components/marketing/KPICards'
import ChannelMixCharts from '@/components/marketing/ChannelMixCharts'
import PerformanceMatrix from '@/components/marketing/PerformanceMatrix'
import ChannelTrends from '@/components/marketing/ChannelTrends'
import ChannelTable from '@/components/marketing/ChannelTable'
import FunnelAnalysis from '@/components/marketing/FunnelAnalysis'
import CostEfficiency from '@/components/marketing/CostEfficiency'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Company list
const COMPANIES = [
  'advancedlifeclinic.com',
  'alluraderm.com',
  'bismarckbotox.com',
  'drridha.com',
  'genesis-medspa.com',
  'greenspringaesthetics.com',
  'medicalagecenter.com',
  'parkhillclinic.com',
  'skincareinstitute.net',
  'skinjectables.com',
  'youthful-image.com'
]

export default function MarketingDashboard() {
  const params = useParams()
  const company = params.company as string
  
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    start: '2024-12-01',
    end: '2025-08-31'
  })
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly')

  // Validate company
  useEffect(() => {
    if (!COMPANIES.includes(company)) {
      console.error('Invalid company:', company)
    }
  }, [company])

  // Fetch data
  useEffect(() => {
    fetchDashboardData()
  }, [company, dateRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch channel performance summary
      const { data: channelData, error: channelError } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .eq('clinic', company)
        .gte('month', dateRange.start)
        .lte('month', dateRange.end)
      
      if (channelError) throw channelError

      // Process and aggregate data
      const processedData = processChannelData(channelData || [])
      setData(processedData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processChannelData = (rawData: any[]) => {
    // Group by traffic source
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
          roasSum: 0,
          conversionSum: 0,
          count: 0,
          months: []
        }
      }
      
      acc[channel].spend += row.spend || 0
      acc[channel].impressions += row.impressions || 0
      acc[channel].visits += row.visits || 0
      acc[channel].leads += row.leads || 0
      acc[channel].appointments += row.total_appointments || 0
      acc[channel].conversations += row.total_conversations || 0
      acc[channel].roasSum += row.total_roas || row.roas || 0
      acc[channel].conversionSum += row.total_conversion || row.conversion_rate || 0
      acc[channel].count += 1
      acc[channel].months.push({
        month: row.month,
        spend: row.spend,
        leads: row.leads,
        roas: row.total_roas || row.roas,
        conversion: row.total_conversion || row.conversion_rate
      })
      
      return acc
    }, {} as Record<string, any>)

    // Calculate averages and derived metrics
    const channels = Object.values(byChannel).map((ch: any) => ({
      ...ch,
      avg_roas: ch.count > 0 ? ch.roasSum / ch.count : 0,
      avg_conversion: ch.count > 0 ? ch.conversionSum / ch.count : 0,
      cac: ch.leads > 0 ? ch.spend / ch.leads : 0,
      appointment_rate: ch.leads > 0 ? (ch.appointments / ch.leads) * 100 : 0,
      cost_per_visit: ch.visits > 0 ? ch.spend / ch.visits : 0,
      visit_to_lead: ch.visits > 0 ? (ch.leads / ch.visits) * 100 : 0
    }))

    // Calculate totals for KPIs
    const totals = channels.reduce((acc, ch) => ({
      totalSpend: acc.totalSpend + ch.spend,
      totalLeads: acc.totalLeads + ch.leads,
      totalVisits: acc.totalVisits + ch.visits,
      totalAppointments: acc.totalAppointments + ch.appointments
    }), { totalSpend: 0, totalLeads: 0, totalVisits: 0, totalAppointments: 0 })

    // Calculate weighted averages
    const weightedROAS = channels.reduce((sum, ch) => 
      sum + (ch.avg_roas * (ch.spend / totals.totalSpend)), 0)
    const weightedConversion = channels.reduce((sum, ch) => 
      sum + (ch.avg_conversion * (ch.leads / totals.totalLeads)), 0)

    return {
      channels,
      totals: {
        ...totals,
        avgROAS: weightedROAS,
        avgConversion: weightedConversion,
        avgCAC: totals.totalLeads > 0 ? totals.totalSpend / totals.totalLeads : 0
      },
      rawData
    }
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting dashboard data...')
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
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={`${dateRange.start}_${dateRange.end}`} onValueChange={(value) => {
                  const [start, end] = value.split('_')
                  setDateRange({ start, end })
                }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-12-01_2025-08-31">All Time</SelectItem>
                    <SelectItem value="2025-06-01_2025-08-31">Last 3 Months</SelectItem>
                    <SelectItem value="2025-01-01_2025-08-31">YTD 2025</SelectItem>
                    <SelectItem value="2024-12-01_2024-12-31">Dec 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <KPICards data={data?.totals} />

        {/* Channel Mix Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <ChannelMixCharts channels={data?.channels} type="spend" />
          <ChannelMixCharts channels={data?.channels} type="leads" />
        </div>

        {/* Performance Matrix */}
        <div className="mt-8">
          <PerformanceMatrix channels={data?.channels} />
        </div>

        {/* Channel Trends */}
        <div className="mt-8">
          <ChannelTrends data={data?.rawData} />
        </div>

        {/* Channel Comparison Table */}
        <div className="mt-8">
          <ChannelTable channels={data?.channels} />
        </div>

        {/* Funnel Analysis */}
        <div className="mt-8">
          <FunnelAnalysis channels={data?.channels} />
        </div>

        {/* Cost Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <CostEfficiency channels={data?.channels} metric="cpl" />
          <CostEfficiency channels={data?.channels} metric="appointment_rate" />
        </div>
      </main>
    </div>
  )
}