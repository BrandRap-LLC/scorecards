'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'

interface ChannelTableProps {
  channels: any[]
}

export default function ChannelTable({ channels }: ChannelTableProps) {
  const [sortField, setSortField] = useState<string>('spend')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  if (!channels || channels.length === 0) return null

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedChannels = [...channels].sort((a, b) => {
    const aVal = a[sortField] || 0
    const bVal = b[sortField] || 0
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  const SortIcon = ({ field }: { field: string }) => {
    if (field !== sortField) return null
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3 inline ml-1" /> : 
      <ArrowDown className="h-3 w-3 inline ml-1" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Channel</th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('spend')}
                >
                  Spend <SortIcon field="spend" />
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('impressions')}
                >
                  Impr. <SortIcon field="impressions" />
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('visits')}
                >
                  Visits <SortIcon field="visits" />
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('leads')}
                >
                  Leads <SortIcon field="leads" />
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avg_conversion')}
                >
                  Conv % <SortIcon field="avg_conversion" />
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('cac')}
                >
                  CAC <SortIcon field="cac" />
                </th>
                <th 
                  className="text-right py-3 px-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avg_roas')}
                >
                  ROAS <SortIcon field="avg_roas" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedChannels.map((channel, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium capitalize">
                    {channel.traffic_source}
                  </td>
                  <td className="text-right py-3 px-2">
                    ${(channel.spend / 1000).toFixed(1)}K
                  </td>
                  <td className="text-right py-3 px-2">
                    {channel.impressions > 1000 
                      ? `${(channel.impressions / 1000).toFixed(0)}K`
                      : channel.impressions.toFixed(0)}
                  </td>
                  <td className="text-right py-3 px-2">
                    {channel.visits > 1000
                      ? `${(channel.visits / 1000).toFixed(1)}K`
                      : channel.visits.toFixed(0)}
                  </td>
                  <td className="text-right py-3 px-2 font-semibold">
                    {channel.leads}
                  </td>
                  <td className="text-right py-3 px-2">
                    {channel.avg_conversion.toFixed(1)}%
                  </td>
                  <td className="text-right py-3 px-2">
                    ${channel.cac.toFixed(0)}
                  </td>
                  <td className="text-right py-3 px-2 font-semibold">
                    {channel.avg_roas.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-50">
                <td className="py-3 px-2">Total</td>
                <td className="text-right py-3 px-2">
                  ${(sortedChannels.reduce((sum, ch) => sum + ch.spend, 0) / 1000).toFixed(1)}K
                </td>
                <td className="text-right py-3 px-2">
                  {(sortedChannels.reduce((sum, ch) => sum + ch.impressions, 0) / 1000).toFixed(0)}K
                </td>
                <td className="text-right py-3 px-2">
                  {(sortedChannels.reduce((sum, ch) => sum + ch.visits, 0) / 1000).toFixed(1)}K
                </td>
                <td className="text-right py-3 px-2">
                  {sortedChannels.reduce((sum, ch) => sum + ch.leads, 0)}
                </td>
                <td className="text-right py-3 px-2">
                  {(sortedChannels.reduce((sum, ch) => sum + ch.avg_conversion, 0) / sortedChannels.length).toFixed(1)}%
                </td>
                <td className="text-right py-3 px-2">
                  ${(sortedChannels.reduce((sum, ch) => sum + ch.spend, 0) / 
                     sortedChannels.reduce((sum, ch) => sum + ch.leads, 0)).toFixed(0)}
                </td>
                <td className="text-right py-3 px-2">
                  {(sortedChannels.reduce((sum, ch) => sum + ch.avg_roas, 0) / sortedChannels.length).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}