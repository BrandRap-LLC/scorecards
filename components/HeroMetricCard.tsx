import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { formatChange, cn } from '@/lib/utils'

interface HeroMetricCardProps {
  title: string
  value: string
  subtitle?: string
  trend: {
    value: number | null | undefined
    isPercent?: boolean
  }
  comparison: {
    label: string
    value: number | null | undefined
    isPercent?: boolean
  }
  icon?: React.ReactNode
  className?: string
  accentColor?: string
}

export function HeroMetricCard({ 
  title, 
  value, 
  subtitle,
  trend,
  comparison,
  icon,
  className,
  accentColor = 'blue'
}: HeroMetricCardProps) {
  const trendData = formatChange(trend.value, trend.isPercent)
  const comparisonData = formatChange(comparison.value, comparison.isPercent)
  
  const accentClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    orange: 'border-orange-500 bg-orange-50'
  }

  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-l-4",
      accentClasses[accentColor as keyof typeof accentClasses],
      className
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        {icon && (
          <div className="p-3 bg-gray-100 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500">MoM:</span>
          <div className={cn("flex items-center gap-0.5", trendData.color)}>
            {trendData.icon === 'up' && <ArrowUp className="h-3 w-3" />}
            {trendData.icon === 'down' && <ArrowDown className="h-3 w-3" />}
            {trendData.icon === 'neutral' && <Minus className="h-3 w-3" />}
            <span className="font-semibold text-xs">{trendData.text}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-500">{comparison.label}:</span>
          <span className={cn("font-semibold text-xs", comparisonData.color)}>
            {comparisonData.text}
          </span>
        </div>
      </div>
    </div>
  )
}