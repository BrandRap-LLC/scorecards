'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeatmapColor } from '@/lib/heatmap'
import { Tooltip } from '@/components/ui/tooltip'
import { metricDescriptions } from '@/lib/metric-descriptions'

interface WeeklyChannelGridProps {
  data: any[]
  channelName: string
  channels: string[]
}

export default function WeeklyChannelGrid({ data, channelName, channels }: WeeklyChannelGridProps) {
  // Filter data for specified channels
  const channelData = data.filter(row => channels.includes(row.traffic_source))
  
  // Get unique weeks and sort them (newest first)
  const weeks = [...new Set(channelData.map(row => row.week))]
    .sort()
    .reverse()
    .slice(0, 12) // Get latest 12 weeks
  
  // Aggregate data by week (sum channels if multiple)
  const weeklyTotals: Record<string, any> = {}
  
  weeks.forEach(week => {
    const weekRecords = channelData.filter(row => row.week === week)
    
    // Initialize totals for this week with all available fields
    weeklyTotals[week] = {
      impressions: 0,
      visits: 0,
      spend: 0,
      leads: 0,
      new_leads: 0,
      returning_leads: 0,
      total_conversion: 0,
      new_conversion: 0,
      returning_conversion: 0,
      cac_total: 0,
      cac_new: 0,
      total_appointments: 0,
      new_appointments: 0,
      returning_appointments: 0,
      appointments: 0,
      online_booking: 0,
      conversations: 0,
      total_estimated_revenue: 0,
      new_estimated_revenue: 0,
      estimated_ltv_6m: 0,
      total_roas: 0,
      new_roas: 0,
      roas: 0,
      _count: weekRecords.length
    }
    
    // Sum up all channels for this week - NO CALCULATIONS, NO WEIGHTED AVERAGES
    weekRecords.forEach(record => {
      // Direct sum for all metrics - include all available fields
      weeklyTotals[week].impressions += record.impressions || 0
      weeklyTotals[week].visits += record.visits || 0
      weeklyTotals[week].spend += record.spend || 0
      weeklyTotals[week].leads += record.leads || 0
      weeklyTotals[week].new_leads += record.new_leads || 0
      weeklyTotals[week].returning_leads += record.returning_leads || 0
      weeklyTotals[week].total_conversion += record.total_conversion || 0
      weeklyTotals[week].new_conversion += record.new_conversion || 0
      weeklyTotals[week].returning_conversion += record.returning_conversion || 0
      weeklyTotals[week].cac_total += record.cac_total || 0
      weeklyTotals[week].cac_new += record.cac_new || 0
      weeklyTotals[week].total_appointments += record.total_appointments || 0
      weeklyTotals[week].new_appointments += record.new_appointments || 0
      weeklyTotals[week].returning_appointments += record.returning_appointments || 0
      weeklyTotals[week].appointments += record.appointments || 0
      weeklyTotals[week].online_booking += record.online_booking || 0
      weeklyTotals[week].conversations += record.conversations || 0
      weeklyTotals[week].total_estimated_revenue += record.total_estimated_revenue || 0
      weeklyTotals[week].new_estimated_revenue += record.new_estimated_revenue || 0
      weeklyTotals[week].estimated_ltv_6m += record.estimated_ltv_6m || 0
      weeklyTotals[week].total_roas += record.total_roas || 0
      weeklyTotals[week].new_roas += record.new_roas || 0
      weeklyTotals[week].roas += record.roas || 0
    })
  })
  
  // Format week for display
  const formatWeek = (week: string) => {
    const date = new Date(week)
    const weekEnd = new Date(date)
    weekEnd.setDate(date.getDate() + 6)
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const startMonth = monthNames[date.getMonth()]
    const endMonth = monthNames[weekEnd.getMonth()]
    const startDay = date.getDate()
    const endDay = weekEnd.getDate()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`
    } else {
      return `${startMonth} ${startDay}-${endMonth} ${endDay}`
    }
  }
  
  // Format value based on metric type
  const formatValue = (metric: string, value: number | null) => {
    if (value === null || value === undefined) return '-'
    
    // Currency metrics
    if (metric.includes('revenue') || metric.includes('spend') || metric.includes('cac') || 
        metric.includes('ltv') || metric.includes('rev')) {
      return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 0 })
    }
    
    // ROAS metrics (show as multiplier with 1 decimal)
    if (metric.includes('roas')) {
      return value.toFixed(1) + 'x'
    }
    
    // Conversion metrics (stored as decimals, need to multiply by 100)
    if (metric.includes('conversion')) {
      return Math.round(value * 100) + '%'
    }
    
    // Other rate metrics (already in percentage form from DB)
    if (metric.includes('rate')) {
      return value.toFixed(1) + '%'
    }
    
    // Default: show as integer
    return Math.round(value).toLocaleString()
  }
  
  // Check if this is SEO data (includes local seo or organic seo)
  const isSEO = channels.some(channel => channel.includes('seo'))
  
  // Define metric groups in display order - ALL 26 metrics from database
  const baseMetricGroups = [
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
        { key: 'returning_conversion', label: 'Returning Conversion %' },
        { key: 'total_appointments', label: 'Total Appointments' },
        { key: 'new_appointments', label: 'New Appointments' },
        { key: 'returning_appointments', label: 'Returning Appointments' },
        { key: 'online_booking', label: 'Online Bookings' }
      ]
    },
    {
      title: 'Financial Performance',
      metrics: [
        { key: 'spend', label: 'Ad Spend' },
        { key: 'total_estimated_revenue', label: 'Total Est. Revenue' },
        { key: 'new_estimated_revenue', label: 'New Est. Revenue' }
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
        { key: 'estimated_ltv_6m', label: 'Estimated 6-Month LTV' }
      ]
    }
  ]
  
  // Filter metrics for SEO channels
  const metricGroups = isSEO 
    ? baseMetricGroups
        .filter(group => group.title !== 'ROI Metrics')
        .map(group => {
          // Remove Ad Spend from Financial Performance for SEO
          if (group.title === 'Financial Performance') {
            return {
              ...group,
              metrics: group.metrics.filter(metric => metric.key !== 'spend')
            }
          }
          return group
        })
    : baseMetricGroups
  
  // Get value for a specific metric and week
  const getValue = (metricKey: string, week: string) => {
    return weeklyTotals[week] ? weeklyTotals[week][metricKey] : null
  }
  
  // Get all values for a metric across all weeks (for heatmap)
  const getMetricValues = (metricKey: string) => {
    return weeks.map(week => getValue(metricKey, week))
  }
  
  // Only show if there's data
  if (weeks.length === 0) {
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
      <CardHeader className="bg-gray-50 border-b p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg lg:text-xl text-gray-900">
          {channelName}
          {channels.length > 1 && (
            <span className="block sm:inline text-xs sm:text-sm font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
              ({channels.join(' + ')})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto -mx-px">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="divide-x divide-gray-200">
                  <th className="sticky left-0 z-10 bg-white text-left px-2 sm:px-3 py-2 sm:py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[100px] sm:min-w-[200px] shadow-r">
                    Metric
                  </th>
                  {weeks.map(week => (
                    <th key={week} className="text-right px-2 sm:px-3 py-2 sm:py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[70px] sm:min-w-[100px] whitespace-nowrap border-l border-gray-200">
                      <span className="hidden sm:inline">{formatWeek(week)}</span>
                      <span className="sm:hidden text-xs">{formatWeek(week).split(' ')[1]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metricGroups.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <tr className="bg-gray-50">
                      <td colSpan={weeks.length + 1} className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 border-l-4 border-gray-400">
                        {group.title}
                      </td>
                    </tr>
                    {group.metrics.map((metric, metricIndex) => {
                      const allValues = getMetricValues(metric.key)
                      
                      return (
                        <tr key={`${groupIndex}-${metricIndex}`} className="divide-x divide-gray-100">
                          <td className="sticky left-0 z-10 bg-white px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-gray-800 shadow-r">
                            <div className="flex items-center">
                              <span className="truncate pr-1">{metric.label}</span>
                              {metricDescriptions[metric.key] && (
                                <Tooltip content={metricDescriptions[metric.key]} />
                              )}
                            </div>
                          </td>
                          {weeks.map((week, weekIndex) => {
                            const value = getValue(metric.key, week)
                            const { bgColor, textColor } = getHeatmapColor(
                              value,
                              allValues,
                              metric.key
                            )
                            
                            return (
                              <td 
                                key={week} 
                                className={`relative text-right px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-l border-gray-100 transition-all hover:z-10 group cursor-pointer ${bgColor}`}
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
        </div>
      </CardContent>
    </Card>
  )
}