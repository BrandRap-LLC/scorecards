/**
 * Centralized metric formatting utility
 * Formats metric values for display without any calculations or manipulations
 */

// Currency metrics - format with $ and commas, no decimals
const CURRENCY_METRICS = [
  'spend',
  'estimated_ltv_6m',
  'ltv',
  'avg_ltv',
  'cac_total',
  'cac_new',
  'total_estimated_revenue',
  'new_estimated_revenue'
]

// Percentage metrics - stored as decimals, multiply by 100 and show 1 decimal
const PERCENTAGE_METRICS = [
  'total_conversion',
  'new_conversion',
  'returning_conversion',
  'conversion_rate',
  '%new_conversion',
  '%returning_conversion'
]

// ROAS metrics - show 2 decimals, no suffix
const ROAS_METRICS = [
  'total_roas',
  'new_roas',
  'roas'
]

// Week-over-week change metrics - show with +/- prefix and % suffix
const WOW_METRICS = [
  'impressions_wow',
  'visits_wow',
  'spend_wow',
  'leads_wow',
  'conversion_rate_wow',
  'cac_total_wow',
  'appointments_wow',
  'conversations_wow',
  'roas_wow'
]

// Rank metrics - show 1 decimal
const RANK_METRICS = [
  'current_rank',
  'baseline_avg_rank'
]

// Count/Volume metrics - integers with commas
const COUNT_METRICS = [
  'impressions',
  'visits',
  'leads',
  'new_leads',
  'returning_leads',
  'total_appointments',
  'new_appointments',
  'returning_appointments',
  'online_booking',
  'total_conversations',
  'new_conversations',
  'returning_conversations',
  'appointments',
  'conversations'
]

/**
 * Format a metric value based on its type
 * @param metric - The metric name/key
 * @param value - The raw value from database
 * @returns Formatted string for display
 */
export function formatMetricValue(metric: string, value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  
  // Currency formatting
  if (CURRENCY_METRICS.includes(metric)) {
    return '$' + Math.round(value).toLocaleString('en-US')
  }
  
  // Percentage formatting (stored as decimal, e.g., 0.85 = 85%)
  if (PERCENTAGE_METRICS.includes(metric)) {
    return (value * 100).toFixed(1) + '%'
  }
  
  // ROAS formatting (2 decimals, no suffix)
  if (ROAS_METRICS.includes(metric)) {
    return value.toFixed(2)
  }
  
  // Week-over-week change formatting
  if (WOW_METRICS.includes(metric)) {
    const prefix = value >= 0 ? '+' : ''
    return prefix + value.toFixed(1) + '%'
  }
  
  // Rank formatting (1 decimal)
  if (RANK_METRICS.includes(metric)) {
    return value.toFixed(1)
  }
  
  // Count/Volume formatting (integers with commas)
  if (COUNT_METRICS.includes(metric)) {
    return Math.round(value).toLocaleString('en-US')
  }
  
  // Default: return as string
  return value.toString()
}