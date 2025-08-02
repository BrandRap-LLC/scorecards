-- Supabase Schema for Weekly Scorecards
-- Run this in Supabase SQL Editor to set up the database

-- Drop existing tables if needed (be careful in production!)
-- DROP TABLE IF EXISTS scorecards_weekly CASCADE;
-- DROP TABLE IF EXISTS scorecards_metrics CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scorecards metrics definition table
CREATE TABLE IF NOT EXISTS scorecards_metrics (
  id SERIAL PRIMARY KEY,
  metric_code VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit_type VARCHAR(50),
  format_type VARCHAR(20) CHECK (format_type IN ('currency', 'number', 'percent', 'rating')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Weekly scorecards data table
CREATE TABLE IF NOT EXISTS scorecards_weekly (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  metric_id INTEGER REFERENCES scorecards_metrics(id),
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 53),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  value DECIMAL(20, 4),
  trending_value DECIMAL(20, 4),
  is_mtd BOOLEAN DEFAULT false,
  is_complete BOOLEAN DEFAULT true,
  wow_change DECIMAL(20, 4),
  wow_percent DECIMAL(10, 4),
  four_week_avg DECIMAL(20, 4),
  twelve_week_avg DECIMAL(20, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, metric_id, year, week_number)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_company ON scorecards_weekly(company_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_metric ON scorecards_weekly(metric_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_year_week ON scorecards_weekly(year, week_number);
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_composite ON scorecards_weekly(company_id, year, week_number);

-- Create view for latest week's data
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

-- Create view for 12-week history
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

-- Insert sample companies (you'll replace with actual data from MSSQL)
-- Using ON CONFLICT to handle existing records
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
  ('elite_body', 'Elite Body')
ON CONFLICT (company_name) DO UPDATE
SET display_name = EXCLUDED.display_name,
    updated_at = CURRENT_TIMESTAMP;

-- Insert metric definitions
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
  ('complaints', 'Complaints', 'Quality', 'count', 'number', 53)
ON CONFLICT (metric_code) DO UPDATE
SET display_name = EXCLUDED.display_name,
    category = EXCLUDED.category,
    format_type = EXCLUDED.format_type,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards_weekly ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Allow public read access" ON companies FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON scorecards_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON scorecards_weekly FOR SELECT USING (true);

-- Create update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scorecards_metrics_updated_at BEFORE UPDATE ON scorecards_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scorecards_weekly_updated_at BEFORE UPDATE ON scorecards_weekly
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();