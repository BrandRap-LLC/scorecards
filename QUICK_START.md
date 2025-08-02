# Quick Start Guide - Scorecards Dashboard

## Current Status
- ✅ Companies table exists (with 11 companies from different source)
- ❌ scorecards_metrics table missing
- ❌ scorecards_weekly table missing
- ❌ No weekly data

## Step-by-Step Setup

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Set Up Database Tables in Supabase

Since you have existing companies that don't match our expected data, we need to handle this carefully.

**Option A: Keep existing companies and add missing tables**

Go to Supabase SQL Editor and run this:

```sql
-- Create metrics table only (companies already exist)
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

-- Create weekly data table
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

-- Insert metrics
INSERT INTO scorecards_metrics (metric_code, display_name, category, unit_type, format_type, sort_order) VALUES
  ('net_sales', 'Net Sales', 'Revenue', 'currency', 'currency', 1),
  ('gross_sales', 'Gross Sales', 'Revenue', 'currency', 'currency', 2),
  ('service_revenue', 'Service Revenue', 'Revenue', 'currency', 'currency', 3),
  ('product_revenue', 'Product Revenue', 'Revenue', 'currency', 'currency', 4),
  ('refunds', 'Refunds', 'Revenue', 'currency', 'currency', 5),
  ('new_customers', 'New Customers', 'Customer', 'count', 'number', 10),
  ('returning_customers', 'Returning Customers', 'Customer', 'count', 'number', 11),
  ('total_customers', 'Total Customers', 'Customer', 'count', 'number', 12),
  ('retention_rate', 'Retention Rate', 'Customer', 'percentage', 'percent', 13),
  ('churn_rate', 'Churn Rate', 'Customer', 'percentage', 'percent', 14),
  ('appointments', 'Appointments', 'Operations', 'count', 'number', 20),
  ('show_rate', 'Show Rate', 'Operations', 'percentage', 'percent', 21),
  ('utilization', 'Utilization', 'Operations', 'percentage', 'percent', 22),
  ('average_ticket', 'Average Ticket', 'Operations', 'currency', 'currency', 23),
  ('treatments_per_customer', 'Treatments per Customer', 'Operations', 'count', 'number', 24),
  ('leads', 'Leads', 'Marketing', 'count', 'number', 30),
  ('conversion_rate', 'Conversion Rate', 'Marketing', 'percentage', 'percent', 31),
  ('cost_per_lead', 'Cost per Lead', 'Marketing', 'currency', 'currency', 32),
  ('marketing_spend', 'Marketing Spend', 'Marketing', 'currency', 'currency', 33),
  ('roi', 'ROI', 'Marketing', 'ratio', 'number', 34),
  ('staff_count', 'Staff Count', 'Staff', 'count', 'number', 40),
  ('revenue_per_staff', 'Revenue per Staff', 'Staff', 'currency', 'currency', 41),
  ('staff_productivity', 'Staff Productivity', 'Staff', 'percentage', 'percent', 42),
  ('nps_score', 'NPS Score', 'Quality', 'score', 'number', 50),
  ('customer_satisfaction', 'Customer Satisfaction', 'Quality', 'percentage', 'percent', 51),
  ('google_rating', 'Google Rating', 'Quality', 'rating', 'rating', 52),
  ('complaints', 'Complaints', 'Quality', 'count', 'number', 53)
ON CONFLICT (metric_code) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_company ON scorecards_weekly(company_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_metric ON scorecards_weekly(metric_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_weekly_year_week ON scorecards_weekly(year, week_number);

-- Create views
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

-- Enable RLS
ALTER TABLE scorecards_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorecards_weekly ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON scorecards_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON scorecards_weekly FOR SELECT USING (true);
```

### 3. Update Sync Script for Your Companies

Since your companies table has different companies, update the sync script mapping in `scripts/sync-mssql-to-supabase.js` to match your actual company names.

### 4. Run Data Sync

```bash
npm run sync
```

### 5. Verify Data

```bash
npm run db:check
```

You should see:
- 11 companies
- 28 metrics
- Weekly data records

### 6. Start the Application

```bash
npm run dev
```

Open http://localhost:3000

## Troubleshooting

If sync fails with company mismatch:
1. Check what companies are in MSSQL: Look at the company_name column in your source data
2. Ensure the companies in Supabase match those names
3. The sync script uses company_name to match records

If you need to start completely fresh:
```sql
-- Nuclear option - removes everything
DROP TABLE IF EXISTS scorecards_weekly CASCADE;
DROP TABLE IF EXISTS scorecards_metrics CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP VIEW IF EXISTS latest_scorecards CASCADE;
DROP VIEW IF EXISTS scorecards_12week_history CASCADE;
```

Then run the full `sql/setup_supabase_tables.sql` script.