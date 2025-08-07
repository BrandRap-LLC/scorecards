-- Add returning_conversion column to executive_monthly_reports table
-- This column exists in the MSSQL source table and is needed for data sync

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS returning_conversion DOUBLE PRECISION;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executive_monthly_reports' 
AND column_name = 'returning_conversion';