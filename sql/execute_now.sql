-- EXECUTE THIS SQL IN SUPABASE DASHBOARD
-- Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new
-- Copy and paste this entire script, then click "Run"

-- Step 1: Add all new columns from revised MSSQL schema
ALTER TABLE executive_monthly_reports
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);

-- Step 2: Copy existing data to renamed columns for backward compatibility
UPDATE executive_monthly_reports 
SET total_roas = roas 
WHERE total_roas IS NULL AND roas IS NOT NULL;

UPDATE executive_monthly_reports 
SET total_conversion = conversion_rate 
WHERE total_conversion IS NULL AND conversion_rate IS NOT NULL;

-- Step 3: Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'executive_monthly_reports'
AND column_name IN (
    'total_roas', 'new_roas', 
    'total_conversion', 'new_conversion',
    'total_estimated_revenue', 'new_estimated_revenue',
    'avg_appointment_rev', 'avg_estimated_ltv_6m'
)
ORDER BY ordinal_position;

-- Step 4: Show summary of the update
SELECT 
    COUNT(*) as total_records,
    COUNT(roas) as has_old_roas,
    COUNT(total_roas) as has_new_total_roas,
    COUNT(conversion_rate) as has_old_conversion,
    COUNT(total_conversion) as has_new_total_conversion
FROM executive_monthly_reports;

-- Success! The schema has been updated.
-- Next step: Run 'node scripts/sync-new-columns.js' to populate the new columns with data from MSSQL