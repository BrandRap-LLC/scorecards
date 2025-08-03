# Executive Report Schema Changes

## Overview
The MSSQL `executive_report_new_month` table has been updated with additional columns and renamed some existing ones.

## Schema Comparison

### Original Schema (What we have in Supabase)
| Column | Type | Description |
|--------|------|-------------|
| clinic | VARCHAR | Clinic identifier |
| month | DATE | Report month |
| traffic_source | VARCHAR | Marketing channel |
| impressions | INTEGER | Ad impressions |
| visits | INTEGER | Website visits |
| spend | DECIMAL | Marketing spend |
| ltv | DECIMAL | Lifetime value |
| estimated_ltv_6m | DECIMAL | 6-month LTV estimate |
| avg_ltv | DECIMAL | Average LTV |
| roas | DECIMAL | Return on ad spend |
| leads | INTEGER | Total leads |
| conversion_rate | DECIMAL | Conversion percentage |
| cac_total | DECIMAL | Total CAC |
| cac_new | DECIMAL | New customer CAC |
| total_appointments | INTEGER | Total appointments |
| new_appointments | INTEGER | New patient appointments |
| returning_appointments | INTEGER | Returning patient appointments |
| online_booking | INTEGER | Online bookings |
| total_conversations | INTEGER | Total conversations |
| new_conversations | INTEGER | New patient conversations |
| returning_conversations | INTEGER | Returning patient conversations |
| new_leads | INTEGER | New leads (added manually) |
| returning_leads | INTEGER | Returning leads (added manually) |

### Updated MSSQL Schema (Current)
| Column | Type | Status | Description |
|--------|------|--------|-------------|
| clinic | varchar | Existing | Clinic identifier |
| month | datetime | Existing | Report month |
| traffic_source | varchar | Existing | Marketing channel |
| impressions | float | Existing | Ad impressions |
| visits | float | Existing | Website visits |
| spend | float | Existing | Marketing spend |
| ltv | float | Existing | Lifetime value |
| estimated_ltv_6m | float | Existing | 6-month LTV estimate |
| avg_ltv | float | Existing | Average LTV |
| **total_roas** | float | **Renamed** | Was 'roas', now 'total_roas' |
| **new_roas** | float | **NEW** | ROAS for new customers only |
| leads | float | Existing | Total leads |
| **new_leads** | float | **NOW IN SOURCE** | New customer leads |
| **returning_leads** | float | **NOW IN SOURCE** | Returning customer leads |
| **%total_conversion** | float | **Renamed** | Was '%conversion' |
| **%new_conversion** | float | **NEW** | Conversion rate for new customers |
| cac_total | float | Existing | Total CAC |
| cac_new | float | Existing | New customer CAC |
| **total_estimated_revenue** | float | **NEW** | Total estimated revenue |
| **new_estimated_revenue** | float | **NEW** | New customer estimated revenue |
| total_appointments | float | Existing | Total appointments |
| new_appointments | float | Existing | New patient appointments |
| returning_appointments | float | Existing | Returning patient appointments |
| online_booking | float | Existing | Online bookings |
| total_conversations | float | Existing | Total conversations |
| new_conversations | float | Existing | New patient conversations |
| returning_conversations | float | Existing | Returning patient conversations |
| **avg_appointment_rev** | float | **NEW** | Average revenue per appointment |
| **avg_estimated_ltv_6m** | float | **NEW** | Average estimated 6-month LTV |

## Key Changes

### 1. New Columns Added
- `new_roas` - ROAS specifically for new customers
- `%new_conversion` - Conversion rate for new customers
- `total_estimated_revenue` - Total estimated revenue
- `new_estimated_revenue` - Revenue from new customers
- `avg_appointment_rev` - Average revenue per appointment
- `avg_estimated_ltv_6m` - Average estimated 6-month LTV

### 2. Renamed Columns
- `roas` → `total_roas`
- `%conversion` → `%total_conversion`

### 3. Now Available from Source
- `new_leads` - Previously added manually, now in source data
- `returning_leads` - Previously added manually, now in source data

## Migration Strategy

### Option 1: Add New Columns Only
Add the new columns to existing Supabase table without disrupting current data:
```sql
ALTER TABLE executive_monthly_reports
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);

-- Update renamed column data
UPDATE executive_monthly_reports SET total_roas = roas WHERE total_roas IS NULL;
UPDATE executive_monthly_reports SET total_conversion = conversion_rate WHERE total_conversion IS NULL;
```

### Option 2: Full Re-sync
Re-import all data from MSSQL with the new schema:
1. Create a new table with updated schema
2. Migrate all data from MSSQL
3. Swap tables once verified

### Option 3: Incremental Update
Update existing records with new column data:
1. Add new columns to existing table
2. Run update script to pull new column data from MSSQL
3. Keep existing data intact

## Data Insights

- **Total Records**: 573
- **Date Range**: December 2024 to August 2025
- **Clinics**: 11 unique clinics
- **New Metrics**: Focus on new vs returning customer segmentation
- **Revenue Tracking**: More detailed revenue attribution

## Recommendations

1. **Immediate**: Add new columns to capture additional metrics
2. **Short-term**: Update existing records with new data from MSSQL
3. **Long-term**: Update dashboards to leverage new/returning segmentation
4. **Consider**: Renaming 'roas' to 'total_roas' in application code for consistency