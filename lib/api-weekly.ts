import { supabase } from './supabase'
import { WeeklyMetric, ScorecardsMetric, WeeklySummary, WeeklyGridData } from '@/types/scorecards'

// Get latest week's metrics for all companies
export async function getLatestWeekMetrics(companyIds?: number[]) {
  let query = supabase
    .from('latest_scorecards')
    .select('*')
    .order('company_name', { ascending: true })
    .order('sort_order', { ascending: true })

  if (companyIds && companyIds.length > 0) {
    query = query.in('company_id', companyIds)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching latest week metrics:', error)
    return []
  }

  return data as WeeklyMetric[]
}

// Get companies
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

  return data
}

// Get metrics definitions
export async function getMetricsDefinitions() {
  const { data, error } = await supabase
    .from('scorecards_metrics')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching metrics definitions:', error)
    return []
  }

  return data as ScorecardsMetric[]
}

// Get 12-week historical data for grid view
export async function getHistoricalWeeks(weeks: number = 12) {
  const { data, error } = await supabase
    .from('scorecards_12week_history')
    .select('*')
    .order('company_id', { ascending: true })
    .order('metric_id', { ascending: true })
    .order('year', { ascending: false })
    .order('week_number', { ascending: false })

  if (error) {
    console.error('Error fetching historical weeks:', error)
    return []
  }

  return data as WeeklyMetric[]
}

// Get weekly data for specific company
export async function getCompanyWeeklyMetrics(companyId: number, weeks: number = 12) {
  // Get the latest week first
  const { data: latestWeek } = await supabase
    .from('scorecards_weekly')
    .select('year, week_number')
    .order('year', { ascending: false })
    .order('week_number', { ascending: false })
    .limit(1)
    .single()

  if (!latestWeek) return []

  // Calculate the date range for the last N weeks
  const weeksData: { year: number; week: number }[] = []
  let currentYear = latestWeek.year
  let currentWeek = latestWeek.week_number

  for (let i = 0; i < weeks; i++) {
    weeksData.push({ year: currentYear, week: currentWeek })
    currentWeek--
    if (currentWeek < 1) {
      currentWeek = 52
      currentYear--
    }
  }

  // Fetch data for those weeks
  const { data, error } = await supabase
    .from('scorecards_weekly')
    .select(`
      *,
      company:companies(company_name, display_name),
      metric:scorecards_metrics(metric_code, display_name, category, format_type)
    `)
    .eq('company_id', companyId)
    .in('year', weeksData.map(w => w.year))
    .order('year', { ascending: false })
    .order('week_number', { ascending: false })

  if (error) {
    console.error('Error fetching company weekly metrics:', error)
    return []
  }

  // Filter to only include the weeks we want
  const filteredData = data?.filter(item => {
    return weeksData.some(w => w.year === item.year && w.week === item.week_number)
  })

  return filteredData || []
}

// Get week-over-week comparison data
export async function getWeekOverWeekComparison(metricId: number, weeks: number = 2) {
  const { data, error } = await supabase
    .from('scorecards_weekly')
    .select(`
      *,
      company:companies(company_name, display_name),
      metric:scorecards_metrics(metric_code, display_name, category, format_type)
    `)
    .eq('metric_id', metricId)
    .order('year', { ascending: false })
    .order('week_number', { ascending: false })
    .limit(weeks * 11) // 11 companies * N weeks

  if (error) {
    console.error('Error fetching WoW comparison:', error)
    return []
  }

  return data || []
}

// Get current week summary
export async function getCurrentWeekSummary(): Promise<WeeklySummary[]> {
  const { data, error } = await supabase
    .from('latest_scorecards')
    .select('company_id, company_name, company_display_name, year, week_number, week_start_date, week_end_date, is_mtd, is_complete')
    .limit(1)

  if (error || !data || data.length === 0) {
    console.error('Error fetching current week summary:', error)
    return []
  }

  // Get unique companies from the result
  const companies = new Map<number, WeeklySummary>()
  
  data.forEach((item: any) => {
    if (!companies.has(item.company_id)) {
      companies.set(item.company_id, {
        company_id: item.company_id,
        company_name: item.company_name,
        company_display_name: item.company_display_name,
        week_number: item.week_number,
        week_start: item.week_start_date,
        week_end: item.week_end_date,
        year: item.year,
        is_mtd: item.is_mtd || false,
        is_complete: item.is_complete !== false,
        metrics_count: 0,
        last_updated: new Date().toISOString()
      })
    }
    
    const company = companies.get(item.company_id)!
    company.metrics_count++
  })

  return Array.from(companies.values())
}

// Format week display (e.g., "Week 32 (Aug 5-11)")
export function formatWeekDisplay(weekNumber: number, startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const endDay = end.getDate()
  
  if (startMonth === endMonth) {
    return `Week ${weekNumber} (${startMonth} ${startDay}-${endDay})`
  } else {
    return `Week ${weekNumber} (${startMonth} ${startDay}-${endMonth} ${endDay})`
  }
}

// Get metrics by category
export async function getMetricsByCategory(category: string) {
  const { data, error } = await supabase
    .from('scorecards_metrics')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching metrics by category:', error)
    return []
  }

  return data as ScorecardsMetric[]
}

// Export data to CSV
export function exportWeeklyDataToCSV(data: WeeklyMetric[], weeks: number = 12) {
  const headers = ['Company', 'Metric', 'Category']
  
  // Add week headers
  for (let i = 0; i < weeks; i++) {
    headers.push(`Week -${i}`)
  }
  
  const rows: string[][] = []
  
  // Group data by company and metric
  const grouped = data.reduce((acc, item) => {
    const key = `${item.company_id}-${item.metric_id}`
    if (!acc[key]) {
      acc[key] = {
        company: item.company_display_name,
        metric: item.metric_name,
        category: item.category,
        weeks: new Array(weeks).fill('N/A')
      }
    }
    
    // Calculate week index (0 = most recent)
    // This would need proper week calculation logic
    const weekIndex = 0 // Placeholder - needs proper calculation
    
    if (weekIndex < weeks) {
      acc[key].weeks[weekIndex] = item.value?.toString() || 'N/A'
    }
    
    return acc
  }, {} as Record<string, any>)
  
  // Convert to rows
  Object.values(grouped).forEach((item: any) => {
    rows.push([item.company, item.metric, item.category, ...item.weeks])
  })
  
  // Create CSV
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `weekly_scorecards_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}