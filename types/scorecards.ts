// Types for Weekly Scorecards

export interface WeeklyMetric {
  id: number
  company_id: number
  company_name: string
  company_display_name: string
  metric_id: number
  metric_code: string
  metric_name: string
  category: string
  format_type: 'currency' | 'number' | 'percent' | 'rating'
  year: number
  week_number: number
  week_start_date: string
  week_end_date: string
  value: number | null
  trending_value: number | null
  is_mtd: boolean
  is_complete: boolean
  wow_change: number | null  // Week-over-week change
  wow_percent: number | null  // Week-over-week percentage
  four_week_avg: number | null
  twelve_week_avg: number | null
  created_at: string
  updated_at: string
}

export interface ScorecardsMetric {
  id: number
  metric_code: string
  display_name: string
  category: string
  unit_type: string
  format_type: 'currency' | 'number' | 'percent' | 'rating'
  sort_order: number
  is_active: boolean
}

export interface WeeklySummary {
  company_id: number
  company_name: string
  company_display_name: string
  week_number: number
  week_start: string
  week_end: string
  year: number
  is_mtd: boolean
  is_complete: boolean
  metrics_count: number
  last_updated: string
}

export interface WeeklyComparison {
  metric_code: string
  metric_name: string
  category: string
  format_type: string
  companies: {
    company_id: number
    company_name: string
    weeks: {
      week_number: number
      value: number | null
      is_mtd: boolean
    }[]
  }[]
}

// Helper types for grid view
export interface WeeklyGridData {
  [companyId: number]: {
    companyName: string
    displayName: string
    metrics: {
      [metricId: number]: {
        metricName: string
        metricCode: string
        category: string
        formatType: string
        weeklyValues: {
          [weekNumber: number]: {
            value: number | null
            is_mtd: boolean
            week_start: string
            week_end: string
          }
        }
      }
    }
  }
}

// Types for MSSQL source table
export interface ExecutiveReportWeek {
  company_id: number
  company_name: string
  year: number
  week_number: number
  week_start_date: string
  week_end_date: string
  // All metric columns from executive_report_new_week
  // Excluding: total_conversations, new_conversations, returning_conversations
  [key: string]: any
}