-- Update executive_monthly_reports table with new columns from MSSQL schema changes
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new

-- Step 1: Add new columns to match updated MSSQL schema
ALTER TABLE executive_monthly_reports
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);

-- Step 2: Copy existing roas data to total_roas (since roas was renamed to total_roas)
UPDATE executive_monthly_reports 
SET total_roas = roas 
WHERE total_roas IS NULL AND roas IS NOT NULL;

-- Step 3: Copy existing conversion_rate to total_conversion (since %conversion was renamed)
UPDATE executive_monthly_reports 
SET total_conversion = conversion_rate 
WHERE total_conversion IS NULL AND conversion_rate IS NOT NULL;

-- Step 4: Add comments for documentation
COMMENT ON COLUMN executive_monthly_reports.total_roas IS 'Total ROAS (formerly just roas) - includes new and returning customers';
COMMENT ON COLUMN executive_monthly_reports.new_roas IS 'ROAS for new customers only';
COMMENT ON COLUMN executive_monthly_reports.total_conversion IS 'Total conversion rate (formerly conversion_rate)';
COMMENT ON COLUMN executive_monthly_reports.new_conversion IS 'Conversion rate for new customers only';
COMMENT ON COLUMN executive_monthly_reports.total_estimated_revenue IS 'Total estimated revenue from all customers';
COMMENT ON COLUMN executive_monthly_reports.new_estimated_revenue IS 'Estimated revenue from new customers only';
COMMENT ON COLUMN executive_monthly_reports.avg_appointment_rev IS 'Average revenue per appointment';
COMMENT ON COLUMN executive_monthly_reports.avg_estimated_ltv_6m IS 'Average estimated 6-month lifetime value';

-- Step 5: Verify the schema update
SELECT 
    column_name,
    data_type,
    character_maximum_length,
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

-- Step 6: Check if we need to keep old columns for backward compatibility
-- If application code still references 'roas' and 'conversion_rate', keep them
-- Otherwise, you can drop them later:
-- ALTER TABLE executive_monthly_reports DROP COLUMN roas;
-- ALTER TABLE executive_monthly_reports DROP COLUMN conversion_rate;