import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardsProps {
  data: {
    totalSpend: number
    totalLeads: number
    totalVisits: number
    totalAppointments: number
    avgROAS: number
    avgConversion: number
    avgCAC: number
  }
  changes?: {
    spend?: { value: number; percent: number }
    leads?: { value: number; percent: number }
    roas?: { value: number; percent: number }
    conversion?: { value: number; percent: number }
    cac?: { value: number; percent: number }
  }
}

export default function KPICards({ data, changes }: KPICardsProps) {
  if (!data) return null

  const kpis = [
    {
      label: 'Total Spend',
      value: `$${(data.totalSpend / 1000).toFixed(1)}K`,
      change: changes?.spend,
      format: 'currency',
      inverse: false
    },
    {
      label: 'Total Leads',
      value: data.totalLeads.toLocaleString(),
      change: changes?.leads,
      format: 'number',
      inverse: false
    },
    {
      label: 'Avg ROAS',
      value: data.avgROAS.toFixed(2),
      change: changes?.roas,
      format: 'decimal',
      inverse: false
    },
    {
      label: 'Avg Conv %',
      value: `${data.avgConversion.toFixed(1)}%`,
      change: changes?.conversion,
      format: 'percentage',
      inverse: false
    },
    {
      label: 'Avg CAC',
      value: `$${data.avgCAC.toFixed(0)}`,
      change: changes?.cac,
      format: 'currency',
      inverse: true // Lower CAC is better
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const changePercent = kpi.change?.percent || 0
        const isPositive = kpi.inverse ? changePercent < 0 : changePercent > 0
        const isNegative = kpi.inverse ? changePercent > 0 : changePercent < 0
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              {kpi.change && (
                <div className="flex items-center mt-2">
                  {changePercent === 0 ? (
                    <Minus className="h-4 w-4 text-gray-400 mr-1" />
                  ) : isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    changePercent === 0 ? 'text-gray-400' :
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}% MoM
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}