import { supabase } from './supabase'
import { LatestMetric, Company, CeoMetric, CompanySummary } from '@/types/database'

export async function getLatestMetrics(companyIds?: number[]) {
  let query = supabase
    .from('latest_metrics')
    .select('*')
    .order('company_name', { ascending: true })
    .order('display_name', { ascending: true })

  if (companyIds && companyIds.length > 0) {
    query = query.in('company_id', companyIds)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching latest metrics:', error)
    return []
  }

  return data as LatestMetric[]
}

export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('is_active', true)
    .order('company_name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return data as Company[]
}

export async function getMetricsByFieldCodes(fieldCodes: string[]) {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .in('field_code', fieldCodes)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching metrics:', error)
    return []
  }

  return data
}

export async function getCompanyTimeSeries(companyId: number, metricFieldCode: string, months: number = 6) {
  // First get the metric ID
  const { data: metricData, error: metricError } = await supabase
    .from('metrics')
    .select('id')
    .eq('field_code', metricFieldCode)
    .eq('is_active', true)
    .maybeSingle()

  if (metricError || !metricData) {
    console.error('Error fetching metric:', metricError)
    return []
  }

  // Then get the time series data
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1
  const currentDay = currentDate.getDate()
  
  // Fetch more than needed to account for filtering
  const { data, error } = await supabase
    .from('ceo_metrics')
    .select('year, month, trending_value')
    .eq('company_id', companyId)
    .eq('metric_id', metricData.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(months + 2)

  if (error) {
    console.error('Error fetching time series:', error)
    return []
  }

  // Filter out current month if we're in the first 5 days
  let filteredData = data
  if (currentDay <= 5) {
    filteredData = data.filter(d => 
      !(d.year === currentYear && d.month === currentMonth)
    )
  }

  // Take only the requested number of months and return in chronological order
  return filteredData
    .slice(0, months)
    .reverse()
    .map(d => d.trending_value || 0)
}

export async function getTimeSeriesData(
  metricId: number, 
  companyId?: number,
  months: number = 6
) {
  // Get February through July 2025
  let query = supabase
    .from('ceo_metrics')
    .select(`
      *,
      company:companies(company_name),
      metric:metrics(display_name, field_code, format_type)
    `)
    .eq('metric_id', metricId)
    .eq('year', 2025)
    .in('month', [2, 3, 4, 5, 6, 7])
    .order('month', { ascending: true })

  if (companyId) {
    query = query.eq('company_id', companyId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching time series data:', error)
    return []
  }

  return data || []
}

// Get aggregated metrics for all companies
export async function getDashboardMetrics() {
  // Get the 8 primary KPI metrics
  const primaryMetrics = [
    'net_sales',
    'revenue_per_appointment',
    'revenue_per_work_day',
    'pct_sale_discount',
    'retail_net_sale',
    'pct_retail_net_sale',
    'total_patient',
    'new_patient',
    'return_patient',
    'leads',
    'new_leads',
    'cost_per_lead',
    'cost_per_appt',
    'pct_lead_booked',
    'pct_booked_show',
    'pct_consultation_rebooking',
    'pct_injector_utilization',
    'review_avg_rating'
  ]

  const { data, error } = await supabase
    .from('latest_metrics')
    .select('*')
    .in('field_code', primaryMetrics)

  if (error) {
    console.error('Error fetching dashboard metrics:', error)
    return null
  }

  // Aggregate metrics across all companies
  const aggregated: { [key: string]: any } = {}
  
  data.forEach((metric: LatestMetric) => {
    if (!aggregated[metric.field_code]) {
      aggregated[metric.field_code] = {
        field_code: metric.field_code,
        display_name: metric.display_name,
        category: metric.category,
        format_type: metric.format_type,
        total_value: 0,
        total_trending: 0,
        count: 0,
        companies: []
      }
    }
    
    const agg = aggregated[metric.field_code]
    agg.count++
    
    if (metric.trending_value) {
      agg.total_value += metric.trending_value
      agg.total_trending += metric.trending_value
    }
    
    agg.companies.push({
      company_id: metric.company_id,
      company_name: metric.company_name,
      value: metric.trending_value,
      mom_percent: metric.month_over_month_percent,
      yoy_percent: metric.year_over_year_percent,
      goal_percent: metric.goal_achievement_percent
    })
  })

  // Calculate averages
  Object.values(aggregated).forEach((metric: any) => {
    metric.avg_value = metric.total_value / metric.count
    metric.avg_trending = metric.total_trending / metric.count
  })

  return aggregated
}

// Get company summary for homepage cards
export async function getCompanySummary(): Promise<CompanySummary[]> {
  const { data, error } = await supabase
    .from('company_summary')
    .select('*')
    .order('company_name')

  if (error) {
    console.error('Error fetching company summary:', error)
    return []
  }

  return data || []
}

// Get all metrics for a specific company by domain
export async function getCompanyMetrics(companyDomain: string): Promise<LatestMetric[]> {
  const { data, error } = await supabase
    .from('latest_metrics')
    .select('*')
    .eq('company_name', companyDomain)
    .order('category, field_code')

  if (error) {
    console.error('Error fetching company metrics:', error)
    return []
  }

  return data || []
}

// Get 6 months of historical data for all companies
export async function getHistoricalMetrics(months: number = 6) {
  // Get data from Feb 2025 to July 2025
  const { data, error } = await supabase
    .from('ceo_metrics')
    .select(`
      *,
      company:companies(company_name, display_name),
      metric:metrics(field_code, display_name, category, format_type)
    `)
    .eq('year', 2025)
    .in('month', [2, 3, 4, 5, 6, 7])
    .order('company_id', { ascending: true })
    .order('metric_id', { ascending: true })
    .order('month', { ascending: true })

  if (error) {
    console.error('Error fetching historical metrics:', error)
    return []
  }

  return data || []
}