# Executive Monthly Report Migration Guide

## Overview

This guide documents the migration of monthly executive report data from MSSQL `executive_report_new_month` table to Supabase. The migration creates completely new tables in Supabase without affecting any existing data.

## Migration Architecture

### Source
- **Database**: MSSQL (`aggregated_reporting`)  
- **Table**: `executive_report_new_month`
- **Server**: 54.245.209.65:1433

### Target
- **Database**: Supabase (cpr-report)
- **New Tables Created**:
  - `executive_monthly_metrics` - Metric definitions
  - `executive_monthly_data` - Monthly data values
- **Views Created**:
  - `latest_executive_monthly` - Current month's data
  - `executive_monthly_12month_trend` - 12-month historical trend

## Setup Instructions

### 1. Create Supabase Tables

First, create the necessary tables in Supabase:

```bash
# Go to Supabase SQL Editor
# https://igzswopyyggvelncjmuh.supabase.co/project/igzswopyyggvelncjmuh/sql

# Run the entire contents of:
sql/create_executive_monthly_tables.sql
```

This creates:
- Tables for storing monthly executive data
- Metric definitions with categories and formatting
- Views for easy data access
- Indexes for performance
- Row Level Security policies
- Automatic calculation triggers for MoM and YoY changes

### 2. Run the Migration

Execute the migration script to transfer data from MSSQL to Supabase:

```bash
# Make sure dependencies are installed
npm install

# Run the migration
node scripts/migrate-executive-monthly.js
```

The script will:
1. Connect to MSSQL and fetch data from `executive_report_new_month`
2. Create any new companies found in the data
3. Map MSSQL columns to standardized metrics
4. Calculate month-over-month and year-over-year changes
5. Upload data to Supabase in batches

### 3. Verify the Migration

Check that data was migrated successfully:

```sql
-- Check record counts
SELECT 
  (SELECT COUNT(*) FROM executive_monthly_data) as data_records,
  (SELECT COUNT(DISTINCT company_id) FROM executive_monthly_data) as companies,
  (SELECT COUNT(DISTINCT metric_id) FROM executive_monthly_data) as metrics,
  (SELECT COUNT(DISTINCT CONCAT(year, '-', month)) FROM executive_monthly_data) as months;

-- View latest month's data
SELECT * FROM latest_executive_monthly LIMIT 10;

-- Check 12-month trend
SELECT * FROM executive_monthly_12month_trend 
WHERE company_name = 'your_company_name' 
AND metric_code = 'monthly_revenue'
ORDER BY year DESC, month DESC;
```

## Data Structure

### Metrics Categories

The migration organizes metrics into these categories:

1. **Revenue** - Monthly revenue, gross/net revenue, refunds, discounts
2. **Customers** - Customer counts, retention, churn, lifetime value
3. **Operations** - Appointments, utilization, ticket size
4. **Marketing** - Spend, leads, conversion, ROI
5. **Staff** - Headcount, utilization, productivity
6. **Financial** - Profit margins, EBITDA, cash flow
7. **Quality** - NPS, satisfaction, reviews, complaints

### Automatic Calculations

The system automatically calculates:
- **MoM Change**: Month-over-month absolute and percentage change
- **YoY Change**: Year-over-year comparison
- **Averages**: 3-month, 6-month, and 12-month rolling averages
- **YTD Values**: Year-to-date cumulative values

## Using the Data

### In Your Application

Update your application to use the new monthly data:

```javascript
// lib/api-monthly.js

import { supabase } from './supabase'

// Get latest month's data
export async function getLatestMonthlyData(companyIds) {
  const query = supabase
    .from('latest_executive_monthly')
    .select('*')
    .order('company_name')
    .order('sort_order')
  
  if (companyIds?.length > 0) {
    query.in('company_id', companyIds)
  }
  
  const { data, error } = await query
  return data || []
}

// Get 12-month trend
export async function getMonthlyTrend(companyId, metricCode) {
  const { data, error } = await supabase
    .from('executive_monthly_12month_trend')
    .select('*')
    .eq('company_id', companyId)
    .eq('metric_code', metricCode)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(12)
  
  return data || []
}
```

### Creating Visualizations

The data structure supports various visualizations:

1. **Monthly Dashboards** - Current month KPIs with MoM changes
2. **Trend Charts** - 12-month line charts for any metric
3. **Year-over-Year Comparisons** - Compare current vs previous year
4. **Company Comparisons** - Compare metrics across companies
5. **Category Performance** - Group metrics by category

## Scheduling Updates

### Manual Updates

Run the migration script whenever you need to sync new data:

```bash
node scripts/migrate-executive-monthly.js
```

### Automated Updates (Cron)

Set up a cron job to run monthly:

```bash
# Run on the 1st of each month at 3 AM
0 3 1 * * cd /path/to/scorecards && node scripts/migrate-executive-monthly.js >> logs/monthly-migration.log 2>&1
```

### GitHub Actions

Create `.github/workflows/monthly-sync.yml`:

```yaml
name: Monthly Executive Report Sync
on:
  schedule:
    - cron: '0 3 1 * *'  # 1st of each month at 3 AM UTC
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
      - run: node scripts/migrate-executive-monthly.js
        env:
          MSSQL_SERVER: ${{ secrets.MSSQL_SERVER }}
          MSSQL_DATABASE: ${{ secrets.MSSQL_DATABASE }}
          MSSQL_USERNAME: ${{ secrets.MSSQL_USERNAME }}
          MSSQL_PASSWORD: ${{ secrets.MSSQL_PASSWORD }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify MSSQL server is accessible
   - Check firewall rules for port 1433
   - Ensure credentials are correct

2. **Duplicate Key Errors**
   - The script uses upsert to handle duplicates
   - If issues persist, check unique constraints

3. **Missing Companies**
   - Script auto-creates companies found in data
   - Verify company_name matches between systems

4. **Metric Mapping Issues**
   - Check `metricMapping` object in migration script
   - Ensure MSSQL column names match expected format

### Debug Mode

Add debug logging by setting environment variable:

```bash
DEBUG=true node scripts/migrate-executive-monthly.js
```

### Rollback

If you need to remove migrated data:

```sql
-- Remove all monthly data (careful!)
TRUNCATE TABLE executive_monthly_data CASCADE;

-- Or remove specific month
DELETE FROM executive_monthly_data 
WHERE year = 2024 AND month = 12;
```

## Security Considerations

1. **Service Role Key** - Only use for server-side operations
2. **Row Level Security** - Enabled with public read access
3. **Environment Variables** - Never commit credentials
4. **Audit Trail** - Track imports with `imported_at` timestamp

## Performance Optimization

The migration includes several optimizations:

1. **Batch Processing** - Data uploaded in 500-record batches
2. **Indexes** - Created on commonly queried columns
3. **Views** - Pre-computed for common queries
4. **Triggers** - Automatic calculation of derived values

## Next Steps

After successful migration:

1. **Build UI Components** - Create monthly dashboard views
2. **Add Analytics** - Implement trend analysis features
3. **Set Up Alerts** - Monitor for data anomalies
4. **Create Reports** - Build executive summary reports
5. **API Endpoints** - Expose data through REST APIs

## Support

For issues or questions:
1. Check logs in the console output
2. Verify data in Supabase Table Editor
3. Review MSSQL source data for completeness
4. Check network connectivity to both databases