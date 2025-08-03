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
}

export default function KPICards({ data }: KPICardsProps) {
  if (!data) return null

  const kpis = [
    {
      label: 'Total Spend',
      value: `$${(data.totalSpend / 1000).toFixed(1)}K`,
      change: null,
      format: 'currency'
    },
    {
      label: 'Total Leads',
      value: data.totalLeads.toLocaleString(),
      change: null,
      format: 'number'
    },
    {
      label: 'Avg ROAS',
      value: data.avgROAS.toFixed(2),
      change: null,
      format: 'decimal'
    },
    {
      label: 'Avg Conv %',
      value: `${data.avgConversion.toFixed(1)}%`,
      change: null,
      format: 'percentage'
    },
    {
      label: 'Avg CAC',
      value: `$${data.avgCAC.toFixed(0)}`,
      change: null,
      format: 'currency'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            {kpi.change !== null && (
              <div className="flex items-center mt-2">
                {kpi.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : kpi.change < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <span className={`text-sm ${
                  kpi.change > 0 ? 'text-green-600' : 
                  kpi.change < 0 ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {Math.abs(kpi.change)}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}