# Executive Monthly Report Migration Summary

## Overview
Successfully migrated 572 records from MSSQL `executive_report_new_month` table to Supabase `executive_monthly_reports` table.

## Final Architecture

### Active Table
- **Table Name**: `executive_monthly_reports`
- **Records**: 572
- **Purpose**: Stores monthly executive report data migrated from MSSQL

### Table Structure
```sql
executive_monthly_reports
├── id (SERIAL PRIMARY KEY)
├── clinic (VARCHAR)
├── month (DATE)
├── traffic_source (VARCHAR)
├── impressions (INTEGER)
├── visits (INTEGER)
├── spend (DECIMAL)
├── ltv (DECIMAL)
├── estimated_ltv_6m (DECIMAL)
├── avg_ltv (DECIMAL)
├── roas (DECIMAL)
├── leads (INTEGER)
├── conversion_rate (DECIMAL)
├── cac_total (DECIMAL)
├── cac_new (DECIMAL)
├── total_appointments (INTEGER)
├── new_appointments (INTEGER)
├── returning_appointments (INTEGER)
├── online_booking (INTEGER)
├── total_conversations (INTEGER)
├── new_conversations (INTEGER)
├── returning_conversations (INTEGER)
├── created_at (TIMESTAMP)
└── import_source (VARCHAR)
```

## Migration Scripts

### Working Scripts
1. **`scripts/migrate-direct-insert.js`** - Main migration script (ACTIVE)
2. **`scripts/test-mssql-simple.js`** - Connection testing utility

### Deprecated Scripts (can be deleted)
- `scripts/migrate-executive-monthly.js` - Initial attempt with wrong schema
- `scripts/migrate-executive-monthly-fixed.js` - Second attempt with metric-based approach
- `scripts/migrate-executive-simple.js` - Third attempt with different schema

## Cleanup

### Tables to Remove
Run `sql/cleanup_unused_tables.sql` in Supabase to remove:
- `executive_monthly_metrics` (50 unused records)
- `executive_monthly_data` (empty)
- `ceo_report` (empty)

### To Clean Up
1. Go to Supabase SQL editor
2. Run the cleanup script: `sql/cleanup_unused_tables.sql`
3. Delete deprecated migration scripts if desired

## Connection Details

### MSSQL Configuration (Working)
```javascript
{
  server: '54.245.209.65',
  port: 1433,
  database: 'aggregated_reporting',
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,  // Important: Must be false
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
}
```

## Data Summary
- **Total Records**: 572
- **Date Range**: December 2024
- **Clinics**: Multiple (e.g., advancedlifeclinic.com)
- **Traffic Sources**: google ads, local seo, others
- **Metrics**: Full range of marketing and operations metrics

## Next Steps
1. ✅ Migration complete
2. ⏳ Clean up unused tables (optional)
3. ⏳ Build dashboard/UI to visualize the data
4. ⏳ Set up automated sync if needed