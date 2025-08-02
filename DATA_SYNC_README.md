# Data Sync Setup Guide

This guide explains how to set up and run the MSSQL to Supabase data synchronization for the Weekly Scorecards Dashboard.

## Prerequisites

- Node.js 18+ installed
- Access to MSSQL database
- Supabase project set up
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

First, install the required npm packages:

```bash
npm install
# or
yarn install
```

This will install:
- `mssql` - For connecting to SQL Server
- `dotenv` - For loading environment variables
- `@supabase/supabase-js` - For Supabase operations

### 2. Configure Environment Variables

The `.env.local` file has been created with the necessary configuration. 

**IMPORTANT**: You need to add your MSSQL server address:

1. Open `.env.local`
2. Find the line: `MSSQL_SERVER=your_mssql_server_address`
3. Replace `your_mssql_server_address` with your actual MSSQL server hostname or IP

Example:
```env
MSSQL_SERVER=sql-prod-001.company.com
# or
MSSQL_SERVER=192.168.1.100
```

### 3. Set Up Supabase Tables

Run the SQL script in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the entire contents of `sql/setup_supabase_tables.sql`
5. Click "Run" to create all tables, views, and policies

This will create:
- `companies` table
- `scorecards_metrics` table  
- `scorecards_weekly` table
- `latest_scorecards` view
- `scorecards_12week_history` view
- Row Level Security policies
- Update triggers

### 4. Run Initial Data Sync

Execute the sync script to import data from MSSQL:

```bash
npm run sync
```

You should see output like:
```
🔄 Starting data sync from MSSQL to Supabase...
📊 Connecting to MSSQL...
✅ Connected to MSSQL
📥 Fetching data from MSSQL table: ceo_report_full_week
✅ Fetched 1000 records from MSSQL
🏢 Processing companies...
✅ Processed 11 companies
📈 Fetching metrics from Supabase...
✅ Found 28 metrics
💾 Processing weekly data...
✅ Processed 3080 weekly records
📤 Uploading to Supabase...
✅ Successfully uploaded 3080 records to Supabase
✨ Data sync completed successfully!
```

### 5. Verify Data in Supabase

1. Go to your Supabase project
2. Navigate to Table Editor
3. Check these tables have data:
   - `companies` - Should have 11 companies
   - `scorecards_metrics` - Should have 28 metrics
   - `scorecards_weekly` - Should have weekly data records

### 6. Test the Application

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see:
- Current week's metrics on the homepage
- 12-week history in the Grid view (/grid)
- Data quality metrics (/data-quality)

## Troubleshooting

### Duplicate Key Error in Supabase

If you get an error like `duplicate key value violates unique constraint "companies_pkey"`:

**Solution 1: Reset Tables (Start Fresh)**
```sql
-- Run sql/reset_tables.sql in Supabase SQL Editor
-- This will clear all data and reset ID sequences
```

**Solution 2: Check Existing Data**
```sql
-- Run sql/check_data.sql to see what's already there
```

**Solution 3: Manual Cleanup**
```sql
-- Just clear the weekly data, keep companies and metrics
TRUNCATE TABLE scorecards_weekly CASCADE;
```

### MSSQL Connection Issues

If you get connection errors:

1. **Check server address**: Ensure MSSQL_SERVER in `.env.local` is correct
2. **Check firewall**: Ensure port 1433 is open
3. **Check credentials**: Verify username/password are correct
4. **Check SSL**: The script uses `trustServerCertificate: true` for self-signed certs

### Supabase Issues

1. **Authentication error**: Check your Supabase keys in `.env.local`
2. **Table not found**: Run the setup SQL script first
3. **Permission denied**: Check Row Level Security policies

### Data Issues

1. **No data showing**: Check if sync completed successfully
2. **Missing metrics**: Verify metric mapping in sync script
3. **Wrong week numbers**: Check date calculations in MSSQL source

## Automating Data Sync

For production, you can automate the sync using:

### Option 1: Cron Job (Linux/Mac)

Add to crontab:
```bash
# Run every day at 3 AM
0 3 * * * cd /path/to/scorecards && npm run sync >> /var/log/scorecard-sync.log 2>&1
```

### Option 2: GitHub Actions

Create `.github/workflows/sync.yml`:
```yaml
name: Sync MSSQL to Supabase
on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync
        env:
          MSSQL_SERVER: ${{ secrets.MSSQL_SERVER }}
          MSSQL_PASSWORD: ${{ secrets.MSSQL_PASSWORD }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Option 3: Vercel Cron Functions

Create `app/api/cron/sync/route.ts` for scheduled sync via Vercel.

## Security Notes

⚠️ **IMPORTANT SECURITY REMINDERS**:

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Service Role Key** - Only use on server-side, never expose to client
3. **Use environment variables** - Always use env vars in production
4. **Rotate credentials** - Regularly update database passwords
5. **Limit access** - Use read-only MSSQL user if possible

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in console
3. Check Supabase logs in the dashboard
4. Verify MSSQL connectivity separately

## Next Steps

After successful setup:
1. Configure production environment variables
2. Set up automated sync schedule
3. Add monitoring/alerting for sync failures
4. Implement incremental sync for better performance
5. Add data validation and quality checks