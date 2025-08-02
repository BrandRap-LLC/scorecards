import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface ValidationIssue {
  type: 'error' | 'warning' | 'info'
  metric: string
  company: string
  message: string
  value?: any
}

interface DataValidationProps {
  metrics: any[]
}

export function DataValidation({ metrics }: DataValidationProps) {
  const issues: ValidationIssue[] = []

  // Validation rules
  metrics.forEach(metric => {
    // Check for null trending values
    if (metric.trending_value === null && metric.value !== null) {
      issues.push({
        type: 'warning',
        metric: metric.display_name,
        company: metric.company_name,
        message: 'Missing trending value',
        value: metric.value
      })
    }

    // Check for unrealistic percentage values
    if (metric.field_code.includes('pct_') && metric.trending_value) {
      if (metric.trending_value > 100) {
        issues.push({
          type: 'error',
          metric: metric.display_name,
          company: metric.company_name,
          message: 'Percentage exceeds 100%',
          value: metric.trending_value
        })
      }
      if (metric.trending_value < 0) {
        issues.push({
          type: 'error',
          metric: metric.display_name,
          company: metric.company_name,
          message: 'Negative percentage value',
          value: metric.trending_value
        })
      }
    }

    // Check for extreme MoM changes
    if (metric.month_over_month_percent) {
      if (Math.abs(metric.month_over_month_percent) > 100) {
        issues.push({
          type: 'warning',
          metric: metric.display_name,
          company: metric.company_name,
          message: `Extreme MoM change: ${metric.month_over_month_percent.toFixed(1)}%`,
          value: metric.month_over_month_percent
        })
      }
    }

    // Check for missing goal comparisons
    if (metric.goal_value && !metric.goal_achievement_percent) {
      issues.push({
        type: 'info',
        metric: metric.display_name,
        company: metric.company_name,
        message: 'Goal achievement not calculated',
        value: metric.goal_value
      })
    }

    // Check for rating out of range
    if (metric.field_code === 'review_avg_rating' && metric.trending_value) {
      if (metric.trending_value > 5 || metric.trending_value < 1) {
        issues.push({
          type: 'error',
          metric: metric.display_name,
          company: metric.company_name,
          message: 'Rating out of valid range (1-5)',
          value: metric.trending_value
        })
      }
    }

    // Check for negative currency values
    if ((metric.field_code.includes('sales') || metric.field_code.includes('revenue')) && 
        metric.trending_value && metric.trending_value < 0) {
      issues.push({
        type: 'error',
        metric: metric.display_name,
        company: metric.company_name,
        message: 'Negative revenue/sales value',
        value: metric.trending_value
      })
    }
  })

  if (issues.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            All data validation checks passed
          </p>
        </div>
      </div>
    )
  }

  // Group issues by type
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')
  const info = issues.filter(i => i.type === 'info')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Data Validation Issues</h3>
      
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-2">
                {errors.length} Critical Issues Found
              </p>
              <ul className="space-y-1">
                {errors.slice(0, 5).map((issue, index) => (
                  <li key={index} className="text-sm text-red-700">
                    <span className="font-medium">{issue.company}</span> - {issue.metric}: {issue.message}
                  </li>
                ))}
                {errors.length > 5 && (
                  <li className="text-sm text-red-600 italic">
                    ... and {errors.length - 5} more errors
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                {warnings.length} Warnings
              </p>
              <ul className="space-y-1">
                {warnings.slice(0, 3).map((issue, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    <span className="font-medium">{issue.company}</span> - {issue.metric}: {issue.message}
                  </li>
                ))}
                {warnings.length > 3 && (
                  <li className="text-sm text-yellow-600 italic">
                    ... and {warnings.length - 3} more warnings
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {info.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                {info.length} informational items noted
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}