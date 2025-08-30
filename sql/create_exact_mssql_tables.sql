-- Drop existing tables if they exist
DROP TABLE IF EXISTS paid_ads CASCADE;
DROP TABLE IF EXISTS google_ads_optimazation_report_ad CASCADE;

-- Create paid_ads table with EXACT MSSQL schema
CREATE TABLE paid_ads (
  clinic TEXT,
  month TIMESTAMP,
  traffic_source TEXT,
  campaign TEXT,
  impressions DOUBLE PRECISION,
  visits DOUBLE PRECISION,
  spend DOUBLE PRECISION,
  estimated_ltv_6m DOUBLE PRECISION,
  total_roas DOUBLE PRECISION,
  new_roas DOUBLE PRECISION,
  leads DOUBLE PRECISION,
  new_leads DOUBLE PRECISION,
  returning_leads DOUBLE PRECISION,
  total_conversion DOUBLE PRECISION,  -- This is %total_conversion in MSSQL
  new_conversion DOUBLE PRECISION,    -- This is %new_conversion in MSSQL
  returning_conversion DOUBLE PRECISION, -- This is %returning_conversion in MSSQL
  cac_total DOUBLE PRECISION,
  cac_new DOUBLE PRECISION,
  total_estimated_revenue DOUBLE PRECISION,
  new_estimated_revenue DOUBLE PRECISION,
  total_appointments DOUBLE PRECISION,
  new_appointments DOUBLE PRECISION,
  returning_appointments DOUBLE PRECISION,
  total_conversations DOUBLE PRECISION,
  new_conversations DOUBLE PRECISION,
  returning_conversations DOUBLE PRECISION
);

-- Create google_ads_optimazation_report_ad table with EXACT MSSQL schema
CREATE TABLE google_ads_optimazation_report_ad (
  clinic TEXT,
  month TIMESTAMP,
  campaign TEXT,
  campaign_id TEXT,
  "adGroup" TEXT,  -- Quoted because it's camelCase
  ad TEXT,
  impressions DOUBLE PRECISION,
  visits DOUBLE PRECISION,
  spend DOUBLE PRECISION,
  google_conversions DOUBLE PRECISION,
  total_appointments DOUBLE PRECISION,
  new_appointments DOUBLE PRECISION,
  returning_appointments DOUBLE PRECISION,
  avg_appointment_rev DOUBLE PRECISION,
  appointment_est_revenue DOUBLE PRECISION,
  new_appointment_est_6m_revenue DOUBLE PRECISION,
  total_conversations DOUBLE PRECISION,
  new_conversations DOUBLE PRECISION,
  returning_conversations DOUBLE PRECISION,
  ad_type TEXT,
  ad_strength TEXT,
  headline1 TEXT,
  headline2 TEXT,
  headline3 TEXT,
  description1 TEXT,
  description2 TEXT,
  conversation_rate DOUBLE PRECISION,
  appointment_rate DOUBLE PRECISION,
  ctr DOUBLE PRECISION,
  cpc DOUBLE PRECISION,
  cpa DOUBLE PRECISION
);

-- Create indexes for performance
CREATE INDEX idx_paid_ads_clinic_month ON paid_ads(clinic, month);
CREATE INDEX idx_paid_ads_campaign ON paid_ads(campaign);

CREATE INDEX idx_google_ads_clinic_month ON google_ads_optimazation_report_ad(clinic, month);
CREATE INDEX idx_google_ads_campaign ON google_ads_optimazation_report_ad(campaign);
CREATE INDEX idx_google_ads_ad ON google_ads_optimazation_report_ad(ad);

-- Add comments
COMMENT ON TABLE paid_ads IS 'Exact copy of MSSQL aggregated_reporting.paid_ads table';
COMMENT ON TABLE google_ads_optimazation_report_ad IS 'Exact copy of MSSQL aggregated_reporting.google_ads_optimazation_report_ad table';
COMMENT ON COLUMN paid_ads.total_conversion IS 'Maps to %total_conversion in MSSQL';
COMMENT ON COLUMN paid_ads.new_conversion IS 'Maps to %new_conversion in MSSQL'; 
COMMENT ON COLUMN paid_ads.returning_conversion IS 'Maps to %returning_conversion in MSSQL';