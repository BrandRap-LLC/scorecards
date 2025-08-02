#!/usr/bin/env node

/**
 * Create executive_monthly_reports table in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  console.log('📋 Creating executive_monthly_reports table in Supabase...\n');
  
  const sql = `
    -- Create table for executive monthly reports
    CREATE TABLE IF NOT EXISTS executive_monthly_reports (
      id SERIAL PRIMARY KEY,
      clinic VARCHAR(255),
      month DATE,
      traffic_source VARCHAR(255),
      impressions INTEGER,
      visits INTEGER,
      spend DECIMAL(10,2),
      ltv DECIMAL(10,2),
      estimated_ltv_6m DECIMAL(10,2),
      avg_ltv DECIMAL(10,2),
      roas DECIMAL(10,2),
      leads INTEGER,
      conversion_rate DECIMAL(5,2),
      cac_total DECIMAL(10,2),
      cac_new DECIMAL(10,2),
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

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_executive_monthly_clinic ON executive_monthly_reports(clinic);
    CREATE INDEX IF NOT EXISTS idx_executive_monthly_month ON executive_monthly_reports(month);
    CREATE INDEX IF NOT EXISTS idx_executive_monthly_traffic ON executive_monthly_reports(traffic_source);
  `;
  
  try {
    // Execute SQL using Supabase RPC or direct query
    // Note: Supabase doesn't directly support DDL through the JS client
    // We'll need to use the SQL editor in Supabase dashboard
    
    console.log('⚠️  Supabase JS client doesn\'t support DDL operations directly.\n');
    console.log('Please run the following SQL in your Supabase SQL editor:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new');
    console.log('2. Copy and paste this SQL:\n');
    console.log('```sql');
    console.log(sql);
    console.log('```\n');
    console.log('3. Click "Run" to create the table\n');
    console.log('4. Then run: node scripts/migrate-direct-insert.js\n');
    
    // Check if table already exists
    const { data, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ Table executive_monthly_reports already exists!');
      const { count } = await supabase
        .from('executive_monthly_reports')
        .select('*', { count: 'exact', head: true });
      console.log(`   Current record count: ${count}`);
    } else if (error.message && error.message.includes('does not exist')) {
      console.log('❌ Table does not exist yet. Please create it using the SQL above.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createTable().catch(console.error);