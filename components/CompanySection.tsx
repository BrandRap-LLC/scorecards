'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react'
import { MetricCard } from './MetricCard'
import { LatestMetric } from '@/types/database'
import { cn } from '@/lib/utils'

interface CompanySectionProps {
  companyName: string
  metrics: LatestMetric[]
  defaultExpanded?: boolean
  className?: string
}

// Key metrics to always show
const KEY_METRICS = [
  'net_sales',
  'total_patient',
  'revenue_per_appointment',
  'pct_injector_utilization'
]

export function CompanySection({
  companyName,
  metrics,
  defaultExpanded = false,
  className
}: CompanySectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  
  // Format company name for display (remove .com, capitalize)
  const displayName = companyName
    .replace(/\.(com|net)$/, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Separate key metrics from others
  const keyMetrics = metrics.filter(m => KEY_METRICS.includes(m.field_code))
  const otherMetrics = metrics.filter(m => !KEY_METRICS.includes(m.field_code))
  
  // Group other metrics by category
  const metricsByCategory = otherMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, LatestMetric[]>)
  
  return (
    <div className={cn("bg-gray-50 rounded-lg p-4", className)}>
      {/* Header */}
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
          <span className="text-xs text-gray-500 ml-2">({companyName})</span>
        </div>
        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Key Metrics - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {keyMetrics.map((metric) => (
          <MetricCard
            key={metric.field_code}
            title={metric.display_name}
            value={metric.trending_value ?? null}
            formatType={
              metric.format_type === 'currency' ? 'currency' :
              metric.format_type === 'percent' ? 'percent' :
              'number'
            }
            change={metric.month_over_month_percent ?? undefined}
            changeType="percent"
          />
        ))}
      </div>
      
      {/* Expanded Metrics */}
      {expanded && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                {category} Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {categoryMetrics.map((metric) => (
                  <MetricCard
                    key={metric.field_code}
                    title={metric.display_name}
                    value={metric.trending_value ?? null}
                    formatType={
                      metric.format_type === 'currency' ? 'currency' :
                      metric.format_type === 'percent' ? 'percent' :
                      'number'
                    }
                    change={metric.month_over_month_percent ?? undefined}
                    changeType="percent"
                    size="small"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Expand/Collapse Hint */}
      {!expanded && otherMetrics.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Show {otherMetrics.length} more metrics
          </button>
        </div>
      )}
    </div>
  )
}