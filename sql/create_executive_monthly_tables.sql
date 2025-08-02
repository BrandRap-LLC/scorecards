-- =====================================================
-- EXECUTIVE REPORT MONTHLY TABLES
-- =====================================================
-- These tables store monthly executive report data migrated from MSSQL
-- They are separate from the weekly scorecards tables to avoid conflicts

-- Drop existing tables if needed (be careful in production!)
-- DROP TABLE IF EXISTS executive_monthly_data CASCADE;
-- DROP TABLE IF EXISTS executive_monthly_metrics CASCADE;

-- =====================================================
-- 1. EXECUTIVE MONTHLY METRICS DEFINITION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS executive_monthly_metrics (
  id SERIAL PRIMARY KEY,
  metric_code VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  unit_type VARCHAR(50),
  format_type VARCHAR(20) CHECK (format_type IN ('currency', 'number', 'percent', 'ratio', 'rating')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  calculation_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. EXECUTIVE MONTHLY DATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS executive_monthly_data (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  metric_id INTEGER REFERENCES executive_monthly_metrics(id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  value DECIMAL(20, 4),
  previous_month_value DECIMAL(20, 4),
  mom_change DECIMAL(20, 4), -- Month-over-month absolute change
  mom_percent DECIMAL(10, 4), -- Month-over-month percentage change
  yoy_value DECIMAL(20, 4), -- Year-over-year value (same month last year)
  yoy_change DECIMAL(20, 4), -- Year-over-year absolute change
  yoy_percent DECIMAL(10, 4), -- Year-over-year percentage change
  ytd_value DECIMAL(20, 4), -- Year-to-date cumulative value
  three_month_avg DECIMAL(20, 4),
  six_month_avg DECIMAL(20, 4),
  twelve_month_avg DECIMAL(20, 4),
  is_estimated BOOLEAN DEFAULT false,
  is_final BOOLEAN DEFAULT true,
  notes TEXT,
  data_source VARCHAR(255) DEFAULT 'MSSQL',
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, metric_id, year, month)
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_executive_monthly_company ON executive_monthly_data(company_id);
CREATE INDEX IF NOT EXISTS idx_executive_monthly_metric ON executive_monthly_data(metric_id);
CREATE INDEX IF NOT EXISTS idx_executive_monthly_year_month ON executive_monthly_data(year, month);
CREATE INDEX IF NOT EXISTS idx_executive_monthly_composite ON executive_monthly_data(company_id, year, month);

-- =====================================================
-- 4. CREATE VIEW FOR LATEST MONTH DATA
-- =====================================================
CREATE OR REPLACE VIEW latest_executive_monthly AS
WITH latest_month AS (
  SELECT MAX(year * 100 + month) as year_month
  FROM executive_monthly_data
)
SELECT 
  emd.*,
  c.company_name,
  c.display_name as company_display_name,
  emm.metric_code,
  emm.display_name as metric_name,
  emm.category,
  emm.subcategory,
  emm.format_type,
  emm.sort_order
FROM executive_monthly_data emd
JOIN companies c ON emd.company_id = c.id
JOIN executive_monthly_metrics emm ON emd.metric_id = emm.id
JOIN latest_month lm ON (emd.year * 100 + emd.month) = lm.year_month
WHERE c.is_active = true AND emm.is_active = true
ORDER BY c.company_name, emm.sort_order;

-- =====================================================
-- 5. CREATE VIEW FOR 12-MONTH TREND
-- =====================================================
CREATE OR REPLACE VIEW executive_monthly_12month_trend AS
WITH latest_month AS (
  SELECT MAX(year * 100 + month) as year_month
  FROM executive_monthly_data
),
month_range AS (
  SELECT DISTINCT year, month, year * 100 + month as year_month
  FROM executive_monthly_data
  WHERE year * 100 + month <= (SELECT year_month FROM latest_month)
  ORDER BY year_month DESC
  LIMIT 12
)
SELECT 
  emd.*,
  c.company_name,
  c.display_name as company_display_name,
  emm.metric_code,
  emm.display_name as metric_name,
  emm.category,
  emm.subcategory,
  emm.format_type,
  emm.sort_order
FROM executive_monthly_data emd
JOIN companies c ON emd.company_id = c.id
JOIN executive_monthly_metrics emm ON emd.metric_id = emm.id
JOIN month_range mr ON emd.year = mr.year AND emd.month = mr.month
WHERE c.is_active = true AND emm.is_active = true
ORDER BY emd.year DESC, emd.month DESC, c.company_name, emm.sort_order;

-- =====================================================
-- 6. INSERT METRIC DEFINITIONS
-- =====================================================
INSERT INTO executive_monthly_metrics (metric_code, display_name, category, subcategory, unit_type, format_type, sort_order) VALUES
  -- Revenue Metrics
  ('monthly_revenue', 'Monthly Revenue', 'Revenue', 'Core', 'currency', 'currency', 1),
  ('net_revenue', 'Net Revenue', 'Revenue', 'Core', 'currency', 'currency', 2),
  ('gross_revenue', 'Gross Revenue', 'Revenue', 'Core', 'currency', 'currency', 3),
  ('service_revenue', 'Service Revenue', 'Revenue', 'Breakdown', 'currency', 'currency', 4),
  ('product_revenue', 'Product Revenue', 'Revenue', 'Breakdown', 'currency', 'currency', 5),
  ('recurring_revenue', 'Recurring Revenue', 'Revenue', 'Recurring', 'currency', 'currency', 6),
  ('non_recurring_revenue', 'Non-Recurring Revenue', 'Revenue', 'One-Time', 'currency', 'currency', 7),
  ('refunds', 'Refunds', 'Revenue', 'Adjustments', 'currency', 'currency', 8),
  ('discounts', 'Discounts', 'Revenue', 'Adjustments', 'currency', 'currency', 9),
  
  -- Customer Metrics
  ('total_customers', 'Total Customers', 'Customers', 'Count', 'count', 'number', 10),
  ('new_customers', 'New Customers', 'Customers', 'Acquisition', 'count', 'number', 11),
  ('returning_customers', 'Returning Customers', 'Customers', 'Retention', 'count', 'number', 12),
  ('active_customers', 'Active Customers', 'Customers', 'Engagement', 'count', 'number', 13),
  ('customer_retention_rate', 'Customer Retention Rate', 'Customers', 'Retention', 'percentage', 'percent', 14),
  ('customer_churn_rate', 'Customer Churn Rate', 'Customers', 'Retention', 'percentage', 'percent', 15),
  ('customer_lifetime_value', 'Customer Lifetime Value', 'Customers', 'Value', 'currency', 'currency', 16),
  ('average_customer_value', 'Average Customer Value', 'Customers', 'Value', 'currency', 'currency', 17),
  
  -- Operations Metrics
  ('total_appointments', 'Total Appointments', 'Operations', 'Activity', 'count', 'number', 20),
  ('completed_appointments', 'Completed Appointments', 'Operations', 'Activity', 'count', 'number', 21),
  ('cancelled_appointments', 'Cancelled Appointments', 'Operations', 'Activity', 'count', 'number', 22),
  ('no_show_appointments', 'No-Show Appointments', 'Operations', 'Activity', 'count', 'number', 23),
  ('appointment_show_rate', 'Appointment Show Rate', 'Operations', 'Efficiency', 'percentage', 'percent', 24),
  ('utilization_rate', 'Utilization Rate', 'Operations', 'Efficiency', 'percentage', 'percent', 25),
  ('average_ticket_size', 'Average Ticket Size', 'Operations', 'Revenue', 'currency', 'currency', 26),
  ('services_per_customer', 'Services per Customer', 'Operations', 'Activity', 'ratio', 'number', 27),
  
  -- Marketing Metrics
  ('marketing_spend', 'Marketing Spend', 'Marketing', 'Investment', 'currency', 'currency', 30),
  ('total_leads', 'Total Leads', 'Marketing', 'Generation', 'count', 'number', 31),
  ('qualified_leads', 'Qualified Leads', 'Marketing', 'Generation', 'count', 'number', 32),
  ('lead_conversion_rate', 'Lead Conversion Rate', 'Marketing', 'Performance', 'percentage', 'percent', 33),
  ('cost_per_lead', 'Cost per Lead', 'Marketing', 'Efficiency', 'currency', 'currency', 34),
  ('cost_per_acquisition', 'Cost per Acquisition', 'Marketing', 'Efficiency', 'currency', 'currency', 35),
  ('marketing_roi', 'Marketing ROI', 'Marketing', 'Performance', 'ratio', 'number', 36),
  ('channel_attribution', 'Channel Attribution', 'Marketing', 'Analysis', 'count', 'number', 37),
  
  -- Staff/HR Metrics
  ('total_staff', 'Total Staff', 'Staff', 'Count', 'count', 'number', 40),
  ('staff_utilization', 'Staff Utilization', 'Staff', 'Efficiency', 'percentage', 'percent', 41),
  ('revenue_per_staff', 'Revenue per Staff', 'Staff', 'Productivity', 'currency', 'currency', 42),
  ('staff_retention_rate', 'Staff Retention Rate', 'Staff', 'Retention', 'percentage', 'percent', 43),
  ('staff_satisfaction_score', 'Staff Satisfaction Score', 'Staff', 'Satisfaction', 'rating', 'rating', 44),
  
  -- Financial Metrics
  ('gross_profit', 'Gross Profit', 'Financial', 'Profitability', 'currency', 'currency', 50),
  ('gross_margin', 'Gross Margin', 'Financial', 'Profitability', 'percentage', 'percent', 51),
  ('operating_profit', 'Operating Profit', 'Financial', 'Profitability', 'currency', 'currency', 52),
  ('operating_margin', 'Operating Margin', 'Financial', 'Profitability', 'percentage', 'percent', 53),
  ('ebitda', 'EBITDA', 'Financial', 'Profitability', 'currency', 'currency', 54),
  ('cash_flow', 'Cash Flow', 'Financial', 'Liquidity', 'currency', 'currency', 55),
  
  -- Quality/Satisfaction Metrics
  ('nps_score', 'NPS Score', 'Quality', 'Satisfaction', 'score', 'number', 60),
  ('customer_satisfaction', 'Customer Satisfaction', 'Quality', 'Satisfaction', 'percentage', 'percent', 61),
  ('google_rating', 'Google Rating', 'Quality', 'Reviews', 'rating', 'rating', 62),
  ('review_count', 'Review Count', 'Quality', 'Reviews', 'count', 'number', 63),
  ('complaints', 'Complaints', 'Quality', 'Issues', 'count', 'number', 64),
  ('complaint_resolution_rate', 'Complaint Resolution Rate', 'Quality', 'Issues', 'percentage', 'percent', 65)
ON CONFLICT (metric_code) DO UPDATE
SET display_name = EXCLUDED.display_name,
    category = EXCLUDED.category,
    subcategory = EXCLUDED.subcategory,
    format_type = EXCLUDED.format_type,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE executive_monthly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE executive_monthly_data ENABLE ROW LEVEL SECURITY;

-- Create policies for read access
CREATE POLICY "Allow public read access" ON executive_monthly_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON executive_monthly_data FOR SELECT USING (true);

-- =====================================================
-- 8. CREATE UPDATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_executive_monthly_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_executive_monthly_metrics_updated_at 
  BEFORE UPDATE ON executive_monthly_metrics
  FOR EACH ROW EXECUTE FUNCTION update_executive_monthly_updated_at();

CREATE TRIGGER update_executive_monthly_data_updated_at 
  BEFORE UPDATE ON executive_monthly_data
  FOR EACH ROW EXECUTE FUNCTION update_executive_monthly_updated_at();

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate month-over-month changes
CREATE OR REPLACE FUNCTION calculate_mom_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Get previous month's value
  SELECT value INTO NEW.previous_month_value
  FROM executive_monthly_data
  WHERE company_id = NEW.company_id 
    AND metric_id = NEW.metric_id
    AND ((year = NEW.year AND month = NEW.month - 1) 
      OR (year = NEW.year - 1 AND month = 12 AND NEW.month = 1))
  LIMIT 1;
  
  -- Calculate MoM changes if previous month exists
  IF NEW.previous_month_value IS NOT NULL AND NEW.value IS NOT NULL THEN
    NEW.mom_change = NEW.value - NEW.previous_month_value;
    IF NEW.previous_month_value != 0 THEN
      NEW.mom_percent = (NEW.mom_change / NEW.previous_month_value);
    END IF;
  END IF;
  
  -- Get year-over-year value (same month last year)
  SELECT value INTO NEW.yoy_value
  FROM executive_monthly_data
  WHERE company_id = NEW.company_id 
    AND metric_id = NEW.metric_id
    AND year = NEW.year - 1
    AND month = NEW.month
  LIMIT 1;
  
  -- Calculate YoY changes if last year's value exists
  IF NEW.yoy_value IS NOT NULL AND NEW.value IS NOT NULL THEN
    NEW.yoy_change = NEW.value - NEW.yoy_value;
    IF NEW.yoy_value != 0 THEN
      NEW.yoy_percent = (NEW.yoy_change / NEW.yoy_value);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for automatic calculation
CREATE TRIGGER calculate_executive_monthly_changes
  BEFORE INSERT OR UPDATE ON executive_monthly_data
  FOR EACH ROW EXECUTE FUNCTION calculate_mom_changes();

-- =====================================================
-- Success message
-- =====================================================
SELECT 'Executive Monthly tables created successfully!' as message;