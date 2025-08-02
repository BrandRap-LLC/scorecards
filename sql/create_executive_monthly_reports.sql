-- Create table for executive monthly reports
-- This table stores data migrated from MSSQL executive_report_new_month table

CREATE TABLE IF NOT EXISTS executive_monthly_reports (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR(255),
  month DATE,
  traffic_source VARCHAR(255),
  impressions INTEGER,
  visits INTEGER,
  spend DECIMAL(10,2),
  ltv DECIMAL(10,2),
  estimated_ltv_6m DECIMAL(10,2),
  avg_ltv DECIMAL(10,2),
  roas DECIMAL(10,2),
  leads INTEGER,
  conversion_rate DECIMAL(5,2),
  cac_total DECIMAL(10,2),
  cac_new DECIMAL(10,2),
  total_appointments INTEGER,
  new_appointments INTEGER,
  returning_appointments INTEGER,
  online_booking INTEGER,
  total_conversations INTEGER,
  new_conversations INTEGER,
  returning_conversations INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  import_source VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_executive_monthly_clinic ON executive_monthly_reports(clinic);
CREATE INDEX IF NOT EXISTS idx_executive_monthly_month ON executive_monthly_reports(month);
CREATE INDEX IF NOT EXISTS idx_executive_monthly_traffic ON executive_monthly_reports(traffic_source);

-- Add comments for documentation
COMMENT ON TABLE executive_monthly_reports IS 'Monthly executive report data migrated from MSSQL';
COMMENT ON COLUMN executive_monthly_reports.clinic IS 'Clinic or organization identifier';
COMMENT ON COLUMN executive_monthly_reports.month IS 'Report month';
COMMENT ON COLUMN executive_monthly_reports.traffic_source IS 'Traffic source (e.g., google ads, facebook)';
COMMENT ON COLUMN executive_monthly_reports.conversion_rate IS 'Conversion percentage from leads to appointments';
COMMENT ON COLUMN executive_monthly_reports.import_source IS 'Source system for the imported data';