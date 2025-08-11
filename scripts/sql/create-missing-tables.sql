-- SQL commands to create missing tables for Scorecards project
-- Execute these in Supabase SQL Editor if needed

-- 1. Create executive_summary table
CREATE TABLE IF NOT EXISTS executive_summary (
  clinic text,
  month text,
  traffic_source text,
  appointments numeric,
  appointments_new numeric,
  appointments_returning numeric,
  estimated_ltv_6m numeric,
  estimated_revenue numeric,
  conversations numeric,
  conversations_new numeric,
  conversations_returning numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create ceo_weekly_reports table
CREATE TABLE IF NOT EXISTS ceo_weekly_reports (
  week numeric,
  company text,
  clinic text,
  impressions numeric,
  visits numeric,
  leads numeric,
  appointments numeric,
  spend numeric,
  ltv numeric,
  roas numeric,
  conversion_rate numeric,
  cost_per_lead numeric,
  cost_per_appointment numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create ceo_monthly_reports table
CREATE TABLE IF NOT EXISTS ceo_monthly_reports (
  month text,
  company text,
  clinic text,
  impressions numeric,
  visits numeric,
  leads numeric,
  appointments numeric,
  spend numeric,
  ltv numeric,
  roas numeric,
  conversion_rate numeric,
  cost_per_lead numeric,
  cost_per_appointment numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('executive_summary', 'ceo_weekly_reports', 'ceo_monthly_reports')
ORDER BY table_name;