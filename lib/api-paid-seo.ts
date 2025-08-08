import { supabase } from './supabase';

export interface PaidAdsRecord {
  clinic: string;
  month: string;
  traffic_source: string;
  campaign: string | null;
  impressions: number | null;
  visits: number | null;
  spend: number | null;
  total_appointments: number | null;
  new_appointments: number | null;
  returning_appointments: number | null;
  avg_appointment_rev: number | null;
  appointment_est_revenue: number | null;
  new_appointment_est_6m_revenue: number | null;
  total_conversations: number | null;
  new_conversations: number | null;
  returning_conversations: number | null;
  conversation_rate: number | null;
  appointment_rate: number | null;
  ctr: number | null;
}

export interface SeoChannelsRecord {
  clinic: string;
  month: string;
  traffic_source: string;
  impressions: number | null;
  visits: number | null;
  total_appointments: number | null;
  new_appointments: number | null;
  returning_appointments: number | null;
  avg_appointment_rev: number | null;
  appointment_est_revenue: number | null;
  new_appointment_est_6m_revenue: number | null;
  total_conversations: number | null;
  new_conversations: number | null;
  returning_conversations: number | null;
  conversation_rate: number | null;
  appointment_rate: number | null;
  ctr: number | null;
}

export async function fetchPaidAdsData(
  clinic?: string,
  startDate?: string,
  endDate?: string
): Promise<PaidAdsRecord[]> {
  let query = supabase
    .from('paid_ads')
    .select('*')
    .order('month', { ascending: false })
    .order('clinic')
    .order('traffic_source')
    .order('campaign');

  if (clinic) {
    query = query.eq('clinic', clinic);
  }

  if (startDate) {
    query = query.gte('month', startDate);
  }

  if (endDate) {
    query = query.lte('month', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching paid ads data:', error);
    throw error;
  }

  return data || [];
}

export async function fetchSeoChannelsData(
  clinic?: string,
  startDate?: string,
  endDate?: string
): Promise<SeoChannelsRecord[]> {
  let query = supabase
    .from('seo_channels')
    .select('*')
    .order('month', { ascending: false })
    .order('clinic')
    .order('traffic_source');

  if (clinic) {
    query = query.eq('clinic', clinic);
  }

  if (startDate) {
    query = query.gte('month', startDate);
  }

  if (endDate) {
    query = query.lte('month', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching SEO channels data:', error);
    throw error;
  }

  return data || [];
}

export async function fetchUniqueClinics(): Promise<string[]> {
  // Get unique clinics from both tables
  const { data: paidClinics } = await supabase
    .from('paid_ads')
    .select('clinic')
    .order('clinic');

  const { data: seoClinics } = await supabase
    .from('seo_channels')
    .select('clinic')
    .order('clinic');

  const allClinics = new Set<string>();
  
  paidClinics?.forEach(record => allClinics.add(record.clinic));
  seoClinics?.forEach(record => allClinics.add(record.clinic));

  return Array.from(allClinics).sort();
}

export async function fetchDateRange() {
  // Get date range from both tables
  const { data: paidDates } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);

  const { data: paidDatesMax } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);

  const { data: seoDates } = await supabase
    .from('seo_channels')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);

  const { data: seoDatesMax } = await supabase
    .from('seo_channels')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);

  const minDate = new Date(Math.min(
    paidDates?.[0]?.month ? new Date(paidDates[0].month).getTime() : Infinity,
    seoDates?.[0]?.month ? new Date(seoDates[0].month).getTime() : Infinity
  ));

  const maxDate = new Date(Math.max(
    paidDatesMax?.[0]?.month ? new Date(paidDatesMax[0].month).getTime() : 0,
    seoDatesMax?.[0]?.month ? new Date(seoDatesMax[0].month).getTime() : 0
  ));

  return { minDate, maxDate };
}