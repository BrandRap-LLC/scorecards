# Instructions to Update Supabase Tables from MSSQL

## Current Issue

The `executive_monthly_reports` table in Supabase is missing several columns that exist in the MSSQL source data. The application code expects these columns to exist.

## Required Actions

### 1. First, run this SQL in Supabase SQL Editor to add missing columns:

```sql
-- Add missing columns to executive_monthly_reports table
ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS avg_ltv DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS new_leads INTEGER,
ADD COLUMN IF NOT EXISTS returning_leads INTEGER,
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS returning_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,2);

-- Add column for total_conversion if missing
ALTER TABLE executive_monthly_reports
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2);

-- Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executive_monthly_reports'
ORDER BY ordinal_position;
```

### 2. Create executive_weekly_reports table:

```sql
CREATE TABLE IF NOT EXISTS executive_weekly_reports (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR(255),
  week INTEGER,
  week_date TIMESTAMP,
  traffic_source VARCHAR(255),
  impressions INTEGER,
  impressions_wow DECIMAL(10,2),
  visits INTEGER,
  visits_wow DECIMAL(10,2),
  spend DECIMAL(10,2),
  spend_wow DECIMAL(10,2),
  leads INTEGER,
  leads_wow DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  conversion_rate_wow DECIMAL(10,2),
  appointments INTEGER,
  appointments_wow DECIMAL(10,2),
  conversations INTEGER,
  conversations_wow DECIMAL(10,2),
  cac_total DECIMAL(10,2),
  cac_total_wow DECIMAL(10,2),
  roas DECIMAL(10,2),
  roas_wow DECIMAL(10,2),
  is_mtd BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_weekly_clinic ON executive_weekly_reports(clinic);
CREATE INDEX IF NOT EXISTS idx_weekly_week ON executive_weekly_reports(week);
CREATE INDEX IF NOT EXISTS idx_weekly_traffic ON executive_weekly_reports(traffic_source);
```

### 3. Create paid_ads_reports table:

```sql
CREATE TABLE IF NOT EXISTS paid_ads_reports (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR(255),
  month DATE,
  traffic_source VARCHAR(255),
  campaign_type VARCHAR(255),
  impressions INTEGER,
  clicks INTEGER,
  spend DECIMAL(10,2),
  ctr DECIMAL(5,2),
  cpc DECIMAL(10,2),
  impressions_mom DECIMAL(10,2),
  clicks_mom DECIMAL(10,2),
  spend_mom DECIMAL(10,2),
  ctr_mom DECIMAL(10,2),
  cpc_mom DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_paid_ads_clinic ON paid_ads_reports(clinic);
CREATE INDEX IF NOT EXISTS idx_paid_ads_month ON paid_ads_reports(month);
CREATE INDEX IF NOT EXISTS idx_paid_ads_traffic ON paid_ads_reports(traffic_source);
CREATE INDEX IF NOT EXISTS idx_paid_ads_campaign ON paid_ads_reports(campaign_type);
```

### 4. Create seo_reports table:

```sql
CREATE TABLE IF NOT EXISTS seo_reports (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR(255),
  month DATE,
  traffic_source VARCHAR(255),
  sessions INTEGER,
  users INTEGER,
  bounce_rate DECIMAL(5,2),
  pages_per_session DECIMAL(10,2),
  avg_session_duration DECIMAL(10,2),
  sessions_mom DECIMAL(10,2),
  users_mom DECIMAL(10,2),
  bounce_rate_mom DECIMAL(10,2),
  pages_per_session_mom DECIMAL(10,2),
  avg_session_duration_mom DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seo_clinic ON seo_reports(clinic);
CREATE INDEX IF NOT EXISTS idx_seo_month ON seo_reports(month);
CREATE INDEX IF NOT EXISTS idx_seo_traffic ON seo_reports(traffic_source);
```

### 5. After creating/updating tables, run the sync script:

```bash
# Create a new sync script that handles all tables
node scripts/sync-all-tables-complete.js
```

## Notes

- The MSSQL source tables are:
  - `executive_report_new_month` (in aggregated_reporting database)
  - `executive_report_new_week` (in aggregated_reporting database)
  - `paid_ads` (in aggregated_reporting database)
  - `seo_channels` (in aggregated_reporting database)

- The sync script will handle numeric overflow issues by capping extremely large values
- All conversion rate fields in MSSQL have a `%` prefix (e.g., `%total_conversion`)
- The sync will clear existing data before inserting fresh data from MSSQL