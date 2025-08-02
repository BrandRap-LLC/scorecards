export interface Company {
  id: number
  company_name: string
  display_name: string
  is_active: boolean
  created_at: string
}

export interface Metric {
  id: number
  field_code: string
  display_name: string
  category: 'Revenue' | 'Customer' | 'Marketing' | 'Operations' | 'Reputation'
  format_type: 'dollar' | 'percent' | 'number'
  description?: string
  sort_order: number
  is_active: boolean
}

export interface CeoMetric {
  id: number
  company_id: number
  metric_id: number
  year: number
  month: number
  report_date: string
  value?: number
  trending_value?: number
  previous_month_value?: number
  previous_year_value?: number
  month_over_month_change?: number
  year_over_year_change?: number
  month_over_month_percent?: number
  year_over_year_percent?: number
  goal_value?: number
  trending_vs_goal?: number
  goal_achievement_percent?: number
  workday_completed?: number
  total_workday?: number
  metric_rank?: number
  value_formatted?: string
  trending_formatted?: string
  mom_change_formatted?: string
  yoy_change_formatted?: string
  sync_timestamp: string
  // Joined data
  company?: Company
  metric?: Metric
}

export interface SyncLog {
  id: number
  sync_type: 'full' | 'incremental'
  status: 'started' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  records_processed?: number
  records_inserted?: number
  records_updated?: number
  error_message?: string
}

// View types
export interface LatestMetric {
  company_id: number
  company_name: string
  metric_id: number
  field_code: string
  display_name: string
  category: string
  format_type: string
  latest_month: string
  trending_value?: number
  previous_month_value?: number
  previous_year_value?: number
  month_over_month_change?: number
  year_over_year_change?: number
  month_over_month_percent?: number
  year_over_year_percent?: number
  goal_value?: number
  trending_vs_goal?: number
  goal_achievement_percent?: number
  actual_value?: number
  trending_mom_percent?: number
  trending_yoy_percent?: number
  workday_completed?: number
  total_workday?: number
}

// Company summary view type
export interface CompanySummary {
  company_name: string
  net_sales?: number
  net_sales_mom?: number
  net_sales_yoy?: number
  net_sales_goal?: number
  net_sales_goal_pct?: number
  total_patients?: number
  patients_mom?: number
  rev_per_appt?: number
  utilization?: number
  avg_rating?: number
}