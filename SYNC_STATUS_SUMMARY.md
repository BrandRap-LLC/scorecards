# Supabase Table Sync Status Summary

## Current Status

### ✅ Successfully Synced
- **seo_reports**: 192 records synced from MSSQL `seo_channels` table

### ❌ Failed to Sync
1. **executive_monthly_reports** 
   - Issue: Missing columns in Supabase table
   - Required columns: `conversion_rate`, `avg_ltv`, `new_leads`, `returning_leads`, `new_conversion`, `returning_conversion`, `total_estimated_revenue`, `new_estimated_revenue`, `total_roas`, `new_roas`
   
2. **executive_weekly_reports**
   - Issue: Missing columns in Supabase table
   - Required columns: All columns need to be verified
   
3. **paid_ads_reports**
   - Issue: MSSQL table structure doesn't match expected schema
   - MSSQL has different columns than what the Supabase table expects

## Required Actions

### 1. Fix executive_monthly_reports table

Run this SQL in Supabase SQL Editor:

```sql
-- Add missing columns to executive_monthly_reports
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
```

### 2. Fix executive_weekly_reports table

Run this SQL in Supabase SQL Editor:

```sql
-- Add missing columns to executive_weekly_reports
ALTER TABLE executive_weekly_reports
ADD COLUMN IF NOT EXISTS appointments INTEGER,
ADD COLUMN IF NOT EXISTS appointments_wow DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS conversations INTEGER,
ADD COLUMN IF NOT EXISTS conversations_wow DECIMAL(10,2);
```

### 3. Fix paid_ads_reports table structure

The MSSQL `paid_ads` table has a different structure. We need to either:
- Option A: Modify the Supabase table to match the source data
- Option B: Create a different mapping in the sync script

### 4. After fixing tables, run sync again

```bash
node scripts/sync-all-tables-complete.js
```

## Data Sources (MSSQL)

- **executive_report_new_month** → executive_monthly_reports
- **executive_report_new_week** → executive_weekly_reports  
- **paid_ads** → paid_ads_reports
- **seo_channels** → seo_reports ✅

All tables are in the `aggregated_reporting` database.