-- Check current data in tables

-- Check companies
SELECT 'Companies Table:' as info;
SELECT id, company_name, display_name, is_active 
FROM companies 
ORDER BY id;

-- Check metrics
SELECT '';
SELECT 'Metrics Table:' as info;
SELECT id, metric_code, display_name, category, format_type 
FROM scorecards_metrics 
ORDER BY sort_order
LIMIT 10;

-- Check weekly data
SELECT '';
SELECT 'Weekly Data Sample:' as info;
SELECT 
  c.company_name,
  sm.metric_code,
  sw.year,
  sw.week_number,
  sw.value,
  sw.is_mtd
FROM scorecards_weekly sw
JOIN companies c ON sw.company_id = c.id
JOIN scorecards_metrics sm ON sw.metric_id = sm.id
ORDER BY sw.year DESC, sw.week_number DESC
LIMIT 10;

-- Count records
SELECT '';
SELECT 'Record Counts:' as info;
SELECT 
  (SELECT COUNT(*) FROM companies) as total_companies,
  (SELECT COUNT(*) FROM scorecards_metrics) as total_metrics,
  (SELECT COUNT(*) FROM scorecards_weekly) as total_weekly_records;

-- Check for latest week
SELECT '';
SELECT 'Latest Week in Data:' as info;
SELECT 
  MAX(year) as latest_year,
  MAX(week_number) as latest_week_in_year
FROM scorecards_weekly
WHERE year = (SELECT MAX(year) FROM scorecards_weekly);