-- RESET SCRIPT - Use this to clean up and start fresh
-- WARNING: This will delete all data! Only use if you need to start over.

-- Disable RLS temporarily to ensure we can delete
ALTER TABLE scorecards_weekly DISABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS latest_scorecards CASCADE;
DROP VIEW IF EXISTS scorecards_12week_history CASCADE;

-- Delete all data from tables (keeps structure)
TRUNCATE TABLE scorecards_weekly CASCADE;
TRUNCATE TABLE scorecards_metrics CASCADE;
TRUNCATE TABLE companies CASCADE;

-- Reset the sequences (auto-increment counters)
ALTER SEQUENCE companies_id_seq RESTART WITH 1;
ALTER SEQUENCE scorecards_metrics_id_seq RESTART WITH 1;
ALTER SEQUENCE scorecards_weekly_id_seq RESTART WITH 1;

-- Re-enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards_weekly ENABLE ROW LEVEL SECURITY;

-- Recreate the views
CREATE OR REPLACE VIEW latest_scorecards AS
WITH latest_week AS (
  SELECT MAX(year * 100 + week_number) as year_week
  FROM scorecards_weekly
)
SELECT 
  sw.*,
  c.company_name,
  c.display_name as company_display_name,
  sm.metric_code,
  sm.display_name as metric_name,
  sm.category,
  sm.format_type,
  sm.sort_order
FROM scorecards_weekly sw
JOIN companies c ON sw.company_id = c.id
JOIN scorecards_metrics sm ON sw.metric_id = sm.id
JOIN latest_week lw ON (sw.year * 100 + sw.week_number) = lw.year_week
WHERE c.is_active = true AND sm.is_active = true
ORDER BY c.company_name, sm.sort_order;

CREATE OR REPLACE VIEW scorecards_12week_history AS
WITH latest_week AS (
  SELECT MAX(year * 100 + week_number) as year_week
  FROM scorecards_weekly
),
week_range AS (
  SELECT DISTINCT year, week_number, year * 100 + week_number as year_week
  FROM scorecards_weekly
  WHERE year * 100 + week_number <= (SELECT year_week FROM latest_week)
  ORDER BY year_week DESC
  LIMIT 12
)
SELECT 
  sw.*,
  c.company_name,
  c.display_name as company_display_name,
  sm.metric_code,
  sm.display_name as metric_name,
  sm.category,
  sm.format_type,
  sm.sort_order
FROM scorecards_weekly sw
JOIN companies c ON sw.company_id = c.id
JOIN scorecards_metrics sm ON sw.metric_id = sm.id
JOIN week_range wr ON sw.year = wr.year AND sw.week_number = wr.week_number
WHERE c.is_active = true AND sm.is_active = true
ORDER BY sw.year DESC, sw.week_number DESC, c.company_name, sm.sort_order;

-- Now re-insert the base data
-- Companies
INSERT INTO companies (company_name, display_name) VALUES
  ('ideal_image', 'Ideal Image'),
  ('sono_bello', 'Sono Bello'),
  ('laseraway', 'LaserAway'),
  ('milan', 'Milan'),
  ('sleepys', 'Sleepys'),
  ('airsculpt', 'AirSculpt'),
  ('beverly_hills', 'Beverly Hills'),
  ('profiles', 'Profiles'),
  ('lipo_center', 'Lipo Center'),
  ('skin_spa', 'Skin Spa'),
  ('elite_body', 'Elite Body');

-- Metrics
INSERT INTO scorecards_metrics (metric_code, display_name, category, unit_type, format_type, sort_order) VALUES
  -- Revenue Metrics
  ('net_sales', 'Net Sales', 'Revenue', 'currency', 'currency', 1),
  ('gross_sales', 'Gross Sales', 'Revenue', 'currency', 'currency', 2),
  ('service_revenue', 'Service Revenue', 'Revenue', 'currency', 'currency', 3),
  ('product_revenue', 'Product Revenue', 'Revenue', 'currency', 'currency', 4),
  ('refunds', 'Refunds', 'Revenue', 'currency', 'currency', 5),
  
  -- Customer Metrics
  ('new_customers', 'New Customers', 'Customer', 'count', 'number', 10),
  ('returning_customers', 'Returning Customers', 'Customer', 'count', 'number', 11),
  ('total_customers', 'Total Customers', 'Customer', 'count', 'number', 12),
  ('retention_rate', 'Retention Rate', 'Customer', 'percentage', 'percent', 13),
  ('churn_rate', 'Churn Rate', 'Customer', 'percentage', 'percent', 14),
  
  -- Operations Metrics
  ('appointments', 'Appointments', 'Operations', 'count', 'number', 20),
  ('show_rate', 'Show Rate', 'Operations', 'percentage', 'percent', 21),
  ('utilization', 'Utilization', 'Operations', 'percentage', 'percent', 22),
  ('average_ticket', 'Average Ticket', 'Operations', 'currency', 'currency', 23),
  ('treatments_per_customer', 'Treatments per Customer', 'Operations', 'count', 'number', 24),
  
  -- Marketing Metrics
  ('leads', 'Leads', 'Marketing', 'count', 'number', 30),
  ('conversion_rate', 'Conversion Rate', 'Marketing', 'percentage', 'percent', 31),
  ('cost_per_lead', 'Cost per Lead', 'Marketing', 'currency', 'currency', 32),
  ('marketing_spend', 'Marketing Spend', 'Marketing', 'currency', 'currency', 33),
  ('roi', 'ROI', 'Marketing', 'ratio', 'number', 34),
  
  -- Staff Metrics
  ('staff_count', 'Staff Count', 'Staff', 'count', 'number', 40),
  ('revenue_per_staff', 'Revenue per Staff', 'Staff', 'currency', 'currency', 41),
  ('staff_productivity', 'Staff Productivity', 'Staff', 'percentage', 'percent', 42),
  
  -- Quality Metrics
  ('nps_score', 'NPS Score', 'Quality', 'score', 'number', 50),
  ('customer_satisfaction', 'Customer Satisfaction', 'Quality', 'percentage', 'percent', 51),
  ('google_rating', 'Google Rating', 'Quality', 'rating', 'rating', 52),
  ('complaints', 'Complaints', 'Quality', 'count', 'number', 53);

-- Success message
SELECT 'Tables reset successfully! Now run the sync script to import data.' as message;