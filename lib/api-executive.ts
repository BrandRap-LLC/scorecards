import { supabase } from './supabase';
import { ExecutiveMonthlyReport, ExecutiveWeeklyReport, MetricSummary, CompanyMetricCard, TrafficSourceSummary } from '@/types/executive';
import { formatCurrency, formatNumber, formatPercent } from './utils';

// Get executive monthly reports with optional filtering
export async function getExecutiveMonthlyReports(
  filters?: {
    companies?: string[];
    startDate?: string;
    endDate?: string;
    trafficSources?: string[];
  }
): Promise<ExecutiveMonthlyReport[]> {
  let query = supabase
    .from('executive_monthly_reports')
    .select('*')
    .order('month', { ascending: false })
    .order('clinic', { ascending: true })
    .order('traffic_source', { ascending: true });

  if (filters?.companies?.length) {
    query = query.in('clinic', filters.companies);
  }

  if (filters?.startDate) {
    query = query.gte('month', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('month', filters.endDate);
  }

  if (filters?.trafficSources?.length) {
    query = query.in('traffic_source', filters.trafficSources);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching executive monthly reports:', error);
    throw error;
  }

  return data || [];
}

// Get executive weekly reports with optional filtering
export async function getExecutiveWeeklyReports(
  filters?: {
    companies?: string[];
    startDate?: string;
    endDate?: string;
    trafficSources?: string[];
  }
): Promise<ExecutiveWeeklyReport[]> {
  let query = supabase
    .from('executive_weekly_reports')
    .select('*')
    .order('year', { ascending: false })
    .order('week_number', { ascending: false })
    .order('clinic', { ascending: true })
    .order('traffic_source', { ascending: true });

  if (filters?.companies?.length) {
    query = query.in('clinic', filters.companies);
  }

  if (filters?.startDate) {
    query = query.gte('week_start_date', filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte('week_end_date', filters.endDate);
  }

  if (filters?.trafficSources?.length) {
    query = query.in('traffic_source', filters.trafficSources);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching executive weekly reports:', error);
    throw error;
  }

  return data || [];
}

// Get unique companies from executive reports
export async function getExecutiveCompanies(): Promise<string[]> {
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('clinic')
    .order('clinic');

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }

  const uniqueCompanies = [...new Set(data?.map(record => record.clinic) || [])];
  return uniqueCompanies.sort();
}

// Get unique traffic sources from executive reports
export async function getExecutiveTrafficSources(): Promise<string[]> {
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('traffic_source')
    .order('traffic_source');

  if (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }

  const uniqueSources = [...new Set(data?.map(record => record.traffic_source) || [])];
  return uniqueSources.sort();
}

// Get date range from executive reports
export async function getExecutiveDateRange(): Promise<{ min: string; max: string }> {
  const { data: monthlyData } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);

  const { data: monthlyMaxData } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);

  return {
    min: monthlyData?.[0]?.month || '2024-01-01',
    max: monthlyMaxData?.[0]?.month || new Date().toISOString().slice(0, 7) + '-01'
  };
}

