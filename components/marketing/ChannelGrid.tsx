'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeatmapColor } from '@/lib/heatmap'
import { Tooltip } from '@/components/ui/tooltip'
import { CellTooltip } from '@/components/ui/cell-tooltip'
import { metricDescriptions } from '@/lib/metric-descriptions'

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
  
  // Get current month for highlighting
  const currentMonth = months[0] // Most recent month in data
  
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
      returning_conversion: 0,
      total_appointments: 0,
      new_appointments: 0,
      returning_appointments: 0,
      online_booking: 0,
      spend: 0,
      total_estimated_revenue: 0,
      new_estimated_revenue: 0,
      total_roas: 0,
      new_roas: 0,
      cac_total: 0,
      cac_new: 0,
      estimated_ltv_6m: 0,
      _count: monthRecords.length
    }
    
    // Sum up all channels for this month - NO CALCULATIONS, NO WEIGHTED AVERAGES
    monthRecords.forEach(record => {
      // Direct sum for all metrics - just show individual channel values
      monthlyTotals[month].impressions += record.impressions || 0
      monthlyTotals[month].visits += record.visits || 0
      monthlyTotals[month].leads += record.leads || 0
      monthlyTotals[month].new_leads += record.new_leads || 0
      monthlyTotals[month].returning_leads += record.returning_leads || 0
      monthlyTotals[month].total_appointments += record.total_appointments || 0
      monthlyTotals[month].new_appointments += record.new_appointments || 0
      monthlyTotals[month].returning_appointments += record.returning_appointments || 0
      monthlyTotals[month].online_booking += record.online_booking || 0
      monthlyTotals[month].spend += record.spend || 0
      monthlyTotals[month].total_estimated_revenue += record.total_estimated_revenue || 0
      monthlyTotals[month].new_estimated_revenue += record.new_estimated_revenue || 0
      monthlyTotals[month].estimated_ltv_6m += record.estimated_ltv_6m || 0
      monthlyTotals[month].total_roas += record.total_roas || 0
      monthlyTotals[month].new_roas += record.new_roas || 0
      monthlyTotals[month].cac_total += record.cac_total || 0
      monthlyTotals[month].cac_new += record.cac_new || 0
      monthlyTotals[month].total_conversion += record.total_conversion || 0
      monthlyTotals[month].new_conversion += record.new_conversion || 0
      monthlyTotals[month].returning_conversion += record.returning_conversion || 0
    })
  })
  
  // Format month for display
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`
  }
  
  // Format value based on metric type with consistent decimal places
  const formatValue = (metric: string, value: number | null) => {
    if (value === null || value === undefined) return '-'
    
    // Currency metrics - no decimals
    if (metric.includes('revenue') || metric.includes('spend') || metric.includes('cac') || 
        metric.includes('ltv') || metric.includes('rev')) {
      return '$' + value.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })
    }
    
    // ROAS metrics (show as decimal with 2 places)
    if (metric.includes('roas')) {
      return value.toFixed(2)
    }
    
    // Conversion metrics (stored as decimals, need to multiply by 100)
    if (metric.includes('conversion')) {
      return Math.round(value * 100) + '%'
    }
    
    // Other rate metrics (already in percentage form from DB)
    if (metric.includes('rate')) {
      return value.toFixed(1) + '%'
    }
    
    // Large numbers - use K/M notation
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    } else if (value >= 10000) {
      return (value / 1000).toFixed(0) + 'K'
    }
    
    // Default: show as integer with commas
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
      <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-900">
          {channelName}
          {channels.length > 1 && (
            <span className="block sm:inline text-sm font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
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
                  {months.map(month => (
                    <th 
                      key={month} 
                      className={`text-right px-2 sm:px-3 py-2 sm:py-3 text-xs font-semibold uppercase tracking-wider min-w-[70px] sm:min-w-[100px] whitespace-nowrap border-l border-gray-200 ${
                        month === currentMonth 
                          ? 'bg-blue-50 text-blue-900' 
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="hidden sm:inline">{formatMonth(month)}</span>
                      <span className="sm:hidden">{formatMonth(month).split(' ')[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {metricGroups.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {groupIndex > 0 && (
                      <tr className="h-2 bg-gray-100">
                        <td colSpan={months.length + 1}></td>
                      </tr>
                    )}
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                      <td colSpan={months.length + 1} className="px-2 sm:px-3 py-2 text-xs font-semibold text-gray-800 border-l-4 border-gray-400">
                        {group.title}
                      </td>
                    </tr>
                    {group.metrics.map((metric, metricIndex) => {
                      const allValues = getMetricValues(metric.key)
                      
                      return (
                        <tr key={`${groupIndex}-${metricIndex}`} className="divide-x divide-gray-100">
                          <td className="sticky left-0 z-10 bg-white px-2 sm:px-3 py-2 sm:py-3 text-xs text-gray-800 shadow-r">
                            {metricDescriptions[metric.key] ? (
                              <CellTooltip content={metricDescriptions[metric.key]} className="h-full w-full">
                                <div className="flex items-center cursor-help">
                                  <span className="truncate pr-1">{metric.label}</span>
                                  <Tooltip content={metricDescriptions[metric.key]} />
                                </div>
                              </CellTooltip>
                            ) : (
                              <div className="flex items-center">
                                <span className="truncate pr-1">{metric.label}</span>
                              </div>
                            )}
                          </td>
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
                                className={`relative text-right px-2 sm:px-3 py-2 sm:py-3 text-xs font-medium whitespace-nowrap border-l border-gray-100 transition-all hover:z-10 group cursor-pointer ${bgColor} ${
                                  month === currentMonth ? 'font-bold' : ''
                                }`}
                                title={value !== null ? `${metric.label}: ${value}` : 'No data'}
                              >
                                <span className={textColor}>
                                  {formatValue(metric.key, value)}
                                </span>
                                {/* Hover overlay with exact value */}
                                {value !== null && (
                                  <div className="absolute inset-0 bg-gray-900 bg-opacity-90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {value.toLocaleString()}
                                  </div>
                                )}
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