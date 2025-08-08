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

  // Get unique months and sort them (newest first)
  const months = [...new Set(data.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6) // Get latest 6 months
  
  // Get current month for highlighting
  const currentMonth = months[0] // Most recent month in data
  
  // Get unique traffic sources
  const trafficSources = [...new Set(data.map(row => row.traffic_source))]
    .sort()
  
  // Group data by traffic source and month
  const sourceData: Record<string, Record<string, SeoChannelsRecord>> = {}
  
  trafficSources.forEach(source => {
    sourceData[source] = {}
    months.forEach(month => {
      const record = data.find(row => row.traffic_source === source && row.month === month)
      if (record) {
        sourceData[source][month] = record
      }
    })
  })
  
  // Format month for display
  const formatMonth = (month: string) => {
    const date = new Date(month)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  }
  
  // Format value based on metric type
  const formatValue = (metric: string, value: number | null) => {
    if (value === null || value === undefined) return '-'
    
    // Currency metrics
    if (metric.includes('revenue') || metric.includes('rev')) {
      return '$' + value.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      })
    }
    
    // CTR and rates (stored as decimals, show as percentage)
    if (metric === 'ctr' || metric.includes('rate')) {
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
  
  // Define metric groups similar to ChannelGrid
  const metricGroups = [
    {
      title: 'Traffic & Engagement',
      metrics: [
        { key: 'impressions', label: 'Impressions' },
        { key: 'visits', label: 'Visits' },
        { key: 'ctr', label: 'Click-Through Rate' }
      ]
    },
    {
      title: 'Appointments',
      metrics: [
        { key: 'total_appointments', label: 'Total Appointments' },
        { key: 'new_appointments', label: 'New Appointments' },
        { key: 'returning_appointments', label: 'Returning Appointments' },
        { key: 'appointment_rate', label: 'Appointment Rate' }
      ]
    },
    {
      title: 'Conversations',
      metrics: [
        { key: 'total_conversations', label: 'Total Conversations' },
        { key: 'new_conversations', label: 'New Conversations' },
        { key: 'returning_conversations', label: 'Returning Conversations' },
        { key: 'conversation_rate', label: 'Conversation Rate' }
      ]
    },
    {
      title: 'Revenue',
      metrics: [
        { key: 'appointment_est_revenue', label: 'Est. Revenue' },
        { key: 'new_appointment_est_6m_revenue', label: '6M Revenue' },
        { key: 'avg_appointment_rev', label: 'Avg Appointment Rev' }
      ]
    }
  ]
  
  // Get value for a specific metric and month for a source
  const getValue = (source: string, metricKey: string, month: string) => {
    const record = sourceData[source]?.[month]
    return record ? record[metricKey as keyof SeoChannelsRecord] as number | null : null
  }
  
  // Get all values for a metric across all sources and months (for heatmap)
  const getMetricValues = (metricKey: string) => {
    const values: number[] = []
    trafficSources.forEach(source => {
      months.forEach(month => {
        const value = getValue(source, metricKey, month)
        if (value !== null && value !== undefined) {
          values.push(value as number)
        }
      })
    })
    return values
  }
  
  if (months.length === 0 || trafficSources.length === 0) {
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
    <div className="space-y-6">
      {metricGroups.map((group, groupIndex) => (
        <Card key={groupIndex} className="shadow-lg">
          <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg text-gray-900">
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto -mx-px">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="divide-x divide-gray-200">
                      <th className="sticky left-0 z-10 bg-white text-left px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider min-w-[150px] shadow-r">
                        Channel
                      </th>
                      {months.map(month => (
                        <th 
                          key={month} 
                          className={`text-right px-3 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider min-w-[100px] whitespace-nowrap border-l border-gray-200 ${
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
                    {group.metrics.map((metric, metricIndex) => {
                      const allValues = getMetricValues(metric.key)
                      
                      return (
                        <React.Fragment key={metricIndex}>
                          <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                            <td colSpan={months.length + 1} className="px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800">
                              <div className="flex items-center">
                                <span>{metric.label}</span>
                                {metricDescriptions[metric.key] && (
                                  <Tooltip content={metricDescriptions[metric.key]} />
                                )}
                              </div>
                            </td>
                          </tr>
                          {trafficSources.map((source, sourceIndex) => (
                            <tr key={`${metricIndex}-${sourceIndex}`} className="divide-x divide-gray-100 hover:bg-gray-50">
                              <td className="sticky left-0 z-10 bg-white px-3 py-3 text-xs sm:text-sm text-gray-800 shadow-r capitalize">
                                {source.replace('seo', 'SEO')}
                              </td>
                              {months.map(month => {
                                const value = getValue(source, metric.key, month)
                                const { bgColor, textColor } = getHeatmapColor(
                                  value,
                                  allValues,
                                  metric.key
                                )
                                
                                return (
                                  <td 
                                    key={month} 
                                    className={`relative text-right px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-l border-gray-100 transition-all hover:z-10 group ${bgColor} ${
                                      month === currentMonth ? 'font-bold' : ''
                                    }`}
                                  >
                                    <span className={textColor}>
                                      {formatValue(metric.key, value)}
                                    </span>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}