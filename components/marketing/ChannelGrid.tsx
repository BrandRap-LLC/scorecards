'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeatmapColor } from '@/lib/heatmap'

interface ChannelGridProps {
  data: any[]
  channelName: string
  channels: string[]
}

export default function ChannelGrid({ data, channelName, channels }: ChannelGridProps) {
  // Filter data for specified channels
  const channelData = data.filter(row => channels.includes(row.traffic_source))
  
  // Get unique months and sort them (newest first)
  const months = [...new Set(channelData.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6) // Get latest 6 months
  
  // Aggregate data by month (sum channels if multiple)
  const monthlyTotals: Record<string, any> = {}
  
  months.forEach(month => {
    const monthRecords = channelData.filter(row => row.month === month)
    
    // Initialize totals for this month
    monthlyTotals[month] = {
      impressions: 0,
      visits: 0,
      leads: 0,
      new_leads: 0,
      returning_leads: 0,
      total_conversion: 0,
      new_conversion: 0,
      total_appointments: 0,
      new_appointments: 0,
      returning_appointments: 0,
      online_booking: 0,
      total_conversations: 0,
      new_conversations: 0,
      returning_conversations: 0,
      spend: 0,
      total_estimated_revenue: 0,
      new_estimated_revenue: 0,
      avg_appointment_rev: 0,
      total_roas: 0,
      new_roas: 0,
      cac_total: 0,
      cac_new: 0,
      ltv: 0,
      avg_ltv: 0,
      estimated_ltv_6m: 0,
      avg_estimated_ltv_6m: 0,
      _count: monthRecords.length
    }
    
    // Sum up all channels for this month - NO CALCULATIONS
    monthRecords.forEach(record => {
      // Direct sum for all metrics
      monthlyTotals[month].impressions += record.impressions || 0
      monthlyTotals[month].visits += record.visits || 0
      monthlyTotals[month].leads += record.leads || 0
      monthlyTotals[month].new_leads += record.new_leads || 0
      monthlyTotals[month].returning_leads += record.returning_leads || 0
      monthlyTotals[month].total_appointments += record.total_appointments || 0
      monthlyTotals[month].new_appointments += record.new_appointments || 0
      monthlyTotals[month].returning_appointments += record.returning_appointments || 0
      monthlyTotals[month].online_booking += record.online_booking || 0
      monthlyTotals[month].total_conversations += record.total_conversations || 0
      monthlyTotals[month].new_conversations += record.new_conversations || 0
      monthlyTotals[month].returning_conversations += record.returning_conversations || 0
      monthlyTotals[month].spend += record.spend || 0
      monthlyTotals[month].total_estimated_revenue += record.total_estimated_revenue || 0
      monthlyTotals[month].new_estimated_revenue += record.new_estimated_revenue || 0
      monthlyTotals[month].ltv += record.ltv || 0
      monthlyTotals[month].estimated_ltv_6m += record.estimated_ltv_6m || 0
      
      // For metrics that need weighted averaging
      monthlyTotals[month].total_conversion += (record.total_conversion || 0) * (record.leads || 0)
      monthlyTotals[month].new_conversion += (record.new_conversion || 0) * (record.new_leads || 0)
      monthlyTotals[month].avg_appointment_rev += (record.avg_appointment_rev || 0) * (record.total_appointments || 0)
      monthlyTotals[month].avg_ltv += (record.avg_ltv || 0) * (record.leads || 0)
      monthlyTotals[month].avg_estimated_ltv_6m += (record.avg_estimated_ltv_6m || 0) * (record.leads || 0)
      monthlyTotals[month].total_roas += (record.total_roas || 0) * (record.spend || 0)
      monthlyTotals[month].new_roas += (record.new_roas || 0) * (record.spend || 0)
      monthlyTotals[month].cac_total += (record.cac_total || 0) * (record.leads || 0)
      monthlyTotals[month].cac_new += (record.cac_new || 0) * (record.new_leads || 0)
    })
    
    // Calculate weighted averages for percentage and average metrics
    if (monthlyTotals[month].leads > 0) {
      monthlyTotals[month].total_conversion = monthlyTotals[month].total_conversion / monthlyTotals[month].leads
      monthlyTotals[month].avg_ltv = monthlyTotals[month].avg_ltv / monthlyTotals[month].leads
      monthlyTotals[month].avg_estimated_ltv_6m = monthlyTotals[month].avg_estimated_ltv_6m / monthlyTotals[month].leads
      monthlyTotals[month].cac_total = monthlyTotals[month].cac_total / monthlyTotals[month].leads
    }
    
    if (monthlyTotals[month].new_leads > 0) {
      monthlyTotals[month].new_conversion = monthlyTotals[month].new_conversion / monthlyTotals[month].new_leads
      monthlyTotals[month].cac_new = monthlyTotals[month].cac_new / monthlyTotals[month].new_leads
    }
    
    if (monthlyTotals[month].total_appointments > 0) {
      monthlyTotals[month].avg_appointment_rev = monthlyTotals[month].avg_appointment_rev / monthlyTotals[month].total_appointments
    }
    
    if (monthlyTotals[month].spend > 0) {
      monthlyTotals[month].total_roas = monthlyTotals[month].total_roas / monthlyTotals[month].spend
      monthlyTotals[month].new_roas = monthlyTotals[month].new_roas / monthlyTotals[month].spend
    }
  })
  
  // Format month for display
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`
  }
  
  // Format value based on metric type
  const formatValue = (metric: string, value: number | null) => {
    if (value === null || value === undefined) return '-'
    
    // Currency metrics
    if (metric.includes('revenue') || metric.includes('spend') || metric.includes('cac') || 
        metric.includes('ltv') || metric.includes('rev')) {
      return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
    }
    
    // ROAS metrics (show as decimal with 2 places)
    if (metric.includes('roas')) {
      return value.toFixed(2)
    }
    
    // Percentage metrics (already in percentage form from DB)
    if (metric.includes('conversion') || metric.includes('rate')) {
      return value.toFixed(1) + '%'
    }
    
    // Default: show as integer
    return Math.round(value).toLocaleString()
  }
  
  // Define metric groups in display order - ALL 26 metrics from database
  const metricGroups = [
    {
      title: 'Traffic & Engagement',
      metrics: [
        { key: 'impressions', label: 'Impressions' },
        { key: 'visits', label: 'Visits' },
        { key: 'leads', label: 'Total Leads' },
        { key: 'new_leads', label: 'New Leads' },
        { key: 'returning_leads', label: 'Returning Leads' }
      ]
    },
    {
      title: 'Conversion Metrics',
      metrics: [
        { key: 'total_conversion', label: 'Total Conversion %' },
        { key: 'new_conversion', label: 'New Conversion %' },
        { key: 'total_appointments', label: 'Total Appointments' },
        { key: 'new_appointments', label: 'New Appointments' },
        { key: 'returning_appointments', label: 'Returning Appointments' },
        { key: 'online_booking', label: 'Online Bookings' }
      ]
    },
    {
      title: 'Conversations',
      metrics: [
        { key: 'total_conversations', label: 'Total Conversations' },
        { key: 'new_conversations', label: 'New Conversations' },
        { key: 'returning_conversations', label: 'Returning Conversations' }
      ]
    },
    {
      title: 'Financial Performance',
      metrics: [
        { key: 'spend', label: 'Ad Spend' },
        { key: 'total_estimated_revenue', label: 'Total Est. Revenue' },
        { key: 'new_estimated_revenue', label: 'New Est. Revenue' },
        { key: 'avg_appointment_rev', label: 'Avg Appointment Revenue' }
      ]
    },
    {
      title: 'ROI Metrics',
      metrics: [
        { key: 'total_roas', label: 'Total ROAS' },
        { key: 'new_roas', label: 'New ROAS' },
        { key: 'cac_total', label: 'CAC Total' },
        { key: 'cac_new', label: 'CAC New' }
      ]
    },
    {
      title: 'Lifetime Value',
      metrics: [
        { key: 'ltv', label: 'LTV' },
        { key: 'avg_ltv', label: 'Average LTV' },
        { key: 'estimated_ltv_6m', label: 'Estimated 6-Month LTV' },
        { key: 'avg_estimated_ltv_6m', label: 'Avg Est. 6-Month LTV' }
      ]
    }
  ]
  
  // Get value for a specific metric and month
  const getValue = (metricKey: string, month: string) => {
    return monthlyTotals[month] ? monthlyTotals[month][metricKey] : null
  }
  
  // Get all values for a metric across all months (for heatmap)
  const getMetricValues = (metricKey: string) => {
    return months.map(month => getValue(metricKey, month))
  }
  
  // Only show if there's data
  if (months.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-gray-900">{channelName}</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">No data available for this channel</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-gray-900">
          {channelName}
          {channels.length > 1 && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({channels.join(' + ')})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-2 min-w-[200px] text-gray-700 font-semibold">Metric</th>
                {months.map(month => (
                  <th key={month} className="text-right p-2 min-w-[100px] text-gray-700 font-semibold">
                    {formatMonth(month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricGroups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  <tr className="bg-gray-50">
                    <td colSpan={months.length + 1} className="p-2 font-semibold text-sm text-gray-700">
                      {group.title}
                    </td>
                  </tr>
                  {group.metrics.map((metric, metricIndex) => {
                    const allValues = getMetricValues(metric.key)
                    
                    return (
                      <tr key={`${groupIndex}-${metricIndex}`} className="border-b border-gray-100">
                        <td className="p-2 text-sm text-gray-800">{metric.label}</td>
                        {months.map((month, monthIndex) => {
                          const value = getValue(metric.key, month)
                          const { bgColor, textColor } = getHeatmapColor(
                            value,
                            allValues,
                            metric.key
                          )
                          
                          return (
                            <td 
                              key={month} 
                              className={`text-right p-2 text-sm font-medium ${bgColor}`}
                            >
                              <span className={textColor}>
                                {formatValue(metric.key, value)}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}