-- Cleanup unused tables from migration attempts
-- These tables were created during development but are no longer needed
-- The active table is: executive_monthly_reports

-- Drop unused tables
DROP TABLE IF EXISTS executive_monthly_metrics CASCADE;
DROP TABLE IF EXISTS executive_monthly_data CASCADE;
DROP TABLE IF EXISTS ceo_report CASCADE;

-- Verify cleanup
SELECT 
  tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
  AND (tablename LIKE '%executive%' OR tablename LIKE '%ceo%')
ORDER BY tablename;

-- The only remaining table should be executive_monthly_reports