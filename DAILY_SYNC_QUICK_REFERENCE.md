# Daily Sync Quick Reference

## 🚀 Quick Commands

### Full Sync (All Tables)
```bash
node scripts/sync-mssql-to-supabase.js
```

### Sync Individual Tables
```bash
# Executive Monthly
node scripts/sync-mssql-to-supabase.js --table=executiveMonthly

# Executive Weekly  
node scripts/sync-mssql-to-supabase.js --table=executiveWeekly

# Paid Ads
node scripts/sync-mssql-to-supabase.js --table=paidAds

# SEO Channels
node scripts/sync-mssql-to-supabase.js --table=seoChannels

# SEO Highlights
node scripts/sync-mssql-to-supabase.js --table=seoHighlights
```

### Test Mode (No Changes)
```bash
# Test all tables
node scripts/sync-mssql-to-supabase.js --dry-run

# Test specific table
node scripts/sync-mssql-to-supabase.js --table=executiveMonthly --dry-run
```

## 📊 Table Mappings

| MSSQL Source | → | Supabase Destination |
|--------------|---|---------------------|
| executive_report_new_month | → | executive_monthly_reports |
| executive_report_new_week | → | executive_weekly_reports |
| paid_ads | → | paid_ads |
| seo_channels | → | seo_channels |
| seo_hightlights_keyword_page_one | → | seo_highlights_keyword_page_one |

## ⚡ One-Line Daily Sync with Logging

```bash
node scripts/sync-mssql-to-supabase.js >> logs/sync-$(date +%Y%m%d).log 2>&1
```

## 🔍 Check Results

```sql
-- Run in Supabase SQL Editor
SELECT 
  'Monthly' as report, COUNT(*) as records, MAX(month) as latest 
FROM executive_monthly_reports
UNION ALL
SELECT 
  'Weekly', COUNT(*), MAX(week)::text 
FROM executive_weekly_reports;
```

## ❌ Troubleshooting

1. **Connection Failed**: Check `.env.local` credentials
2. **Table Not Found**: Ensure tables exist in Supabase
3. **Data Type Error**: Check for schema mismatches

## 📖 Full Documentation

See `DATA_SYNC_GUIDE.md` for detailed instructions.