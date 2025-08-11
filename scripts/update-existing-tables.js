#!/usr/bin/env node

/**
 * Updates existing Supabase tables with missing columns from MSSQL
 * and syncs new data without creating redundant tables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// SQL commands to add missing columns
const UPDATE_SQLS = {
  executive_monthly_reports: `
    -- Add missing conversion percentage columns to executive_monthly_reports
    ALTER TABLE executive_monthly_reports 
    ADD COLUMN IF NOT EXISTS "%new_conversion" NUMERIC,
    ADD COLUMN IF NOT EXISTS "%returning_conversion" NUMERIC;
    
    -- Update column comments for clarity
    COMMENT ON COLUMN executive_monthly_reports."%new_conversion" IS 'New customer conversion rate as percentage';
    COMMENT ON COLUMN executive_monthly_reports."%returning_conversion" IS 'Returning customer conversion rate as percentage';
  `,
  
  executive_weekly_reports: `
    -- The executive_weekly_reports table already exists with correct schema
    -- It just needs data to be migrated from MSSQL
    SELECT COUNT(*) as row_count FROM executive_weekly_reports;
  `
};

async function updateTables() {
  console.log('🔄 Updating existing Supabase tables with missing columns\n');
  
  // Check current state
  console.log('📋 Current table status:');
  
  const tables = ['executive_monthly_reports', 'executive_weekly_reports', 'ceo_metrics'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`✅ ${table}: ${count} rows`);
    } else {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }
  
  console.log('\n📝 SQL commands to run in Supabase SQL Editor:\n');
  console.log('=' . repeat(70));
  console.log(UPDATE_SQLS.executive_monthly_reports);
  console.log('=' . repeat(70));
  
  console.log('\n💡 Next steps:');
  console.log('1. Run the SQL above in Supabase SQL Editor to add missing columns');
  console.log('2. Run: node scripts/sync-mssql-data.js to sync new data');
  console.log('3. Run: node scripts/migrate-weekly-data.js to populate weekly reports');
}

updateTables().catch(console.error);