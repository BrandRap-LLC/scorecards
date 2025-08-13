'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeatmapColor } from '@/lib/heatmap'
import { Tooltip } from '@/components/ui/tooltip'
import { metricDescriptions } from '@/lib/metric-descriptions'
import { SeoChannelsRecord } from '@/lib/api-paid-seo'

interface SEOChannelGridProps {
  clinic: string
}

export default function SEOChannelGrid({ clinic }: SEOChannelGridProps) {
  const [data, setData] = useState<SeoChannelsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [clinic])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/seo-channels?clinic=${clinic}`)
      if (!response.ok) throw new Error('Failed to fetch data')
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading SEO data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  // Get unique traffic sources and sort them
  const trafficSources = [...new Set(data.map(row => row.traffic_source))]
    .sort()

  // Get ALL unique months from ALL data (not per channel) and sort them (newest first)
  const allMonths = [...new Set(data.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6) // Get latest 6 months
  
  // Get current month for highlighting
  const currentMonth = allMonths[0] // Most recent month in data

  // Process each traffic source separately
  const channelGrids = trafficSources.map(source => {
    // Filter data for this specific traffic source
    const sourceData = data.filter(row => row.traffic_source === source)
    
    // Use the consistent months from all data
    const months = allMonths
    
    // Create monthly data map - one record per month for this source
    const monthlyData: Record<string, SeoChannelsRecord | null> = {}
    
    months.forEach(month => {
      const monthRecord = sourceData.find(row => row.month === month)
      monthlyData[month] = monthRecord || null
    })
    
    // Format month for display
    const formatMonth = (month: string) => {
      const date = new Date(month)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
    }
    
    // Format value based on metric type - matching ChannelGrid formatting
    const formatValue = (metric: string, value: number | null) => {
      if (value === null || value === undefined) return '-'
      
      // Currency metrics - no decimals
      if (metric.includes('revenue') || metric.includes('rev') || 
          metric.includes('ltv')) {
        return '$' + value.toLocaleString('en-US', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        })
      }
      
      // Percentage metrics (stored as decimals, e.g., 0.85 = 85%)
      if (metric.includes('conversion') || metric.includes('rate')) {
        return (value * 100).toFixed(1) + '%'
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
    
    // Define metric groups - using all fields from updated seo_channels table
    const metricGroups = [
      {
        title: 'Traffic',
        metrics: [
          { key: 'impressions', label: 'Impressions' },
          { key: 'visits', label: 'Visits' }
        ]
      },
      {
        title: 'Lead Generation',
        metrics: [
          { key: 'leads', label: 'Total Leads' },
          { key: 'new_leads', label: 'New Leads' },
          { key: 'returning_leads', label: 'Returning Leads' }
        ]
      },
      {
        title: 'Conversion Rates',
        metrics: [
          { key: 'total_conversion', label: 'Total Conversion %' },
          { key: 'new_conversion', label: 'New Conversion %' },
          { key: 'returning_conversion', label: 'Returning Conversion %' }
        ]
      },
      {
        title: 'Appointments',
        metrics: [
          { key: 'total_appointments', label: 'Total Appointments' },
          { key: 'new_appointments', label: 'New Appointments' },
          { key: 'returning_appointments', label: 'Returning Appointments' }
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
        title: 'Revenue',
        metrics: [
          { key: 'total_estimated_revenue', label: 'Total Est. Revenue' },
          { key: 'new_estimated_revenue', label: 'New Est. Revenue' },
          { key: 'estimated_ltv_6m', label: 'Est. LTV 6M' }
        ]
      }
    ]
    
    // Get value for a specific metric and month
    const getValue = (metricKey: string, month: string) => {
      const record = monthlyData[month]
      return record ? record[metricKey as keyof SeoChannelsRecord] : null
    }
    
    // Get all values for a metric across all months (for heatmap)
    const getMetricValues = (metricKey: string) => {
      return months.map(month => getValue(metricKey, month)).filter(v => v !== null) as number[]
    }
    
    // Only show if there's data
    if (months.length === 0) {
      return null
    }
    
    // Format channel name
    const formatChannelName = (source: string) => {
      if (source === 'local seo') return 'Local SEO'
      if (source === 'organic seo') return 'Organic SEO'
      return source
    }
    
    return (
      <Card key={source} className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-lg lg:text-xl text-gray-900">
            {formatChannelName(source)}
            <span className="block sm:inline text-xs sm:text-sm font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
              (SEO Channel)
            </span>
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
                        <td colSpan={months.length + 1} className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800 border-l-4 border-gray-400">
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
                            {months.map((month, monthIndex) => {
                              const value = getValue(metric.key, month)
                              const numericValue = typeof value === 'number' ? value : null
                              const { bgColor, textColor } = getHeatmapColor(
                                numericValue,
                                allValues,
                                metric.key
                              )
                              
                              return (
                                <td 
                                  key={month} 
                                  className={`relative text-right px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-l border-gray-100 transition-all hover:z-10 group cursor-pointer ${bgColor} ${
                                    month === currentMonth ? 'font-bold' : ''
                                  }`}
                                  title={value !== null ? `${metric.label}: ${value}` : 'No data'}
                                >
                                  <span className={textColor}>
                                    {formatValue(metric.key, numericValue)}
                                  </span>
                                  {/* Hover overlay with exact value */}
                                  {numericValue !== null && (
                                    <div className="absolute inset-0 bg-gray-900 bg-opacity-90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                      {numericValue.toLocaleString()}
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
  })

  if (trafficSources.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-gray-900">SEO Channels</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">No SEO data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {channelGrids}
    </div>
  )
}