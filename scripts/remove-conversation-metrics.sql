-- Remove conversation and avg appointment revenue metrics from all tables

-- 1. executive_monthly_reports table
ALTER TABLE executive_monthly_reports
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;

-- 2. executive_weekly_reports table
ALTER TABLE executive_weekly_reports
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;

-- 3. paid_ads table
ALTER TABLE paid_ads
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;

-- 4. seo_channels table
ALTER TABLE seo_channels
DROP COLUMN IF EXISTS total_conversations,
DROP COLUMN IF EXISTS new_conversations,
DROP COLUMN IF EXISTS returning_conversations,
DROP COLUMN IF EXISTS avg_appointment_rev,
DROP COLUMN IF EXISTS conversation_rate;

-- Note: These columns may not exist in all tables, so we use IF EXISTS
-- to avoid errors if a column doesn't exist in a particular table