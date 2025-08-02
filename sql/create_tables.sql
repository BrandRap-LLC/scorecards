-- Supabase Schema for Weekly Scorecards
-- This schema handles weekly metrics from MSSQL executive_report_new_week table

-- Companies table (reuse existing or create new)
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
  is_mtd BOOLEAN DEFAULT false, -- Month-to-date indicator for incomplete weeks
  is_complete BOOLEAN DEFAULT true,
  wow_change DECIMAL(20, 4), -- Week-over-week absolute change
  wow_percent DECIMAL(10, 4), -- Week-over-week percentage change
  four_week_avg DECIMAL(20, 4),
  twelve_week_avg DECIMAL(20, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, metric_id, year, week_number)
);

-- Index for faster queries
CREATE INDEX idx_scorecards_weekly_company ON scorecards_weekly(company_id);
CREATE INDEX idx_scorecards_weekly_metric ON scorecards_weekly(metric_id);
CREATE INDEX idx_scorecards_weekly_year_week ON scorecards_weekly(year, week_number);
CREATE INDEX idx_scorecards_weekly_dates ON scorecards_weekly(week_start_date, week_end_date);

-- View for latest week's data
CREATE OR REPLACE VIEW latest_scorecards AS
SELECT 
  sw.*,
  c.company_name,
  c.display_name as company_display_name,
  sm.metric_code,
  sm.display_name as metric_name,
  sm.category,
  sm.format_type
FROM scorecards_weekly sw
JOIN companies c ON sw.company_id = c.id
JOIN scorecards_metrics sm ON sw.metric_id = sm.id
WHERE (sw.year, sw.week_number) = (
  SELECT year, week_number 
  FROM scorecards_weekly 
  ORDER BY year DESC, week_number DESC 
  LIMIT 1
)
AND c.is_active = true
AND sm.is_active = true;

-- View for 12-week historical data
CREATE OR REPLACE VIEW scorecards_12week_history AS
WITH latest_week AS (
  SELECT year, week_number 
  FROM scorecards_weekly 
  ORDER BY year DESC, week_number DESC 
  LIMIT 1
),
week_range AS (
  SELECT DISTINCT year, week_number
  FROM scorecards_weekly
  WHERE (year * 100 + week_number) >= (
    SELECT 
      CASE 
        WHEN week_number <= 12 THEN (year - 1) * 100 + (52 + week_number - 12)
        ELSE year * 100 + (week_number - 12)
      END
    FROM latest_week
  )
  ORDER BY year DESC, week_number DESC
  LIMIT 12
)
SELECT 
  sw.*,
  c.company_name,
  c.display_name as company_display_name,
  sm.metric_code,
  sm.display_name as metric_name,
  sm.category,
  sm.format_type
FROM scorecards_weekly sw
JOIN companies c ON sw.company_id = c.id
JOIN scorecards_metrics sm ON sw.metric_id = sm.id
WHERE (sw.year, sw.week_number) IN (SELECT year, week_number FROM week_range)
AND c.is_active = true
AND sm.is_active = true
ORDER BY sw.company_id, sw.metric_id, sw.year DESC, sw.week_number DESC;

-- Function to calculate week-over-week changes
CREATE OR REPLACE FUNCTION calculate_wow_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate WoW change if previous week exists
  WITH prev_week AS (
    SELECT value, trending_value
    FROM scorecards_weekly
    WHERE company_id = NEW.company_id
    AND metric_id = NEW.metric_id
    AND ((year = NEW.year AND week_number = NEW.week_number - 1)
      OR (NEW.week_number = 1 AND year = NEW.year - 1 AND week_number = 52))
    LIMIT 1
  )
  UPDATE scorecards_weekly
  SET 
    wow_change = NEW.value - prev_week.value,
    wow_percent = CASE 
      WHEN prev_week.value != 0 THEN ((NEW.value - prev_week.value) / prev_week.value)
      ELSE NULL
    END
  FROM prev_week
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for WoW calculations
CREATE TRIGGER update_wow_changes
  AFTER INSERT OR UPDATE ON scorecards_weekly
  FOR EACH ROW
  EXECUTE FUNCTION calculate_wow_changes();

-- Sample metrics to insert (adjust based on actual MSSQL columns)
INSERT INTO scorecards_metrics (metric_code, display_name, category, format_type, sort_order) VALUES
-- Revenue Metrics
('net_sales', 'Net Sales', 'Revenue', 'currency', 1),
('gross_sales', 'Gross Sales', 'Revenue', 'currency', 2),
('service_revenue', 'Service Revenue', 'Revenue', 'currency', 3),
('product_revenue', 'Product Revenue', 'Revenue', 'currency', 4),
('revenue_per_customer', 'Revenue per Customer', 'Revenue', 'currency', 5),

-- Customer Metrics
('new_customers', 'New Customers', 'Customer', 'number', 10),
('returning_customers', 'Returning Customers', 'Customer', 'number', 11),
('total_customers', 'Total Customers', 'Customer', 'number', 12),
('customer_retention_rate', 'Customer Retention Rate', 'Customer', 'percent', 13),

-- Operational Metrics
('appointments_scheduled', 'Appointments Scheduled', 'Operations', 'number', 20),
('appointments_completed', 'Appointments Completed', 'Operations', 'number', 21),
('appointment_show_rate', 'Appointment Show Rate', 'Operations', 'percent', 22),
('utilization_rate', 'Utilization Rate', 'Operations', 'percent', 23),
('average_ticket', 'Average Ticket', 'Operations', 'currency', 24),

-- Marketing Metrics
('leads_generated', 'Leads Generated', 'Marketing', 'number', 30),
('lead_conversion_rate', 'Lead Conversion Rate', 'Marketing', 'percent', 31),
('cost_per_lead', 'Cost per Lead', 'Marketing', 'currency', 32),
('marketing_roi', 'Marketing ROI', 'Marketing', 'percent', 33)

ON CONFLICT (metric_code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  format_type = EXCLUDED.format_type,
  sort_order = EXCLUDED.sort_order,
  updated_at = CURRENT_TIMESTAMP;