-- Add missing columns to executive_monthly_reports table
-- Run this in Supabase SQL editor before running the resync script

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_leads INTEGER;

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS returning_leads INTEGER;

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS returning_conversion DOUBLE PRECISION;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executive_monthly_reports' 
ORDER BY ordinal_position;
