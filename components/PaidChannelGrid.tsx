'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeatmapColor } from '@/lib/heatmap'
import { Tooltip } from '@/components/ui/tooltip'
import { CellTooltip } from '@/components/ui/cell-tooltip'
import { metricDescriptions } from '@/lib/metric-descriptions'
import { PaidAdsRecord } from '@/lib/api-paid-seo'

interface PaidChannelGridProps {
  clinic: string
}

export default function PaidChannelGrid({ clinic }: PaidChannelGridProps) {
  const [data, setData] = useState<PaidAdsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [clinic])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/paid-ads?clinic=${clinic}`)
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
        <div className="text-lg">Loading paid ads data...</div>
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

  // Get unique campaigns and sort them
  const campaigns = [...new Set(data.map(row => row.campaign))]
    .filter((campaign): campaign is string => campaign !== null && campaign !== undefined && campaign !== 'unknown campaign')
    .sort()

  // Get ALL unique months from ALL data (not per campaign) and sort them (newest first)
  const allMonths = [...new Set(data.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6) // Get latest 6 months
  
  // Get current month for highlighting
  const currentMonth = allMonths[0] // Most recent month in data

  // Process each campaign separately
  const campaignGrids = campaigns.map(campaign => {
    // Filter data for this specific campaign
    const campaignData = data.filter(row => row.campaign === campaign)
    
    // Use the consistent months from all data
    const months = allMonths
    
    // Create monthly data map - one record per month for this campaign
    const monthlyData: Record<string, PaidAdsRecord | null> = {}
    
    months.forEach(month => {
      const monthRecord = campaignData.find(row => row.month === month)
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
      if (metric.includes('revenue') || metric.includes('spend') || 
          metric.includes('rev')) {
        return '$' + value.toLocaleString('en-US', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        })
      }
      
      // CTR and rate metrics (stored as decimals in paid_ads)
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
    
    // Define metric groups - using all fields from paid_ads table
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
        title: 'Financial Performance',
        metrics: [
          { key: 'spend', label: 'Ad Spend' },
          { key: 'appointment_est_revenue', label: 'Appointment Est. Revenue' },
          { key: 'new_appointment_est_6m_revenue', label: 'New Appointment 6M Revenue' }
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
      }
    ]
    
    // Get value for a specific metric and month
    const getValue = (metricKey: string, month: string) => {
      const record = monthlyData[month]
      return record ? record[metricKey as keyof PaidAdsRecord] : null
    }
    
    // Get all values for a metric across all months (for heatmap)
    const getMetricValues = (metricKey: string) => {
      return months.map(month => getValue(metricKey, month)).filter(v => v !== null) as number[]
    }
    
    // Only show if there's data
    if (months.length === 0) {
      return null
    }
    
    return (
      <Card key={campaign} className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl text-gray-900">
            {campaign}
            <span className="block sm:inline text-sm font-normal text-gray-600 mt-1 sm:mt-0 sm:ml-2">
              (Paid Campaign)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto -mx-px">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="divide-x divide-gray-200">
                    <th className="sticky left-0 z-10 bg-white text-left px-3 py-3 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider min-w-[120px] sm:min-w-[200px] shadow-r">
                      Metric
                    </th>
                    {months.map(month => (
                      <th 
                        key={month} 
                        className={`text-right px-3 py-3 text-xs sm:text-sm font-semibold uppercase tracking-wider min-w-[80px] sm:min-w-[100px] whitespace-nowrap border-l border-gray-200 ${
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
                        <td colSpan={months.length + 1} className="px-3 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 border-l-4 border-gray-400">
                          {group.title}
                        </td>
                      </tr>
                      {group.metrics.map((metric, metricIndex) => {
                        const allValues = getMetricValues(metric.key)
                        
                        return (
                          <tr key={`${groupIndex}-${metricIndex}`} className="divide-x divide-gray-100">
                            <td className="sticky left-0 z-10 bg-white px-3 py-3 text-xs sm:text-sm text-gray-800 shadow-r">
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
                              const numericValue = typeof value === 'number' ? value : null
                              const { bgColor, textColor } = getHeatmapColor(
                                numericValue,
                                allValues,
                                metric.key
                              )
                              
                              return (
                                <td 
                                  key={month} 
                                  className={`relative text-right px-3 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-l border-gray-100 transition-all hover:z-10 group cursor-pointer ${bgColor} ${
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

  if (campaigns.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-gray-900">Paid Ads</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">No paid ads data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {campaignGrids}
    </div>
  )
}