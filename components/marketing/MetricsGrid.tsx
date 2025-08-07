'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getHeatmapColor } from '@/lib/heatmap'
import HeatmapLegend from '@/components/HeatmapLegend'

interface MetricsGridProps {
  data: any[]
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  // Get unique months and sort them (newest first)
  const months = [...new Set(data.map(row => row.month))]
    .sort()
    .reverse()
    .slice(0, 6) // Get latest 6 months
  
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
    
    // Percentage metrics
    if (metric.includes('conversion') || metric.includes('rate')) {
      return value.toFixed(1) + '%'
    }
    
    // Default: show as integer
    return Math.round(value).toLocaleString()
  }
  
  // Define metric groups in display order
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
    const record = data.find(d => d.month === month)
    return record ? record[metricKey] : null
  }
  
  // Get all values for a metric across all months (for heatmap)
  const getMetricValues = (metricKey: string) => {
    return months.map(month => getValue(metricKey, month))
  }
  
  return (
    <div className="space-y-4">
      <HeatmapLegend showInverted={true} />
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-gray-900">Monthly Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
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
                                className={`text-right p-2 text-sm font-medium ${bgColor} ${
                                  monthIndex === 0 ? 'ring-2 ring-blue-400 ring-inset' : ''
                                }`}
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
    </div>
  )
}