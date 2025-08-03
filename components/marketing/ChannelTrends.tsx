'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ChannelTrendsProps {
  data: any[]
}

const CHANNEL_COLORS: Record<string, string> = {
  'google ads': '#4285F4',
  'local seo': '#34A853', 
  'organic seo': '#0F9D58',
  'social ads': '#1877F2',
  'organic social': '#E1306C',
  'reactivation': '#9333EA',
  'others': '#6B7280',
  'test': '#F59E0B'
}

export default function ChannelTrends({ data }: ChannelTrendsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'leads' | 'spend' | 'roas' | 'conversion'>('leads')
  
  if (!data || data.length === 0) return null

  // Process data for time series
  const monthlyData = data.reduce((acc, row) => {
    const month = row.month.substring(0, 7) // YYYY-MM format
    if (!acc[month]) {
      acc[month] = { month }
    }
    
    const channel = row.traffic_source.toLowerCase().replace(/\s+/g, '_')
    
    if (!acc[month][`${channel}_${selectedMetric}`]) {
      acc[month][`${channel}_${selectedMetric}`] = 0
      acc[month][`${channel}_count`] = 0
    }
    
    switch (selectedMetric) {
      case 'leads':
        acc[month][`${channel}_${selectedMetric}`] += row.leads || 0
        break
      case 'spend':
        acc[month][`${channel}_${selectedMetric}`] += row.spend || 0
        break
      case 'roas':
        acc[month][`${channel}_${selectedMetric}`] += row.total_roas || row.roas || 0
        acc[month][`${channel}_count`] += 1
        break
      case 'conversion':
        acc[month][`${channel}_${selectedMetric}`] += row.total_conversion || row.conversion_rate || 0
        acc[month][`${channel}_count`] += 1
        break
    }
    
    return acc
  }, {} as Record<string, any>)

  // Calculate averages for ROAS and conversion
  if (selectedMetric === 'roas' || selectedMetric === 'conversion') {
    Object.keys(monthlyData).forEach(month => {
      const channels = new Set(
        Object.keys(monthlyData[month])
          .filter(k => k.endsWith('_count'))
          .map(k => k.replace('_count', ''))
      )
      
      channels.forEach(channel => {
        const count = monthlyData[month][`${channel}_count`]
        if (count > 0) {
          monthlyData[month][`${channel}_${selectedMetric}`] = 
            monthlyData[month][`${channel}_${selectedMetric}`] / count
        }
      })
    })
  }

  const chartData = Object.values(monthlyData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  )

  // Get unique channels
  const channels = [...new Set(data.map(d => d.traffic_source))]

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  const formatValue = (value: number) => {
    switch (selectedMetric) {
      case 'spend':
        return `$${(value / 1000).toFixed(1)}K`
      case 'roas':
        return value.toFixed(2)
      case 'conversion':
        return `${value.toFixed(1)}%`
      default:
        return value.toFixed(0)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Channel Performance Trends</CardTitle>
          <Select value={selectedMetric} onValueChange={(v: any) => setSelectedMetric(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leads">Leads</SelectItem>
              <SelectItem value="spend">Spend</SelectItem>
              <SelectItem value="roas">ROAS</SelectItem>
              <SelectItem value="conversion">Conversion %</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={formatMonth}
            />
            <YAxis 
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: any) => formatValue(value)}
              labelFormatter={(label) => formatMonth(label)}
            />
            <Legend />
            {channels.map(channel => {
              const dataKey = `${channel.toLowerCase().replace(/\s+/g, '_')}_${selectedMetric}`
              return (
                <Line
                  key={channel}
                  type="monotone"
                  dataKey={dataKey}
                  name={channel}
                  stroke={CHANNEL_COLORS[channel.toLowerCase()] || '#94A3B8'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}