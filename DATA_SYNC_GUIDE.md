# Data Sync Guide - MSSQL to Supabase

This guide explains how to sync data from MSSQL to Supabase for the Scorecards project.

## Overview

The project uses a single sync script that transfers data from MSSQL to Supabase for 5 core tables:

1. **Executive Monthly Reports**: `executive_report_new_month` → `executive_monthly_reports`
2. **Executive Weekly Reports**: `executive_report_new_week` → `executive_weekly_reports`
3. **Paid Ads**: `paid_ads` → `paid_ads`
4. **SEO Channels**: `seo_channels` → `seo_channels`
5. **SEO Highlights**: `seo_hightlights_keyword_page_one` → `seo_highlights_keyword_page_one`

## Prerequisites

1. **Environment Variables** - Ensure these are set in `.env.local`:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # MSSQL Configuration
   MSSQL_SERVER=54.245.209.65
   MSSQL_PORT=1433
   MSSQL_USERNAME=your_username
   MSSQL_PASSWORD=your_password
   ```

2. **Node.js Dependencies** - Install if not already done:
   ```bash
   npm install
   ```

## Daily Sync Process

### Full Sync (All Tables)
To sync all 5 tables from MSSQL to Supabase:

```bash
node scripts/sync-mssql-to-supabase.js
```

### Sync Specific Table
To sync only a specific table:

```bash
# Executive Monthly Reports only
node scripts/sync-mssql-to-supabase.js --table=executiveMonthly

# Executive Weekly Reports only
node scripts/sync-mssql-to-supabase.js --table=executiveWeekly

# Paid Ads only
node scripts/sync-mssql-to-supabase.js --table=paidAds

# SEO Channels only
node scripts/sync-mssql-to-supabase.js --table=seoChannels

# SEO Highlights only
node scripts/sync-mssql-to-supabase.js --table=seoHighlights
```

### Dry Run Mode
To preview what would be synced without actually modifying data:

```bash
# Preview all tables
node scripts/sync-mssql-to-supabase.js --dry-run

# Preview specific table
node scripts/sync-mssql-to-supabase.js --table=executiveMonthly --dry-run
```

## Automated Daily Sync

### Option 1: Using Cron (Linux/Mac)
Add to your crontab to run daily at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line for daily sync at 2 AM
0 2 * * * cd /path/to/scorecards && /usr/bin/node scripts/sync-mssql-to-supabase.js >> logs/sync.log 2>&1
```

### Option 2: Using GitHub Actions
Create `.github/workflows/daily-sync.yml`:

```yaml
name: Daily Data Sync
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:     # Allow manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run sync
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          MSSQL_SERVER: ${{ secrets.MSSQL_SERVER }}
          MSSQL_USERNAME: ${{ secrets.MSSQL_USERNAME }}
          MSSQL_PASSWORD: ${{ secrets.MSSQL_PASSWORD }}
        run: node scripts/sync-mssql-to-supabase.js
```

### Option 3: Using Vercel Cron Jobs
Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "0 2 * * *"
  }]
}
```

Then create `/app/api/sync/route.ts` to trigger the sync.

## Monitoring and Troubleshooting

### Check Sync Status
The sync script provides detailed output including:
- Number of records found in MSSQL
- Progress during sync
- Success/failure status for each table
- Total sync time

### Common Issues

1. **MSSQL Connection Failed**
   - Check MSSQL credentials in `.env.local`
   - Verify network connectivity to MSSQL server
   - Ensure SQL authentication is enabled

2. **Supabase Insert Failed**
   - Check Supabase service role key
   - Verify table schemas match expected structure
   - Check for data type mismatches

3. **Missing Tables**
   - Ensure all tables exist in Supabase
   - Run table creation scripts if needed

### Logs
When running automated syncs, always redirect output to logs:

```bash
# Create logs directory
mkdir -p logs

# Run with logging
node scripts/sync-mssql-to-supabase.js >> logs/sync-$(date +%Y%m%d).log 2>&1
```

## Data Validation

After sync, verify data integrity:

1. **Check Record Counts**
   ```sql
   -- In Supabase SQL Editor
   SELECT 
     'executive_monthly_reports' as table_name, 
     COUNT(*) as record_count 
   FROM executive_monthly_reports
   UNION ALL
   SELECT 'executive_weekly_reports', COUNT(*) FROM executive_weekly_reports
   UNION ALL
   SELECT 'paid_ads', COUNT(*) FROM paid_ads
   UNION ALL
   SELECT 'seo_channels', COUNT(*) FROM seo_channels
   UNION ALL
   SELECT 'seo_highlights_keyword_page_one', COUNT(*) FROM seo_highlights_keyword_page_one;
   ```

2. **Check Latest Data**
   ```sql
   -- Check most recent month
   SELECT MAX(month) as latest_month 
   FROM executive_monthly_reports;
   
   -- Check most recent week
   SELECT MAX(week) as latest_week 
   FROM executive_weekly_reports;
   ```

## Important Notes

1. **Data Replacement**: The sync process completely replaces data in Supabase tables. It does not merge or update existing records.

2. **Sync Order**: Tables are synced in the order listed above. If one fails, subsequent tables will still be attempted.

3. **Performance**: Full sync typically takes 2-5 minutes depending on data volume and network speed.

4. **Security**: Never commit credentials to Git. Always use environment variables.

## Support

For issues or questions:
1. Check the sync logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database connectivity from your environment
4. Review table schemas for compatibility