// Calculate metric summaries for dashboard
export async function getMetricSummaries(
  period: 'monthly' | 'weekly' = 'monthly',
  filters?: {
    companies?: string[];
    startDate?: string;
    endDate?: string;
    trafficSources?: string[];
  }
): Promise<MetricSummary[]> {
  const data = period === 'monthly' 
    ? await getExecutiveMonthlyReports(filters)
    : await getExecutiveWeeklyReports(filters);

  // Define key metrics to summarize
  const metricsConfig = [
    { key: 'total_estimated_revenue' as keyof ExecutiveMonthlyReport, name: 'Total Revenue', format: 'currency', category: 'Revenue' },
    { key: 'leads' as keyof ExecutiveMonthlyReport, name: 'Total Leads', format: 'number', category: 'Leads' },
    { key: 'total_appointments' as keyof ExecutiveMonthlyReport, name: 'Total Appointments', format: 'number', category: 'Appointments' },
    { key: 'spend' as keyof ExecutiveMonthlyReport, name: 'Total Spend', format: 'currency', category: 'Marketing' },
    { key: 'visits' as keyof ExecutiveMonthlyReport, name: 'Total Visits', format: 'number', category: 'Marketing' },
    { key: 'cac_total' as keyof ExecutiveMonthlyReport, name: 'Customer Acquisition Cost', format: 'currency', category: 'Acquisition' },
    { key: 'total_roas' as keyof ExecutiveMonthlyReport, name: 'Return on Ad Spend', format: 'number', category: 'Revenue' },
    { key: 'total_conversion' as keyof ExecutiveMonthlyReport, name: 'Conversion Rate', format: 'percent', category: 'Leads' },
  ];

  const summaries: MetricSummary[] = [];

  for (const config of metricsConfig) {
    // Aggregate values by summing across all records
    const values = data
      .map(record => {
        const value = record[config.key as keyof typeof record] as number;
        return value;
      })
      .filter(val => val !== null && val !== undefined && !isNaN(val));

    if (values.length === 0) continue;

    const totalValue = values.reduce((sum, val) => sum + val, 0);
    const avgValue = totalValue / values.length;
    const sortedValues = values.sort((a, b) => a - b);
    const medianValue = sortedValues[Math.floor(sortedValues.length / 2)];

    // Calculate period change (compare latest vs previous)
    // This is simplified - in a real implementation, you'd compare specific periods
    const currentPeriod = totalValue;
    const previousPeriod = totalValue * 0.95; // Placeholder - implement proper period comparison
    const periodChange = currentPeriod - previousPeriod;
    const periodChangePercent = previousPeriod !== 0 ? (periodChange / previousPeriod) * 100 : 0;

    // Get company breakdown
    const companyValues = getCompanyBreakdown(data, config.key);

    summaries.push({
      metric_name: config.name,
      metric_key: config.key,
      format_type: config.format as 'currency' | 'number' | 'percent',
      category: config.category as 'Marketing' | 'Leads' | 'Acquisition' | 'Appointments' | 'Engagement' | 'Revenue',
      total_value: totalValue,
      avg_value: avgValue,
      median_value: medianValue,
      current_period: currentPeriod,
      previous_period: previousPeriod,
      period_change: periodChange,
      period_change_percent: periodChangePercent,
      trend: periodChangePercent > 5 ? 'up' : periodChangePercent < -5 ? 'down' : 'neutral',
      company_values: companyValues
    });
  }

  return summaries;
}

// Helper function to get company breakdown
function getCompanyBreakdown(
  data: ExecutiveMonthlyReport[] | ExecutiveWeeklyReport[], 
  metricKey: keyof ExecutiveMonthlyReport
) {
  const companyTotals = new Map<string, number>();
  
  data.forEach(record => {
    const value = record[metricKey as keyof typeof record] as number;
    if (value !== null && value !== undefined && !isNaN(value)) {
      companyTotals.set(record.clinic, (companyTotals.get(record.clinic) || 0) + value);
    }
  });

  return Array.from(companyTotals.entries()).map(([clinic, value]) => ({
    clinic,
    value,
    period_change: 0, // Placeholder - implement proper period comparison
    period_change_percent: 0
  }));
}

