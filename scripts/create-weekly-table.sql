-- Create executive_weekly_reports table in Supabase
-- This mirrors the MSSQL executive_report_new_week table structure

CREATE TABLE IF NOT EXISTS executive_weekly_reports (
  id SERIAL PRIMARY KEY,
  
  -- Identity columns
  clinic TEXT NOT NULL,
  week DATE NOT NULL,
  traffic_source TEXT NOT NULL,
  
  -- Metric columns (same as monthly)
  impressions INTEGER DEFAULT 0,
  visits INTEGER DEFAULT 0,
  spend DOUBLE PRECISION DEFAULT 0,
  estimated_ltv_6m DOUBLE PRECISION DEFAULT 0,
  total_roas DOUBLE PRECISION DEFAULT 0,
  new_roas DOUBLE PRECISION DEFAULT 0,
  leads INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  returning_leads INTEGER DEFAULT 0,
  total_conversion DOUBLE PRECISION DEFAULT 0,
  new_conversion DOUBLE PRECISION DEFAULT 0,
  returning_conversion DOUBLE PRECISION DEFAULT 0,
  cac_total DOUBLE PRECISION DEFAULT 0,
  cac_new DOUBLE PRECISION DEFAULT 0,
  total_estimated_revenue DOUBLE PRECISION DEFAULT 0,
  new_estimated_revenue DOUBLE PRECISION DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  new_appointments INTEGER DEFAULT 0,
  returning_appointments INTEGER DEFAULT 0,
  online_booking INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  new_conversations INTEGER DEFAULT 0,
  returning_conversations INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  import_source TEXT DEFAULT 'mssql_executive_report_new_week',
  
  -- Indexes for performance
  CONSTRAINT unique_weekly_record UNIQUE (clinic, week, traffic_source)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_weekly_clinic ON executive_weekly_reports(clinic);
CREATE INDEX IF NOT EXISTS idx_weekly_week ON executive_weekly_reports(week);
CREATE INDEX IF NOT EXISTS idx_weekly_traffic_source ON executive_weekly_reports(traffic_source);
CREATE INDEX IF NOT EXISTS idx_weekly_clinic_week ON executive_weekly_reports(clinic, week);