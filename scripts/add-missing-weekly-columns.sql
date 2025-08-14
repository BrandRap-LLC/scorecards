-- Add missing columns to executive_weekly_reports table

-- Check if columns exist before adding them
DO $$ 
BEGIN
    -- Add new_leads if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='new_leads') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN new_leads NUMERIC;
    END IF;

    -- Add returning_leads if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='returning_leads') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN returning_leads NUMERIC;
    END IF;

    -- Add total_conversion if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='total_conversion') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN total_conversion NUMERIC;
    END IF;

    -- Add new_conversion if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='new_conversion') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN new_conversion NUMERIC;
    END IF;

    -- Add returning_conversion if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='returning_conversion') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN returning_conversion NUMERIC;
    END IF;

    -- Add cac_new if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='cac_new') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN cac_new NUMERIC;
    END IF;

    -- Add total_appointments if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='total_appointments') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN total_appointments NUMERIC;
    END IF;

    -- Add new_appointments if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='new_appointments') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN new_appointments NUMERIC;
    END IF;

    -- Add returning_appointments if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='returning_appointments') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN returning_appointments NUMERIC;
    END IF;

    -- Add online_booking if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='online_booking') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN online_booking NUMERIC;
    END IF;

    -- Add total_conversations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='total_conversations') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN total_conversations NUMERIC;
    END IF;

    -- Add new_conversations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='new_conversations') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN new_conversations NUMERIC;
    END IF;

    -- Add returning_conversations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='returning_conversations') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN returning_conversations NUMERIC;
    END IF;

    -- Add total_estimated_revenue if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='total_estimated_revenue') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN total_estimated_revenue NUMERIC;
    END IF;

    -- Add new_estimated_revenue if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='new_estimated_revenue') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN new_estimated_revenue NUMERIC;
    END IF;

    -- Add estimated_ltv_6m if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='estimated_ltv_6m') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN estimated_ltv_6m NUMERIC;
    END IF;

    -- Add total_roas if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='total_roas') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN total_roas NUMERIC;
    END IF;

    -- Add new_roas if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='executive_weekly_reports' AND column_name='new_roas') THEN
        ALTER TABLE executive_weekly_reports ADD COLUMN new_roas NUMERIC;
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executive_weekly_reports' 
ORDER BY ordinal_position;