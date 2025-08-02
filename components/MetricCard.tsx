'use client'

import { ArrowUp, ArrowDown, Minus, Target } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber, cn } from '@/lib/utils'

interface MetricCardProps {
  company: string
  metricName: string
  fieldCode: string
  actual: number | null | undefined
  trending: number | null | undefined
  momPercent: number | null | undefined
  yoyPercent: number | null | undefined
  goal?: number | null | undefined
  goalPercent?: number | null | undefined
  format: 'currency' | 'number' | 'percent' | 'rating'
  className?: string
}

export function MetricCard({
  company,
  metricName,
  fieldCode,
  actual,
  trending,
  momPercent,
  yoyPercent,
  goal,
  goalPercent,
  format,
  className
}: MetricCardProps) {
  // Format the main value
  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percent':
        return formatPercent(value)
      case 'rating':
        return `${value.toFixed(1)}★`
      default:
        return formatNumber(value)
    }
  }

  // Get comparison icon and color
  const getComparisonDisplay = (percent: number | null | undefined) => {
    if (percent === null || percent === undefined) {
      return { icon: <Minus className="h-3 w-3" />, color: 'text-gray-500', text: 'N/A' }
    }

    const absPercent = Math.abs(percent)
    const text = absPercent > 1000 ? '>1000%' : `${absPercent.toFixed(2)}%`
    
    if (percent > 0) {
      return { 
        icon: <ArrowUp className="h-3 w-3" />, 
        color: 'text-green-600',
        text: `+${text}`
      }
    } else if (percent < 0) {
      return { 
        icon: <ArrowDown className="h-3 w-3" />, 
        color: 'text-red-600',
        text: `-${text}`
      }
    } else {
      return { 
        icon: <Minus className="h-3 w-3" />, 
        color: 'text-gray-500',
        text: '0.00%'
      }
    }
  }

  const momDisplay = getComparisonDisplay(momPercent)
  const yoyDisplay = getComparisonDisplay(yoyPercent)
  const goalDisplay = goalPercent !== null && goalPercent !== undefined 
    ? getComparisonDisplay(goalPercent - 100) // Goal is stored as achievement %, we want vs goal
    : null

  // Determine if this is net_sales (only metric with goal)
  const showGoal = fieldCode === 'net_sales' && goal !== null && goal !== undefined

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4",
      className
    )}>
      {/* Metric Name */}
      <h4 className="text-sm font-medium text-gray-700 mb-3">{metricName}</h4>
      
      {/* Values Section */}
      <div className="space-y-2 mb-3">
        {/* Trending Value (Primary) */}
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(trending)}
          </div>
          <div className="text-xs text-gray-500">Trending</div>
        </div>
        
        {/* Actual Value (Secondary) */}
        {actual !== trending && (
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-600">Actual:</span>
            <span className="text-sm font-medium text-gray-700">
              {formatValue(actual)}
            </span>
          </div>
        )}
      </div>
      
      {/* Comparisons */}
      <div className="space-y-1.5 pt-3 border-t border-gray-100">
        {/* MoM Comparison */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">vs Jun '25:</span>
          <div className={cn("flex items-center gap-0.5", momDisplay.color)}>
            {momDisplay.icon}
            <span className="text-xs font-semibold">{momDisplay.text}</span>
          </div>
        </div>
        
        {/* YoY Comparison */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">vs Jul '24:</span>
          <div className={cn("flex items-center gap-0.5", yoyDisplay.color)}>
            {yoyDisplay.icon}
            <span className="text-xs font-semibold">{yoyDisplay.text}</span>
          </div>
        </div>
        
        {/* Goal Comparison (only for net_sales) */}
        {showGoal && goalDisplay && (
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              <Target className="h-3 w-3 inline mr-1" />
              Goal:
            </span>
            <div className="flex items-col gap-2">
              <span className="text-xs text-gray-600">
                {formatValue(goal)}
              </span>
              <div className={cn("flex items-center gap-0.5", goalDisplay.color)}>
                <span className="text-xs font-semibold">({goalDisplay.text})</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}