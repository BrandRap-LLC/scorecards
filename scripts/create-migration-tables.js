#!/usr/bin/env node

/**
 * Create or recreate migration tables in Supabase with correct schemas
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Table creation SQL
const tableSchemas = {
  executive_summary: `
    CREATE TABLE IF NOT EXISTS executive_summary (
      id SERIAL PRIMARY KEY,
      clinic VARCHAR(255) NOT NULL,
      month DATE NOT NULL,
      traffic_source VARCHAR(255) NOT NULL,
      total_appointments INTEGER,
      new_appointments INTEGER,
      returning_appointments INTEGER,
      avg_appointment_rev DECIMAL(10,2),
      appointment_est_revenue DECIMAL(10,2),
      new_appointment_est_6m_revenue DECIMAL(10,2),
      total_conversations INTEGER,
      new_conversations INTEGER,
      returning_conversations INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      import_source VARCHAR(255)
    );
    
    CREATE INDEX IF NOT EXISTS idx_executive_summary_clinic ON executive_summary(clinic);
    CREATE INDEX IF NOT EXISTS idx_executive_summary_month ON executive_summary(month);
    CREATE INDEX IF NOT EXISTS idx_executive_summary_traffic ON executive_summary(traffic_source);
  `,
  
  executive_weekly_reports: `
    CREATE TABLE IF NOT EXISTS executive_weekly_reports (
      id SERIAL PRIMARY KEY,
      clinic VARCHAR(255) NOT NULL,
      week DATE NOT NULL,
      traffic_source VARCHAR(255) NOT NULL,
      impressions INTEGER,
      visits INTEGER,
      spend DECIMAL(10,2),
      estimated_ltv_6m DECIMAL(10,2),
      total_roas DECIMAL(10,4),
      new_roas DECIMAL(10,4),
      leads INTEGER,
      new_leads INTEGER,
      returning_leads INTEGER,
      total_conversion DECIMAL(10,4),
      new_conversion DECIMAL(10,4),
      returning_conversion DECIMAL(10,4),
      cac_total DECIMAL(10,2),
      cac_new DECIMAL(10,2),
      total_estimated_revenue DECIMAL(10,2),
      new_estimated_revenue DECIMAL(10,2),
      total_appointments INTEGER,
      new_appointments INTEGER,
      returning_appointments INTEGER,
      online_booking INTEGER,
      total_conversations INTEGER,
      new_conversations INTEGER,
      returning_conversations INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      import_source VARCHAR(255)
    );
    
    CREATE INDEX IF NOT EXISTS idx_executive_weekly_clinic ON executive_weekly_reports(clinic);
    CREATE INDEX IF NOT EXISTS idx_executive_weekly_week ON executive_weekly_reports(week);
    CREATE INDEX IF NOT EXISTS idx_executive_weekly_traffic ON executive_weekly_reports(traffic_source);
  `,
  
  ceo_monthly_reports: `
    CREATE TABLE IF NOT EXISTS ceo_monthly_reports (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      month DATE NOT NULL,
      month_number INTEGER,
      year INTEGER,
      field VARCHAR(255) NOT NULL,
      metric DECIMAL(20,6),
      trending_mth DECIMAL(20,6),
      workday_completed INTEGER,
      total_workday INTEGER,
      metric_previous_month DECIMAL(20,6),
      metric_previous_year_month DECIMAL(20,6),
      trending_vs_prior_month DECIMAL(20,6),
      trending_vs_prior_year_month DECIMAL(20,6),
      goal DECIMAL(20,6),
      trending_vs_goal DECIMAL(20,6),
      rank INTEGER,
      final_field_name VARCHAR(255),
      format VARCHAR(50),
      descriptions TEXT,
      formatted_metric VARCHAR(255),
      formatted_trending_mth VARCHAR(255),
      formatted_metric_previous_month VARCHAR(255),
      formatted_metric_previous_year_month VARCHAR(255),
      formatted_trending_vs_prior_month VARCHAR(255),
      formatted_trending_vs_prior_year_month VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      import_source VARCHAR(255)
    );
    
    CREATE INDEX IF NOT EXISTS idx_ceo_monthly_company ON ceo_monthly_reports(company_name);
    CREATE INDEX IF NOT EXISTS idx_ceo_monthly_month ON ceo_monthly_reports(month);
    CREATE INDEX IF NOT EXISTS idx_ceo_monthly_field ON ceo_monthly_reports(field);
  `,
  
  ceo_weekly_reports: `
    CREATE TABLE IF NOT EXISTS ceo_weekly_reports (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      week DATE NOT NULL,
      week_number INTEGER,
      year INTEGER,
      field VARCHAR(255) NOT NULL,
      metric DECIMAL(20,6),
      trending_week DECIMAL(20,6),
      metric_previous_week DECIMAL(20,6),
      metric_previous_year_week DECIMAL(20,6),
      trending_vs_previous_week DECIMAL(20,6),
      trending_vs_previous_year_week DECIMAL(20,6),
      month DATE,
      days_in_month INTEGER,
      goal DECIMAL(20,6),
      trending_vs_goal DECIMAL(20,6),
      rank INTEGER,
      final_field_name VARCHAR(255),
      format VARCHAR(50),
      descriptions TEXT,
      formatted_metric VARCHAR(255),
      formatted_trending_week VARCHAR(255),
      formatted_metric_previous_week VARCHAR(255),
      formatted_metric_previous_year_week VARCHAR(255),
      formatted_trending_vs_previous_week VARCHAR(255),
      formatted_trending_vs_previous_year_week VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      import_source VARCHAR(255)
    );
    
    CREATE INDEX IF NOT EXISTS idx_ceo_weekly_company ON ceo_weekly_reports(company_name);
    CREATE INDEX IF NOT EXISTS idx_ceo_weekly_week ON ceo_weekly_reports(week);
    CREATE INDEX IF NOT EXISTS idx_ceo_weekly_field ON ceo_weekly_reports(field);
  `
};

async function createTables() {
  console.log('🏗️  Creating Migration Tables in Supabase');
  console.log('=========================================\n');
  
  const tables = [
    { name: 'executive_summary', action: 'keep' },
    { name: 'executive_weekly_reports', action: 'recreate' },
    { name: 'ceo_monthly_reports', action: 'recreate' },
    { name: 'ceo_weekly_reports', action: 'recreate' }
  ];
  
  for (const table of tables) {
    console.log(`\n📋 Processing ${table.name}...`);
    
    try {
      if (table.action === 'recreate') {
        // First drop the table if it exists
        console.log(`  🗑️  Dropping existing table...`);
        const { error: dropError } = await supabase.rpc('execute_sql', {
          query: `DROP TABLE IF EXISTS ${table.name} CASCADE;`
        });
        
        if (dropError) {
          console.log(`  ⚠️  Could not drop table (may not exist or RPC not available)`);
        }
      }
      
      // Create the table
      console.log(`  🏗️  Creating table with correct schema...`);
      const { error: createError } = await supabase.rpc('execute_sql', {
        query: tableSchemas[table.name]
      });
      
      if (createError) {
        console.log(`  ⚠️  Could not create table via RPC`);
        console.log(`  💡 Please run this SQL in Supabase Dashboard:`);
        console.log('\n' + tableSchemas[table.name] + '\n');
      } else {
        console.log(`  ✅ Table created successfully`);
      }
      
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n\n📝 SQL Scripts for Manual Execution');
  console.log('====================================');
  console.log('If automatic creation failed, run these in Supabase SQL Editor:\n');
  
  // Output all SQL for manual execution
  for (const [tableName, sql] of Object.entries(tableSchemas)) {
    console.log(`-- ${tableName}`);
    console.log(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
    console.log(sql);
    console.log('\n');
  }
}

// Run table creation
createTables().catch(console.error);