'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ChannelMixChartsProps {
  channels: any[]
  type: 'spend' | 'leads'
}

// Channel color scheme
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

export default function ChannelMixCharts({ channels, type }: ChannelMixChartsProps) {
  if (!channels || channels.length === 0) return null

  // Prepare data based on type
  const total = type === 'spend' 
    ? channels.reduce((sum, ch) => sum + ch.spend, 0)
    : channels.reduce((sum, ch) => sum + ch.leads, 0)

  const data = channels
    .map(ch => ({
      name: ch.traffic_source,
      value: type === 'spend' ? ch.spend : ch.leads,
      percentage: ((type === 'spend' ? ch.spend : ch.leads) / total * 100).toFixed(1),
      displayValue: type === 'spend' 
        ? `$${(ch.spend / 1000).toFixed(1)}K`
        : ch.leads.toLocaleString()
    }))
    .sort((a, b) => b.value - a.value)
    .filter(ch => ch.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold capitalize">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.payload.displayValue} ({data.payload.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show label for small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Channel Mix ({type === 'spend' ? 'Spend' : 'Leads'})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHANNEL_COLORS[entry.name.toLowerCase()] || '#94A3B8'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value: string, entry: any) => (
                <span className="text-sm capitalize">
                  {value} ({entry.payload.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Top 3 Channels Summary */}
        <div className="mt-4 space-y-2">
          {data.slice(0, 3).map((ch, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: CHANNEL_COLORS[ch.name.toLowerCase()] || '#94A3B8' }}
                />
                <span className="capitalize">{ch.name}</span>
              </div>
              <span className="font-semibold">
                {ch.displayValue} ({ch.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}