-- Complete schema update for executive_monthly_reports table
-- This handles renamed columns and adds new columns
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new

-- Step 1: Add all new columns
ALTER TABLE executive_monthly_reports
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);

-- Step 2: Copy data from old column names to new ones (for backward compatibility)
-- This preserves existing data while adding new column names
UPDATE executive_monthly_reports 
SET total_roas = roas 
WHERE total_roas IS NULL AND roas IS NOT NULL;

UPDATE executive_monthly_reports 
SET total_conversion = conversion_rate 
WHERE total_conversion IS NULL AND conversion_rate IS NOT NULL;

-- Step 3: Create views for backward compatibility (optional)
-- This allows existing queries using old column names to continue working
CREATE OR REPLACE VIEW executive_monthly_reports_compat AS
SELECT 
    id,
    clinic,
    month,
    traffic_source,
    impressions,
    visits,
    spend,
    ltv,
    estimated_ltv_6m,
    avg_ltv,
    COALESCE(total_roas, roas) as roas,  -- Use new name if available, fall back to old
    total_roas,
    new_roas,
    leads,
    new_leads,
    returning_leads,
    COALESCE(total_conversion, conversion_rate) as conversion_rate,  -- Backward compat
    total_conversion,
    new_conversion,
    cac_total,
    cac_new,
    total_estimated_revenue,
    new_estimated_revenue,
    total_appointments,
    new_appointments,
    returning_appointments,
    online_booking,
    total_conversations,
    new_conversations,
    returning_conversations,
    avg_appointment_rev,
    avg_estimated_ltv_6m,
    created_at,
    import_source
FROM executive_monthly_reports;

-- Step 4: Add comments for documentation
COMMENT ON COLUMN executive_monthly_reports.total_roas IS 'Total ROAS (renamed from roas) - includes new and returning customers';
COMMENT ON COLUMN executive_monthly_reports.new_roas IS 'ROAS for new customers only';
COMMENT ON COLUMN executive_monthly_reports.total_conversion IS 'Total conversion rate (renamed from conversion_rate)';
COMMENT ON COLUMN executive_monthly_reports.new_conversion IS 'Conversion rate for new customers only';
COMMENT ON COLUMN executive_monthly_reports.total_estimated_revenue IS 'Total estimated revenue from all customers';
COMMENT ON COLUMN executive_monthly_reports.new_estimated_revenue IS 'Estimated revenue from new customers only';
COMMENT ON COLUMN executive_monthly_reports.avg_appointment_rev IS 'Average revenue per appointment';
COMMENT ON COLUMN executive_monthly_reports.avg_estimated_ltv_6m IS 'Average estimated 6-month lifetime value';

-- Step 5: Verify the update
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'executive_monthly_reports'
ORDER BY ordinal_position;

-- Step 6: Check data integrity
SELECT 
    COUNT(*) as total_records,
    COUNT(roas) as old_roas_count,
    COUNT(total_roas) as new_roas_count,
    COUNT(conversion_rate) as old_conversion_count,
    COUNT(total_conversion) as new_conversion_count
FROM executive_monthly_reports;

-- Note: Keep both old and new column names for now to ensure backward compatibility
-- Once all application code is updated to use new names, you can drop old columns:
-- ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS roas;
-- ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS conversion_rate;