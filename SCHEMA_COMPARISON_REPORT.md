# Schema Comparison Report: MSSQL vs Supabase

## Executive Summary

This report compares the schemas between MSSQL and Supabase for three key table pairs:

1. **Executive Monthly Reports**: ✅ Migrated with minor column differences
2. **Executive Weekly Reports**: ⚠️ Table exists but empty - needs data migration
3. **CEO Metrics**: ⚠️ Table exists with data but completely different schema

## Detailed Comparison

### 1. Executive Monthly Reports

**MSSQL Table**: `executive_report_new_month`  
**Supabase Table**: `executive_monthly_reports`  
**Status**: ✅ Migrated (580 records)

#### Missing Columns in Supabase:
- `%new_conversion` (float) - New customer conversion rate
- `%returning_conversion` (float) - Returning customer conversion rate

#### Extra Columns in Supabase:
- `total_conversion` - Duplicate of conversion_rate
- `new_conversion` - Should be %new_conversion
- `returning_conversion` - Should be %returning_conversion  
- `avg_ltv` - Average lifetime value
- `ltv` - Lifetime value

#### Column Name Mappings:
- MSSQL `%total_conversion` → Supabase `conversion_rate`
- MSSQL `total_roas` → Supabase `roas`

**Recommendation**: Add the missing percentage columns or update existing columns to match MSSQL schema exactly.

---

### 2. Executive Weekly Reports

**MSSQL Table**: `executive_report_new_week`  
**Supabase Table**: `executive_weekly_reports`  
**Status**: ⚠️ Table exists but empty (0 records)

#### All MSSQL Columns Need Migration (26 total):
```
clinic, week, traffic_source, impressions, visits, spend, 
estimated_ltv_6m, total_roas, new_roas, leads, new_leads, 
returning_leads, %total_conversion, %new_conversion, 
%returning_conversion, cac_total, cac_new, total_estimated_revenue, 
new_estimated_revenue, total_appointments, new_appointments, 
returning_appointments, online_booking, total_conversations, 
new_conversations, returning_conversations
```

**Key Difference**: Uses `week` (datetime) instead of `month`

**Recommendation**: Migrate all data from MSSQL to populate this table.

---

### 3. CEO Metrics

**MSSQL Table**: `ceo_report_full_month`  
**Supabase Table**: `ceo_metrics`  
**Status**: ⚠️ Completely different schema (6,380 records)

#### MSSQL Schema (25 columns):
- Company-level reporting with formatted values
- Includes: Company_Name, month, metric, trending data, goals, rankings
- Pre-formatted strings for display

#### Supabase Schema (27 columns):
- Normalized structure with IDs
- Includes: company_id, metric_id, calculated changes
- Separate formatting from raw values

#### Major Structural Differences:
1. **Normalization**: Supabase uses IDs instead of names
2. **Calculations**: Supabase has pre-calculated percentage changes
3. **Formatting**: MSSQL has pre-formatted strings, Supabase separates concerns

**Recommendation**: This appears to be an intentional redesign. Consider if you need to:
1. Keep both schemas and sync data with transformations
2. Migrate MSSQL to match Supabase's normalized structure
3. Create a view in Supabase that matches MSSQL structure

---

## Action Items

### Immediate Actions:

1. **Executive Monthly Reports**: 
   - Add missing columns: `%new_conversion`, `%returning_conversion`
   - Or rename existing columns to match MSSQL

2. **Executive Weekly Reports**:
   - Run migration script to populate from MSSQL
   - Ensure week datetime handling is correct

3. **CEO Metrics**:
   - Determine if current schema redesign is intentional
   - If yes, create transformation logic for syncing
   - If no, consider schema alignment

### Migration Scripts Needed:

1. **Update Executive Monthly Schema**:
   ```sql
   ALTER TABLE executive_monthly_reports 
   ADD COLUMN "%new_conversion" DECIMAL(10,4),
   ADD COLUMN "%returning_conversion" DECIMAL(10,4);
   ```

2. **Migrate Executive Weekly Data**:
   - Use existing migration pattern from monthly reports
   - Handle week datetime format correctly

3. **CEO Metrics Transformation**:
   - Need mapping between company names and IDs
   - Need metric name to metric_id mapping
   - Transform flat structure to normalized format

---

## Summary

- **Executive Monthly**: Minor schema adjustments needed
- **Executive Weekly**: Full data migration needed  
- **CEO Metrics**: Major schema differences - needs strategic decision

The executive reports tables are closely aligned and easy to sync. The CEO metrics table represents a significant architectural change that requires careful consideration before syncing.