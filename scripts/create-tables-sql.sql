-- SQL Scripts to create tables in Supabase with correct schemas
-- Run these in Supabase SQL Editor

-- 1. Drop existing tables (if you want to recreate them)
DROP TABLE IF EXISTS executive_summary CASCADE;
DROP TABLE IF EXISTS executive_weekly_reports CASCADE;
DROP TABLE IF EXISTS ceo_monthly_reports CASCADE;
DROP TABLE IF EXISTS ceo_weekly_reports CASCADE;

-- 2. Create executive_summary table
CREATE TABLE executive_summary (
    id SERIAL PRIMARY KEY,
    clinic VARCHAR(255),
    month TIMESTAMP,
    traffic_source VARCHAR(255),
    total_appointments FLOAT,
    new_appointments FLOAT,
    returning_appointments FLOAT,
    avg_appointment_rev FLOAT,
    appointment_est_revenue FLOAT,
    new_appointment_est_6m_revenue FLOAT,
    total_conversations FLOAT,
    new_conversations FLOAT,
    returning_conversations FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_executive_summary_clinic ON executive_summary(clinic);
CREATE INDEX idx_executive_summary_month ON executive_summary(month);
CREATE INDEX idx_executive_summary_traffic ON executive_summary(traffic_source);

-- 3. Create executive_weekly_reports table
CREATE TABLE executive_weekly_reports (
    id SERIAL PRIMARY KEY,
    clinic VARCHAR(255),
    week TIMESTAMP,
    traffic_source VARCHAR(255),
    impressions FLOAT,
    visits FLOAT,
    spend FLOAT,
    estimated_ltv_6m FLOAT,
    total_roas FLOAT,
    new_roas FLOAT,
    leads FLOAT,
    new_leads FLOAT,
    returning_leads FLOAT,
    "%total_conversion" FLOAT,
    "%new_conversion" FLOAT,
    "%returning_conversion" FLOAT,
    cac_total FLOAT,
    cac_new FLOAT,
    total_estimated_revenue FLOAT,
    new_estimated_revenue FLOAT,
    total_appointments FLOAT,
    new_appointments FLOAT,
    returning_appointments FLOAT,
    online_booking FLOAT,
    total_conversations FLOAT,
    new_conversations FLOAT,
    returning_conversations FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_executive_weekly_clinic ON executive_weekly_reports(clinic);
CREATE INDEX idx_executive_weekly_week ON executive_weekly_reports(week);
CREATE INDEX idx_executive_weekly_traffic ON executive_weekly_reports(traffic_source);

-- 4. Create ceo_monthly_reports table
CREATE TABLE ceo_monthly_reports (
    id SERIAL PRIMARY KEY,
    "Company_Name" VARCHAR(255),
    month TIMESTAMP,
    "month#" INTEGER,
    year INTEGER,
    field VARCHAR(255),
    metric FLOAT,
    trending_mth FLOAT,
    workday_completed BIGINT,
    total_workday BIGINT,
    metric_previous_month FLOAT,
    metric_previous_year_month FLOAT,
    trending_vs_prior_month FLOAT,
    trending_vs_prior_year_month FLOAT,
    goal FLOAT,
    trending_vs_goal FLOAT,
    rank BIGINT,
    final_field_name VARCHAR(255),
    format VARCHAR(255),
    descriptions VARCHAR(255),
    formatted_metric VARCHAR(255),
    formatted_trending_mth VARCHAR(255),
    formatted_metric_previous_month VARCHAR(255),
    formatted_metric_previous_year_month VARCHAR(255),
    formatted_trending_vs_prior_month VARCHAR(255),
    formatted_trending_vs_prior_year_month VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ceo_monthly_company ON ceo_monthly_reports("Company_Name");
CREATE INDEX idx_ceo_monthly_month ON ceo_monthly_reports(month);
CREATE INDEX idx_ceo_monthly_field ON ceo_monthly_reports(field);

-- 5. Create ceo_weekly_reports table
CREATE TABLE ceo_weekly_reports (
    id SERIAL PRIMARY KEY,
    "Company_Name" VARCHAR(255),
    week TIMESTAMP,
    "week#" BIGINT,
    year INTEGER,
    field VARCHAR(255),
    metric FLOAT,
    trending_week FLOAT,
    metric_previous_week FLOAT,
    metric_previous_year_week FLOAT,
    trending_vs_previous_week FLOAT,
    trending_vs_previous_year_week FLOAT,
    month TIMESTAMP,
    days_in_month BIGINT,
    goal FLOAT,
    trending_vs_goal FLOAT,
    rank BIGINT,
    final_field_name VARCHAR(255),
    format VARCHAR(255),
    descriptions VARCHAR(255),
    formatted_metric VARCHAR(255),
    formatted_trending_week VARCHAR(255),
    formatted_metric_previous_week VARCHAR(255),
    formatted_metric_previous_year_week VARCHAR(255),
    formatted_trending_vs_previous_week VARCHAR(255),
    formatted_trending_vs_previous_year_week VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ceo_weekly_company ON ceo_weekly_reports("Company_Name");
CREATE INDEX idx_ceo_weekly_week ON ceo_weekly_reports(week);
CREATE INDEX idx_ceo_weekly_field ON ceo_weekly_reports(field);

-- 6. Verify tables were created
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('executive_summary', 'executive_weekly_reports', 'ceo_monthly_reports', 'ceo_weekly_reports')
ORDER BY table_name, ordinal_position;