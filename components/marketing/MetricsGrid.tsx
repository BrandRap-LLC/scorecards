'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsGridProps {
  data: any[]
}

export default function MetricsGrid({ data }: MetricsGridProps) {
  // Group data by month
  const monthlyData: Record<string, any> = {}
  
  data.forEach(row => {
    const month = row.month.substring(0, 7) // YYYY-MM format
    if (!monthlyData[month]) {
      monthlyData[month] = {
        impressions: 0,
        visits: 0,
        leads: 0,
        new_leads: 0,
        returning_leads: 0,
        conversion_rate: 0,
        total_conversion: 0,
        new_conversion: 0,
        spend: 0,
        total_estimated_revenue: 0,
        new_estimated_revenue: 0,
        total_roas: 0,
        new_roas: 0,
        roas: 0,
        cac_total: 0,
        cac_new: 0,
        total_appointments: 0,
        new_appointments: 0,
        returning_appointments: 0,
        online_booking: 0,
        total_conversations: 0,
        new_conversations: 0,
        returning_conversations: 0,
        ltv: 0,
        estimated_ltv_6m: 0,
        avg_ltv: 0,
        avg_estimated_ltv_6m: 0,
        avg_appointment_rev: 0,
        count: 0
      }
    }
    
    // Sum up all metrics
    monthlyData[month].impressions += row.impressions || 0
    monthlyData[month].visits += row.visits || 0
    monthlyData[month].leads += row.leads || 0
    monthlyData[month].new_leads += row.new_leads || 0
    monthlyData[month].returning_leads += row.returning_leads || 0
    monthlyData[month].conversion_rate += row.conversion_rate || 0
    monthlyData[month].total_conversion += row.total_conversion || 0
    monthlyData[month].new_conversion += row.new_conversion || 0
    monthlyData[month].spend += row.spend || 0
    monthlyData[month].total_estimated_revenue += row.total_estimated_revenue || 0
    monthlyData[month].new_estimated_revenue += row.new_estimated_revenue || 0
    monthlyData[month].total_roas += row.total_roas || 0
    monthlyData[month].new_roas += row.new_roas || 0
    monthlyData[month].roas += row.roas || 0
    monthlyData[month].cac_total += row.cac_total || 0
    monthlyData[month].cac_new += row.cac_new || 0
    monthlyData[month].total_appointments += row.total_appointments || 0
    monthlyData[month].new_appointments += row.new_appointments || 0
    monthlyData[month].returning_appointments += row.returning_appointments || 0
    monthlyData[month].online_booking += row.online_booking || 0
    monthlyData[month].total_conversations += row.total_conversations || 0
    monthlyData[month].new_conversations += row.new_conversations || 0
    monthlyData[month].returning_conversations += row.returning_conversations || 0
    monthlyData[month].ltv += row.ltv || 0
    monthlyData[month].estimated_ltv_6m += row.estimated_ltv_6m || 0
    monthlyData[month].avg_ltv += row.avg_ltv || 0
    monthlyData[month].avg_estimated_ltv_6m += row.avg_estimated_ltv_6m || 0
    monthlyData[month].avg_appointment_rev += row.avg_appointment_rev || 0
    monthlyData[month].count++
  })
  
  // For averaged metrics, divide by count
  Object.keys(monthlyData).forEach(month => {
    const count = monthlyData[month].count
    if (count > 0) {
      monthlyData[month].conversion_rate = monthlyData[month].conversion_rate / count
      monthlyData[month].total_conversion = monthlyData[month].total_conversion / count
      monthlyData[month].new_conversion = monthlyData[month].new_conversion / count
      monthlyData[month].total_roas = monthlyData[month].total_roas / count
      monthlyData[month].new_roas = monthlyData[month].new_roas / count
      monthlyData[month].roas = monthlyData[month].roas / count
      monthlyData[month].cac_total = monthlyData[month].cac_total / count
      monthlyData[month].cac_new = monthlyData[month].cac_new / count
      monthlyData[month].avg_ltv = monthlyData[month].avg_ltv / count
      monthlyData[month].avg_estimated_ltv_6m = monthlyData[month].avg_estimated_ltv_6m / count
      monthlyData[month].avg_appointment_rev = monthlyData[month].avg_appointment_rev / count
    }
  })
  
  // Get sorted months
  const months = Object.keys(monthlyData).sort()
  
  // Format month for display
  const formatMonth = (month: string) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('en-US', { month: 'short' })
  }
  
  // Format value based on metric type
  const formatValue = (metric: string, value: number) => {
    if (value === 0) return '0'
    
    // Currency metrics
    if (metric.includes('revenue') || metric.includes('spend') || metric.includes('cac') || 
        metric.includes('ltv') || metric.includes('appointment_rev')) {
      return '$' + value.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
    }
    
    // ROAS metrics (show as decimal with 2 places)
    if (metric.includes('roas')) {
      return value.toFixed(2)
    }
    
    // Conversion metrics (show as percentage)
    if (metric.includes('conversion')) {
      return (value * 100).toFixed(1) + '%'
    }
    
    // Integer metrics
    return Math.round(value).toLocaleString('en-US')
  }
  
  // Define metric groups and order
  const metricGroups = [
    {
      title: 'Traffic & Engagement',
      metrics: [
        { key: 'impressions', label: 'Impressions' },
        { key: 'visits', label: 'Visits' }
      ]
    },
    {
      title: 'Lead Generation',
      metrics: [
        { key: 'leads', label: 'Leads (Total)' },
        { key: 'new_leads', label: 'New Leads' },
        { key: 'returning_leads', label: 'Returning Leads' }
      ]
    },
    {
      title: 'Conversion Rates',
      metrics: [
        { key: 'conversion_rate', label: 'Conversion Rate' },
        { key: 'total_conversion', label: 'Total Conversion' },
        { key: 'new_conversion', label: 'New Conversion' }
      ]
    },
    {
      title: 'Financial Performance',
      metrics: [
        { key: 'spend', label: 'Spend' },
        { key: 'total_estimated_revenue', label: 'Total Estimated Revenue' },
        { key: 'new_estimated_revenue', label: 'New Estimated Revenue' },
        { key: 'total_roas', label: 'Total ROAS' },
        { key: 'new_roas', label: 'New ROAS' },
        { key: 'roas', label: 'ROAS' }
      ]
    },
    {
      title: 'Cost Analysis',
      metrics: [
        { key: 'cac_total', label: 'CAC (Total)' },
        { key: 'cac_new', label: 'CAC (New)' }
      ]
    },
    {
      title: 'Appointments',
      metrics: [
        { key: 'total_appointments', label: 'Total Appointments' },
        { key: 'new_appointments', label: 'New Appointments' },
        { key: 'returning_appointments', label: 'Returning Appointments' },
        { key: 'online_booking', label: 'Online Booking' }
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
      title: 'Lifetime Value',
      metrics: [
        { key: 'ltv', label: 'LTV' },
        { key: 'estimated_ltv_6m', label: 'Estimated LTV (6m)' },
        { key: 'avg_ltv', label: 'Avg LTV' },
        { key: 'avg_estimated_ltv_6m', label: 'Avg Estimated LTV (6m)' },
        { key: 'avg_appointment_rev', label: 'Avg Appointment Revenue' }
      ]
    }
  ]
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-gray-900">Performance Metrics Grid</CardTitle>
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
                  <tr className="bg-gray-100">
                    <td colSpan={months.length + 1} className="p-2 font-semibold text-sm text-gray-700">
                      {group.title}
                    </td>
                  </tr>
                  {group.metrics.map((metric, metricIndex) => (
                    <tr key={`${groupIndex}-${metricIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 text-sm text-gray-800">{metric.label}</td>
                      {months.map(month => (
                        <td key={month} className="text-right p-2 text-sm text-gray-900 font-medium">
                          {formatValue(metric.key, monthlyData[month]?.[metric.key] || 0)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}