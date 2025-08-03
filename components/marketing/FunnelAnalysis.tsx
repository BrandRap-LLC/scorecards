'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface FunnelAnalysisProps {
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

export default function FunnelAnalysis({ channels }: FunnelAnalysisProps) {
  if (!channels || channels.length === 0) return null

  // Create funnel data for each channel
  const funnelData = channels.map(ch => {
    const impressions = ch.impressions || 0
    const visits = ch.visits || 0
    const leads = ch.leads || 0
    const appointments = ch.appointments || 0
    
    return {
      channel: ch.traffic_source,
      data: [
        { stage: 'Impressions', value: impressions, rate: 100 },
        { stage: 'Visits', value: visits, rate: impressions > 0 ? (visits / impressions) * 100 : 0 },
        { stage: 'Leads', value: leads, rate: visits > 0 ? (leads / visits) * 100 : 0 },
        { stage: 'Appointments', value: appointments, rate: leads > 0 ? (appointments / leads) * 100 : 0 }
      ],
      color: CHANNEL_COLORS[ch.traffic_source.toLowerCase()] || '#94A3B8'
    }
  }).filter(ch => ch.data[0].value > 0) // Filter out channels with no impressions

  // Sort by lead volume
  funnelData.sort((a, b) => b.data[2].value - a.data[2].value)

  // Take top 5 channels for display
  const topChannels = funnelData.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel by Channel</CardTitle>
        <p className="text-sm text-gray-600">Top 5 channels by lead volume</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {topChannels.map((channel, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold capitalize flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: channel.color }}
                  />
                  {channel.channel}
                </h4>
                <span className="text-sm text-gray-600">
                  {channel.data[3].value} appointments from {channel.data[2].value} leads
                </span>
              </div>
              
              {/* Funnel visualization */}
              <div className="relative">
                <div className="flex items-center space-x-1">
                  {channel.data.map((stage, stageIdx) => (
                    <div key={stageIdx} className="flex-1">
                      <div 
                        className="relative overflow-hidden rounded"
                        style={{
                          height: '40px',
                          backgroundColor: channel.color,
                          opacity: 1 - (stageIdx * 0.2),
                          width: `${100 - (stageIdx * 15)}%`,
                          marginLeft: stageIdx > 0 ? 'auto' : '0',
                          marginRight: 'auto'
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {stage.value > 1000 ? `${(stage.value / 1000).toFixed(1)}K` : stage.value}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-center mt-1 text-gray-600">
                        {stage.stage}
                        {stageIdx > 0 && stage.rate > 0 && (
                          <span className="block font-semibold">
                            {stage.rate.toFixed(1)}%
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary metrics */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Funnel Efficiency by Stage</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Impression → Visit</p>
              <p className="font-semibold">
                {(channels.reduce((sum, ch) => sum + (ch.visits || 0), 0) / 
                  channels.reduce((sum, ch) => sum + (ch.impressions || 0), 0) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Visit → Lead</p>
              <p className="font-semibold">
                {(channels.reduce((sum, ch) => sum + (ch.leads || 0), 0) / 
                  channels.reduce((sum, ch) => sum + (ch.visits || 0), 0) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">Lead → Appointment</p>
              <p className="font-semibold">
                {(channels.reduce((sum, ch) => sum + (ch.appointments || 0), 0) / 
                  channels.reduce((sum, ch) => sum + (ch.leads || 0), 0) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}