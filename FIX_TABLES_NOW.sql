-- Fix executive_monthly_reports table
-- Run this in Supabase SQL Editor

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS avg_ltv DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS new_leads INTEGER,
ADD COLUMN IF NOT EXISTS returning_leads INTEGER,
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS returning_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,2);

-- Fix executive_weekly_reports table
ALTER TABLE executive_weekly_reports
ADD COLUMN IF NOT EXISTS appointments INTEGER,
ADD COLUMN IF NOT EXISTS appointments_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS conversations INTEGER,
ADD COLUMN IF NOT EXISTS conversations_wow DECIMAL(10,2);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('executive_monthly_reports', 'executive_weekly_reports')
ORDER BY table_name, ordinal_position;