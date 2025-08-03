'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface CostEfficiencyProps {
  channels: any[]
  metric: 'cpl' | 'appointment_rate'
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

export default function CostEfficiency({ channels, metric }: CostEfficiencyProps) {
  if (!channels || channels.length === 0) return null

  const title = metric === 'cpl' ? 'Cost per Lead by Channel' : 'Lead to Appointment Rate'
  const dataKey = metric === 'cpl' ? 'cac' : 'appointment_rate'
  
  // Prepare and sort data
  const data = channels
    .map(ch => ({
      name: ch.traffic_source,
      value: metric === 'cpl' ? ch.cac : ch.appointment_rate,
      color: CHANNEL_COLORS[ch.traffic_source.toLowerCase()] || '#94A3B8'
    }))
    .filter(ch => ch.value > 0 && ch.value < Infinity)
    .sort((a, b) => {
      // For CPL, lower is better (ascending)
      // For appointment rate, higher is better (descending)
      return metric === 'cpl' ? a.value - b.value : b.value - a.value
    })

  const formatValue = (value: number) => {
    return metric === 'cpl' ? `$${value.toFixed(0)}` : `${value.toFixed(1)}%`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold capitalize">{payload[0].payload.name}</p>
          <p className="text-sm">
            {title.split(' by')[0]}: <span className="font-semibold">{formatValue(payload[0].value)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate average for reference line
  const average = data.reduce((sum, d) => sum + d.value, 0) / data.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-600">
          {metric === 'cpl' ? 'Lower is better' : 'Higher is better'}
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Best</p>
              <p className="font-semibold capitalize">
                {data[0].name}: {formatValue(data[0].value)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Average</p>
              <p className="font-semibold">{formatValue(average)}</p>
            </div>
            <div>
              <p className="text-gray-600">Worst</p>
              <p className="font-semibold capitalize">
                {data[data.length - 1].name}: {formatValue(data[data.length - 1].value)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}