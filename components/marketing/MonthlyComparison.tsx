'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MonthlyComparisonProps {
  data: any[]
}

export default function MonthlyComparison({ data }: MonthlyComparisonProps) {
  if (!data || data.length === 0) return null

  // Format data for charts
  const chartData = data.map(month => ({
    month: formatMonth(month.month),
    spend: month.spend,
    leads: month.leads,
    roas: month.avgROAS,
    conversion: month.avgConversion,
    cac: month.avgCAC,
    appointments: month.appointments
  }))

  function formatMonth(monthStr: string) {
    const date = new Date(monthStr + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  // Get latest month changes
  const latestMonth = data[data.length - 1]
  const changes = latestMonth?.changes || {}

  // Metric cards with MoM changes
  const metrics = [
    { 
      label: 'Spend', 
      value: latestMonth?.spend, 
      change: changes.spend,
      format: 'currency'
    },
    { 
      label: 'Leads', 
      value: latestMonth?.leads, 
      change: changes.leads,
      format: 'number'
    },
    { 
      label: 'ROAS', 
      value: latestMonth?.avgROAS, 
      change: changes.roas,
      format: 'decimal'
    },
    { 
      label: 'Conversion %', 
      value: latestMonth?.avgConversion, 
      change: changes.conversion,
      format: 'percentage'
    },
    { 
      label: 'CAC', 
      value: latestMonth?.avgCAC, 
      change: changes.cac,
      format: 'currency',
      inverse: true // Lower is better
    }
  ]

  const formatValue = (value: number, format: string) => {
    if (!value && value !== 0) return 'N/A'
    switch (format) {
      case 'currency':
        return `$${value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(0)}`
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'decimal':
        return value.toFixed(2)
      default:
        return value.toLocaleString()
    }
  }

  const getChangeIcon = (change: any, inverse = false) => {
    if (!change || change.percent === 0) return <Minus className="h-4 w-4 text-gray-400" />
    
    const isPositive = inverse ? change.percent < 0 : change.percent > 0
    
    if (isPositive) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />
    }
  }

  const getChangeColor = (change: any, inverse = false) => {
    if (!change || change.percent === 0) return 'text-gray-500'
    const isPositive = inverse ? change.percent < 0 : change.percent > 0
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* MoM Change Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
            <p className="text-xl font-bold text-gray-900">
              {formatValue(metric.value, metric.format)}
            </p>
            {metric.change && (
              <div className="flex items-center mt-2">
                {getChangeIcon(metric.change, metric.inverse)}
                <span className={`text-sm ml-1 ${getChangeColor(metric.change, metric.inverse)}`}>
                  {Math.abs(metric.change.percent).toFixed(1)}% MoM
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend & Leads Trend */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Spend & Leads Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="spend"
                stroke="#2563eb"
                name="Spend ($)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="leads"
                stroke="#10b981"
                name="Leads"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS & Conversion Trend */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ROAS & Conversion Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="roas"
                stroke="#8b5cf6"
                name="ROAS"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="conversion"
                stroke="#f59e0b"
                name="Conv %"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Performance Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3">Month</th>
                <th className="text-right py-2 px-3">Spend</th>
                <th className="text-right py-2 px-3">Leads</th>
                <th className="text-right py-2 px-3">ROAS</th>
                <th className="text-right py-2 px-3">Conv %</th>
                <th className="text-right py-2 px-3">CAC</th>
                <th className="text-right py-2 px-3">Appointments</th>
              </tr>
            </thead>
            <tbody>
              {data.map((month, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{formatMonth(month.month)}</td>
                  <td className="text-right py-2 px-3">
                    ${(month.spend / 1000).toFixed(1)}K
                    {idx > 0 && month.changes?.spend && (
                      <span className={`text-xs ml-1 ${getChangeColor(month.changes.spend)}`}>
                        ({month.changes.spend.percent > 0 ? '+' : ''}{month.changes.spend.percent.toFixed(0)}%)
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3">
                    {month.leads}
                    {idx > 0 && month.changes?.leads && (
                      <span className={`text-xs ml-1 ${getChangeColor(month.changes.leads)}`}>
                        ({month.changes.leads.percent > 0 ? '+' : ''}{month.changes.leads.percent.toFixed(0)}%)
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3">
                    {month.avgROAS.toFixed(2)}
                    {idx > 0 && month.changes?.roas && (
                      <span className={`text-xs ml-1 ${getChangeColor(month.changes.roas)}`}>
                        ({month.changes.roas.percent > 0 ? '+' : ''}{month.changes.roas.percent.toFixed(0)}%)
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3">
                    {month.avgConversion.toFixed(1)}%
                    {idx > 0 && month.changes?.conversion && (
                      <span className={`text-xs ml-1 ${getChangeColor(month.changes.conversion)}`}>
                        ({month.changes.conversion.percent > 0 ? '+' : ''}{month.changes.conversion.percent.toFixed(0)}%)
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3">
                    ${month.avgCAC.toFixed(0)}
                    {idx > 0 && month.changes?.cac && (
                      <span className={`text-xs ml-1 ${getChangeColor(month.changes.cac, true)}`}>
                        ({month.changes.cac.percent > 0 ? '+' : ''}{month.changes.cac.percent.toFixed(0)}%)
                      </span>
                    )}
                  </td>
                  <td className="text-right py-2 px-3">{month.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}