// Get company metric cards for overview
export async function getCompanyMetricCards(
  period: 'monthly' | 'weekly' = 'monthly'
): Promise<CompanyMetricCard[]> {
  const data = period === 'monthly' 
    ? await getExecutiveMonthlyReports()
    : await getExecutiveWeeklyReports();

  // Group by company and calculate totals
  const companyData = new Map<string, any>();

  data.forEach(record => {
    if (!companyData.has(record.clinic)) {
      companyData.set(record.clinic, {
        clinic: record.clinic,
        display_name: record.clinic.charAt(0).toUpperCase() + record.clinic.slice(1),
        revenue: 0,
        leads: 0,
        appointments: 0,
        spend: 0,
        latest_month: '',
      });
    }

    const company = companyData.get(record.clinic);
    company.revenue += record.total_estimated_revenue || 0;
    company.leads += record.leads || 0;
    company.appointments += record.total_appointments || 0;
    company.spend += record.spend || 0;
    
    // Track latest month
    const recordPeriod = 'month' in record ? record.month : record.week;
    if (recordPeriod > company.latest_month) {
      company.latest_month = recordPeriod;
    }
  });

  return Array.from(companyData.values()).map(company => ({
    clinic: company.clinic,
    display_name: company.display_name,
    monthly_revenue: company.revenue,
    monthly_leads: company.leads,
    monthly_appointments: company.appointments,
    monthly_spend: company.spend,
    cost_per_lead: company.spend > 0 && company.leads > 0 ? company.spend / company.leads : null,
    cost_per_appointment: company.spend > 0 && company.appointments > 0 ? company.spend / company.appointments : null,
    lead_to_appointment_rate: company.leads > 0 ? company.appointments / company.leads : null,
    roas: company.spend > 0 ? company.revenue / company.spend : null,
    revenue_trend: 0, // Placeholder - implement trend calculation
    leads_trend: 0,
    appointments_trend: 0,
    efficiency_trend: 0,
    latest_month: company.latest_month,
  }));
}

// Get traffic source performance summary
export async function getTrafficSourceSummary(
  period: 'monthly' | 'weekly' = 'monthly'
): Promise<TrafficSourceSummary[]> {
  const data = period === 'monthly' 
    ? await getExecutiveMonthlyReports()
    : await getExecutiveWeeklyReports();

  // Group by traffic source
  const sourceData = new Map<string, any>();
  const companiesBySource = new Map<string, Set<string>>();

  data.forEach(record => {
    const source = record.traffic_source;
    
    if (!sourceData.has(source)) {
      sourceData.set(source, {
        total_impressions: 0,
        total_visits: 0,
        total_spend: 0,
        total_leads: 0,
        total_appointments: 0,
        total_revenue: 0,
      });
      companiesBySource.set(source, new Set());
    }

    const sourceStats = sourceData.get(source);
    sourceStats.total_impressions += record.impressions || 0;
    sourceStats.total_visits += record.visits || 0;
    sourceStats.total_spend += record.spend || 0;
    sourceStats.total_leads += record.leads || 0;
    sourceStats.total_appointments += record.total_appointments || 0;
    sourceStats.total_revenue += record.total_estimated_revenue || 0;
    
    companiesBySource.get(source)!.add(record.clinic);
  });

  return Array.from(sourceData.entries()).map(([traffic_source, stats]) => ({
    traffic_source,
    display_name: traffic_source.charAt(0).toUpperCase() + traffic_source.slice(1),
    total_impressions: stats.total_impressions,
    total_visits: stats.total_visits,
    total_spend: stats.total_spend,
    total_leads: stats.total_leads,
    total_appointments: stats.total_appointments,
    total_revenue: stats.total_revenue,
    avg_ctr: stats.total_impressions > 0 ? stats.total_visits / stats.total_impressions : 0,
    avg_conversion_rate: stats.total_visits > 0 ? stats.total_leads / stats.total_visits : 0,
    avg_cac: stats.total_leads > 0 ? stats.total_spend / stats.total_leads : 0,
    avg_roas: stats.total_spend > 0 ? stats.total_revenue / stats.total_spend : 0,
    cost_per_visit: stats.total_visits > 0 ? stats.total_spend / stats.total_visits : 0,
    cost_per_lead: stats.total_leads > 0 ? stats.total_spend / stats.total_leads : 0,
    cost_per_appointment: stats.total_appointments > 0 ? stats.total_spend / stats.total_appointments : 0,
    revenue_per_visit: stats.total_visits > 0 ? stats.total_revenue / stats.total_visits : 0,
    active_companies: companiesBySource.get(traffic_source)?.size || 0,
    month_over_month_change: 0, // Placeholder - implement MoM calculation
    efficiency_trend: 'stable' as 'improving' | 'declining' | 'stable'
  }));
}