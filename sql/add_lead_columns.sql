-- Add new_leads and returning_leads columns to executive_monthly_reports table
ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_leads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS returning_leads INTEGER DEFAULT 0;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executive_monthly_reports' 
AND column_name IN ('new_leads', 'returning_leads');