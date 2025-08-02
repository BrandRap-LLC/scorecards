# Executive Monthly Reports Documentation

## Overview
The `executive_monthly_reports` table contains monthly performance metrics for various clinics, segmented by traffic source. This data was migrated from the MSSQL `executive_report_new_month` table and provides comprehensive marketing and operational insights.

## Table Structure

### Table Name: `executive_monthly_reports`

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `clinic` | VARCHAR(255) | Clinic or organization identifier |
| `month` | DATE | Report month (e.g., 2024-12-01) |
| `traffic_source` | VARCHAR(255) | Marketing channel (google ads, local seo, others) |
| `impressions` | INTEGER | Number of ad impressions |
| `visits` | INTEGER | Website visits from source |
| `spend` | DECIMAL(10,2) | Marketing spend in USD |
| `ltv` | DECIMAL(10,2) | Customer lifetime value |
| `estimated_ltv_6m` | DECIMAL(10,2) | Estimated 6-month LTV |
| `avg_ltv` | DECIMAL(10,2) | Average LTV |
| `roas` | DECIMAL(10,2) | Return on ad spend |
| `leads` | INTEGER | Number of leads generated |
| `conversion_rate` | DECIMAL(5,2) | Lead to appointment conversion % |
| `cac_total` | DECIMAL(10,2) | Total customer acquisition cost |
| `cac_new` | DECIMAL(10,2) | New customer acquisition cost |
| `total_appointments` | INTEGER | Total appointments booked |
| `new_appointments` | INTEGER | Appointments from new patients |
| `returning_appointments` | INTEGER | Appointments from returning patients |
| `online_booking` | INTEGER | Appointments booked online |
| `total_conversations` | INTEGER | Total customer conversations |
| `new_conversations` | INTEGER | Conversations with new patients |
| `returning_conversations` | INTEGER | Conversations with returning patients |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `import_source` | VARCHAR(255) | Source system identifier |

## Current Data

### Data Summary
- **Total Records**: 572
- **Date Range**: December 2024
- **Number of Clinics**: Multiple (e.g., advancedlifeclinic.com)
- **Traffic Sources**: google ads, local seo, others
- **Import Source**: mssql_executive_report_new_month

### Sample Queries

#### Get summary by clinic
```sql
SELECT 
  clinic,
  COUNT(DISTINCT traffic_source) as traffic_sources,
  SUM(spend) as total_spend,
  SUM(leads) as total_leads,
  SUM(total_appointments) as total_appointments,
  AVG(conversion_rate) as avg_conversion_rate
FROM executive_monthly_reports
GROUP BY clinic
ORDER BY total_spend DESC;
```

#### Get performance by traffic source
```sql
SELECT 
  traffic_source,
  COUNT(DISTINCT clinic) as clinics,
  SUM(impressions) as total_impressions,
  SUM(visits) as total_visits,
  SUM(spend) as total_spend,
  SUM(leads) as total_leads,
  CASE 
    WHEN SUM(spend) > 0 THEN SUM(leads) / SUM(spend) 
    ELSE 0 
  END as cost_per_lead
FROM executive_monthly_reports
GROUP BY traffic_source
ORDER BY total_spend DESC;
```

#### Get ROAS analysis
```sql
SELECT 
  clinic,
  traffic_source,
  spend,
  ltv,
  roas,
  leads,
  total_appointments,
  conversion_rate
FROM executive_monthly_reports
WHERE spend > 0
ORDER BY roas DESC;
```

#### Get appointment funnel
```sql
SELECT 
  clinic,
  SUM(leads) as total_leads,
  SUM(total_appointments) as total_appointments,
  SUM(new_appointments) as new_appointments,
  SUM(returning_appointments) as returning_appointments,
  SUM(online_booking) as online_bookings,
  AVG(conversion_rate) as avg_conversion_rate
FROM executive_monthly_reports
GROUP BY clinic
ORDER BY total_leads DESC;
```

## Data Migration

### Migration Process
1. **Source**: MSSQL Server (54.245.209.65)
   - Database: aggregated_reporting
   - Table: executive_report_new_month
   
2. **Migration Script**: `scripts/migrate-direct-insert.js`
   - Handles data transformation
   - Maps %conversion to conversion_rate
   - Preserves all numeric metrics
   
3. **Connection Requirements**:
   ```javascript
   {
     server: '54.245.209.65',
     port: 1433,
     database: 'aggregated_reporting',
     user: 'supabase',
     password: 'R#8kZ2w$tE1Q',
     options: {
       encrypt: false,  // Important: Must be false
       trustServerCertificate: true
     }
   }
   ```

### Re-run Migration
To refresh the data from MSSQL:
```bash
# Test connection first
node scripts/test-mssql-simple.js

# Run migration
node scripts/migrate-direct-insert.js
```

## Data Quality Notes

### Known Issues
- Some clinics show 0 values for certain metrics (LTV, ROAS)
- Conversion rate field was originally "%conversion" in MSSQL
- Traffic sources are not standardized (lowercase variations)

### Data Validation
```sql
-- Check for data quality issues
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT clinic) as unique_clinics,
  COUNT(DISTINCT traffic_source) as unique_sources,
  SUM(CASE WHEN spend > 0 AND leads = 0 THEN 1 ELSE 0 END) as spend_no_leads,
  SUM(CASE WHEN leads > 0 AND total_appointments = 0 THEN 1 ELSE 0 END) as leads_no_appointments,
  SUM(CASE WHEN ltv = 0 THEN 1 ELSE 0 END) as zero_ltv_count
FROM executive_monthly_reports;
```

## Using the Data

### In Application Code

```typescript
// Example: Fetch monthly data for a clinic
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getClinicMonthlyData(clinicName: string) {
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', clinicName)
    .order('traffic_source');
  
  if (error) throw error;
  return data;
}

// Get aggregated metrics
async function getMonthlyMetrics() {
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select(`
      clinic,
      month,
      sum(spend) as total_spend,
      sum(leads) as total_leads,
      sum(total_appointments) as total_appointments
    `)
    .group('clinic, month');
  
  return data;
}
```

### Creating Views
Consider creating database views for common queries:

```sql
-- Create a summary view
CREATE VIEW executive_monthly_summary AS
SELECT 
  clinic,
  month,
  SUM(spend) as total_spend,
  SUM(impressions) as total_impressions,
  SUM(visits) as total_visits,
  SUM(leads) as total_leads,
  SUM(total_appointments) as total_appointments,
  AVG(conversion_rate) as avg_conversion_rate,
  SUM(CASE WHEN traffic_source = 'google ads' THEN spend ELSE 0 END) as google_spend,
  SUM(CASE WHEN traffic_source = 'local seo' THEN leads ELSE 0 END) as organic_leads
FROM executive_monthly_reports
GROUP BY clinic, month;
```

## Future Enhancements

### Recommended Improvements
1. **Automated Sync**: Set up scheduled sync from MSSQL
2. **Data Normalization**: Standardize traffic_source values
3. **Historical Data**: Import previous months' data
4. **Calculated Metrics**: Add derived metrics as database views
5. **API Endpoints**: Create REST endpoints for common queries
6. **Dashboard**: Build visualization dashboard for monthly trends
7. **Alerts**: Set up monitoring for anomalies in key metrics

### Potential Integrations
- Connect to BI tools (Tableau, PowerBI, Looker)
- Export to data warehouse (Snowflake, BigQuery)
- Feed into marketing automation platforms
- Integrate with CRM systems