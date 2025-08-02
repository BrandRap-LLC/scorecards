import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { formatChange, cn } from '@/lib/utils'

interface Comparison {
  label: string
  value: number | null | undefined
  isPercent?: boolean
}

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  comparisons?: Comparison[]
  trend?: number[]
  className?: string
}

export function KPICard({ 
  title, 
  value, 
  subtitle,
  comparisons = [],
  className 
}: KPICardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow", className)}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 ml-2">{subtitle}</p>
        )}
      </div>
      
      {comparisons.length > 0 && (
        <div className="space-y-1.5">
          {comparisons.map((comparison, index) => {
            const change = formatChange(comparison.value, comparison.isPercent)
            // Shorten labels for better fit
            const shortLabel = comparison.label
              .replace('vs Last Month', 'MoM')
              .replace('Goal Achievement', 'vs Goal')
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">{shortLabel}:</span>
                <div className={cn("flex items-center gap-0.5", change.color)}>
                  {change.icon === 'up' && <ArrowUp className="h-2.5 w-2.5" />}
                  {change.icon === 'down' && <ArrowDown className="h-2.5 w-2.5" />}
                  {change.icon === 'neutral' && <Minus className="h-2.5 w-2.5" />}
                  <span className="font-semibold text-xs">{change.text}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}