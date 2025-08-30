// Executive Report Types
export interface ExecutiveMonthlyReport {
  id: number;
  clinic: string;
  month: string;
  traffic_source: string;
  
  // Marketing Metrics
  impressions: number | null;
  visits: number | null;
  spend: number | null;
  
  // Lead Metrics
  leads: number | null;
  new_leads: number | null;
  returning_leads: number | null;
  total_conversion: number | null;
  new_conversion: number | null;
  returning_conversion: number | null;
  
  // Customer Acquisition
  cac_total: number | null;
  cac_new: number | null;
  
  // Appointment Metrics
  total_appointments: number | null;
  new_appointments: number | null;
  returning_appointments: number | null;
  online_appointments: number | null;
  
  // Engagement Metrics
  total_conversations: number | null;
  new_conversations: number | null;
  returning_conversations: number | null;
  
  // Revenue Metrics
  ltv: number | null;
  estimated_ltv_6m: number | null;
  avg_ltv: number | null;
  total_roas: number | null;
  new_roas: number | null;
  total_estimated_revenue: number | null;
  new_estimated_revenue: number | null;
  
  sync_timestamp: string;
}

export interface ExecutiveWeeklyReport {
  id: number;
  clinic: string;
  week: string;
  year: number;
  week_number: number;
  traffic_source: string;
  week_start_date: string;
  week_end_date: string;
  
  // Same metrics as monthly but for weekly periods
  impressions: number | null;
  visits: number | null;
  spend: number | null;
  leads: number | null;
  new_leads: number | null;
  returning_leads: number | null;
  total_conversion: number | null;
  new_conversion: number | null;
  returning_conversion: number | null;
  cac_total: number | null;
  cac_new: number | null;
  total_appointments: number | null;
  new_appointments: number | null;
  returning_appointments: number | null;
  online_appointments: number | null;
  total_conversations: number | null;
  new_conversations: number | null;
  returning_conversations: number | null;
  ltv: number | null;
  estimated_ltv_6m: number | null;
  avg_ltv: number | null;
  total_roas: number | null;
  new_roas: number | null;
  total_estimated_revenue: number | null;
  new_estimated_revenue: number | null;
  
  // Week-specific flags
  is_mtd: boolean;
  is_complete: boolean;
  
  sync_timestamp: string;
}

// Aggregated metric for dashboard display
export interface MetricSummary {
  metric_name: string;
  metric_key: keyof ExecutiveMonthlyReport;
  format_type: 'currency' | 'number' | 'percent';
  category: 'Marketing' | 'Leads' | 'Acquisition' | 'Appointments' | 'Engagement' | 'Revenue';
  
  // Aggregated values
  total_value: number;
  avg_value: number;
  median_value: number;
  
  // Trend data
  current_period: number;
  previous_period: number;
  period_change: number;
  period_change_percent: number;
  trend: 'up' | 'down' | 'neutral';
  
  // Company breakdown
  company_values: {
    clinic: string;
    value: number;
    period_change: number;
    period_change_percent: number;
  }[];
}

// Company-specific summary for cards
export interface CompanyMetricCard {
  clinic: string;
  display_name: string;
  
  // Key metrics for quick view
  monthly_revenue: number | null;
  monthly_leads: number | null;
  monthly_appointments: number | null;
  monthly_spend: number | null;
  
  // Calculated ratios
  cost_per_lead: number | null;
  cost_per_appointment: number | null;
  lead_to_appointment_rate: number | null;
  roas: number | null;
  
  // Trends
  revenue_trend: number;
  leads_trend: number;
  appointments_trend: number;
  efficiency_trend: number;
  
  // Latest data period
  latest_month: string;
}

// Time series data point
export interface TimeSeriesPoint {
  period: string; // '2024-08' for monthly, '2024-W32' for weekly
  clinic: string;
  metric_value: number | null;
  traffic_source?: string;
}

// Traffic source performance
export interface TrafficSourceSummary {
  traffic_source: string;
  display_name: string;
  
  // Totals across all companies
  total_impressions: number;
  total_visits: number;
  total_spend: number;
  total_leads: number;
  total_appointments: number;
  total_revenue: number;
  
  // Calculated metrics
  avg_ctr: number; // visits / impressions
  avg_conversion_rate: number; // leads / visits
  avg_cac: number; // spend / leads
  avg_roas: number; // revenue / spend
  
  // Efficiency scores
  cost_per_visit: number;
  cost_per_lead: number;
  cost_per_appointment: number;
  revenue_per_visit: number;
  
  // Company count
  active_companies: number;
  
  // Trends
  month_over_month_change: number;
  efficiency_trend: 'improving' | 'declining' | 'stable';
}