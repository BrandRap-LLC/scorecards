-- Fix remaining missing columns

-- Add missing columns to executive_monthly_reports
ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS ltv DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS roas DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_conversations INTEGER,
ADD COLUMN IF NOT EXISTS new_conversations INTEGER,
ADD COLUMN IF NOT EXISTS returning_conversations INTEGER;

-- Add missing columns to executive_weekly_reports  
ALTER TABLE executive_weekly_reports
ADD COLUMN IF NOT EXISTS week_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS impressions_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS visits_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS spend_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS leads_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS conversion_rate_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cac_total_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS roas DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS roas_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_mtd BOOLEAN DEFAULT FALSE;

-- Verify all columns exist
SELECT table_name, COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name IN ('executive_monthly_reports', 'executive_weekly_reports')
GROUP BY table_name
ORDER BY table_name;