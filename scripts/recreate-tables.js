const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function recreateTables() {
  try {
    console.log('Starting table recreation...\n');

    // Drop existing tables
    console.log('Dropping existing tables...');
    const dropQueries = [
      'DROP TABLE IF EXISTS executive_summary CASCADE',
      'DROP TABLE IF EXISTS executive_weekly_reports CASCADE',
      'DROP TABLE IF EXISTS ceo_monthly_reports CASCADE',
      'DROP TABLE IF EXISTS ceo_weekly_reports CASCADE'
    ];

    for (const query of dropQueries) {
      const { error } = await supabase.rpc('execute_sql', { query });
      if (error && !error.message.includes('does not exist')) {
        console.error(`Error dropping table: ${error.message}`);
      }
    }

    // Create executive_summary table
    console.log('\nCreating executive_summary table...');
    const createExecutiveSummaryQuery = `
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
      )
    `;

    const executiveSummaryIndexes = [
      'CREATE INDEX idx_executive_summary_clinic ON executive_summary(clinic)',
      'CREATE INDEX idx_executive_summary_month ON executive_summary(month)',
      'CREATE INDEX idx_executive_summary_traffic ON executive_summary(traffic_source)'
    ];

    // Create executive_weekly_reports table
    console.log('Creating executive_weekly_reports table...');
    const createExecutiveWeeklyQuery = `
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
      )
    `;

    const executiveWeeklyIndexes = [
      'CREATE INDEX idx_executive_weekly_clinic ON executive_weekly_reports(clinic)',
      'CREATE INDEX idx_executive_weekly_week ON executive_weekly_reports(week)',
      'CREATE INDEX idx_executive_weekly_traffic ON executive_weekly_reports(traffic_source)'
    ];

    // Create ceo_monthly_reports table
    console.log('Creating ceo_monthly_reports table...');
    const createCeoMonthlyQuery = `
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
      )
    `;

    const ceoMonthlyIndexes = [
      'CREATE INDEX idx_ceo_monthly_company ON ceo_monthly_reports("Company_Name")',
      'CREATE INDEX idx_ceo_monthly_month ON ceo_monthly_reports(month)',
      'CREATE INDEX idx_ceo_monthly_field ON ceo_monthly_reports(field)'
    ];

    // Create ceo_weekly_reports table
    console.log('Creating ceo_weekly_reports table...');
    const createCeoWeeklyQuery = `
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
      )
    `;

    const ceoWeeklyIndexes = [
      'CREATE INDEX idx_ceo_weekly_company ON ceo_weekly_reports("Company_Name")',
      'CREATE INDEX idx_ceo_weekly_week ON ceo_weekly_reports(week)',
      'CREATE INDEX idx_ceo_weekly_field ON ceo_weekly_reports(field)'
    ];

    // Execute all table creation queries
    const allQueries = [
      { name: 'executive_summary', query: createExecutiveSummaryQuery, indexes: executiveSummaryIndexes },
      { name: 'executive_weekly_reports', query: createExecutiveWeeklyQuery, indexes: executiveWeeklyIndexes },
      { name: 'ceo_monthly_reports', query: createCeoMonthlyQuery, indexes: ceoMonthlyIndexes },
      { name: 'ceo_weekly_reports', query: createCeoWeeklyQuery, indexes: ceoWeeklyIndexes }
    ];

    // Since we can't use RPC, let's try direct SQL execution
    console.log('\nNote: This script requires the Supabase SQL Editor or direct database access.');
    console.log('The following SQL should be executed in your Supabase dashboard:\n');

    // Output all SQL for manual execution
    console.log('-- Drop existing tables');
    dropQueries.forEach(q => console.log(q + ';'));
    console.log('');

    allQueries.forEach(({ name, query, indexes }) => {
      console.log(`-- Create ${name} table`);
      console.log(query.trim() + ';');
      console.log('');
      indexes.forEach(idx => console.log(idx + ';'));
      console.log('');
    });

    // Verify tables were created
    console.log('\n-- Verify tables were created');
    console.log("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('executive_summary', 'executive_weekly_reports', 'ceo_monthly_reports', 'ceo_weekly_reports');");

  } catch (error) {
    console.error('Error recreating tables:', error);
    process.exit(1);
  }
}

recreateTables();