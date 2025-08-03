# Migration Plan for Schema Updates

## Current Status
- **MSSQL Schema**: Updated with new columns and renamed columns
- **Supabase Schema**: Contains old column names but all data is preserved
- **No Data Loss**: No columns were removed, only renamed and added

## Migration Strategy

### Phase 1: Add New Columns (Immediate)
1. Run `sql/update_schema_complete.sql` in Supabase
2. This adds new columns while preserving existing data
3. Creates backward compatibility view

### Phase 2: Sync New Data (Immediate)
1. Run `node scripts/sync-new-columns.js`
2. This populates new columns with data from MSSQL
3. Updates renamed columns with latest values

### Phase 3: Update Application Code (Gradual)
Update references in the codebase:
- `roas` → `total_roas`
- `conversion_rate` → `total_conversion`

### Phase 4: Cleanup (After Code Updates)
Once all code is updated:
1. Drop old column names
2. Remove compatibility view
3. Update documentation

## Column Mapping

| Old Name (Supabase) | New Name (MSSQL) | Action |
|-------------------|------------------|---------|
| roas | total_roas | Keep both, migrate gradually |
| conversion_rate | %total_conversion | Keep both, migrate gradually |
| - | new_roas | Add new column |
| - | %new_conversion | Add new column |
| - | total_estimated_revenue | Add new column |
| - | new_estimated_revenue | Add new column |
| - | avg_appointment_rev | Add new column |
| - | avg_estimated_ltv_6m | Add new column |

## Backward Compatibility

### Option 1: Dual Columns (Recommended)
- Keep both old and new column names
- Sync data to both columns
- Gradually update code to use new names
- Drop old columns after full migration

### Option 2: Database View
- Create view with old column names
- Points to new columns underneath
- No code changes needed immediately
- Performance overhead for views

### Option 3: Application Layer
- Handle column mapping in API layer
- Transform column names in queries
- Most flexible but adds complexity

## Risk Assessment

### Low Risk ✅
- No data loss (no columns removed)
- Backward compatible approach
- Can rollback if needed

### Mitigations
- Keep backups before migration
- Test in development first
- Monitor application after updates
- Use compatibility view during transition

## Timeline

### Day 1
- [ ] Backup current data
- [ ] Add new columns to Supabase
- [ ] Sync new data from MSSQL
- [ ] Verify data integrity

### Week 1
- [ ] Update non-critical code paths
- [ ] Test with new column names
- [ ] Monitor for issues

### Week 2
- [ ] Update remaining code
- [ ] Remove compatibility layers
- [ ] Update documentation

## Validation Queries

### Check Column Usage
```sql
-- Find which columns have data
SELECT 
    COUNT(roas) as old_roas_used,
    COUNT(total_roas) as new_roas_used,
    COUNT(conversion_rate) as old_conv_used,
    COUNT(total_conversion) as new_conv_used
FROM executive_monthly_reports;
```

### Verify Data Consistency
```sql
-- Ensure old and new columns match
SELECT COUNT(*) 
FROM executive_monthly_reports
WHERE roas != total_roas
   OR conversion_rate != total_conversion;
```

### New Metrics Coverage
```sql
-- Check new columns population
SELECT 
    COUNT(*) as total,
    COUNT(new_roas) as has_new_roas,
    COUNT(total_estimated_revenue) as has_revenue,
    COUNT(avg_appointment_rev) as has_avg_rev
FROM executive_monthly_reports;
```