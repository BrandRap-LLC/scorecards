'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'

interface PerformanceMatrixProps {
  channels: any[]
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

export default function PerformanceMatrix({ channels }: PerformanceMatrixProps) {
  if (!channels || channels.length === 0) return null

  // Prepare data for scatter plot
  const data = channels.map(ch => ({
    name: ch.traffic_source,
    x: ch.spend,
    y: ch.avg_roas,
    z: ch.leads, // Size of bubble
    fill: CHANNEL_COLORS[ch.traffic_source.toLowerCase()] || '#94A3B8'
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold capitalize mb-1">{data.name}</p>
          <div className="text-sm space-y-1">
            <p>Spend: <span className="font-semibold">${(data.x / 1000).toFixed(1)}K</span></p>
            <p>ROAS: <span className="font-semibold">{data.y.toFixed(2)}</span></p>
            <p>Leads: <span className="font-semibold">{data.z}</span></p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    const radius = Math.sqrt(payload.z) * 2 // Scale bubble size based on leads
    
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={Math.min(radius, 30)} // Cap maximum size
          fill={payload.fill}
          fillOpacity={0.7}
          stroke={payload.fill}
          strokeWidth={2}
        />
        {radius > 15 && ( // Only show label for larger bubbles
          <text
            x={cx}
            y={cy}
            fill="white"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs font-semibold"
          >
            {payload.name.split(' ')[0].toUpperCase()}
          </text>
        )}
      </g>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance Matrix</CardTitle>
        <p className="text-sm text-gray-600">
          Bubble size represents lead volume
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Spend"
              unit="$"
              label={{ value: 'Spend ($)', position: 'insideBottom', offset: -10 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              domain={[0, 'dataMax + 5000']}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="ROAS"
              label={{ value: 'ROAS', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax + 1']}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <ZAxis type="number" dataKey="z" range={[0, 900]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              name="Channels"
              data={data}
              shape={<CustomDot />}
            />
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Performance Quadrants Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span>High ROAS, High Spend (Scale)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
            <span>High ROAS, Low Spend (Grow)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
            <span>Low ROAS, High Spend (Optimize)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <span>Low ROAS, Low Spend (Review)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}