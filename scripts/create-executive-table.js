#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTable() {
  console.log('📊 Creating executive_monthly_reports table...\n');
  
  const createTableSQL = `
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
  `;
  
  const createIndexesSQL = `
    CREATE INDEX IF NOT EXISTS idx_executive_monthly_clinic ON executive_monthly_reports(clinic);
    CREATE INDEX IF NOT EXISTS idx_executive_monthly_month ON executive_monthly_reports(month);
    CREATE INDEX IF NOT EXISTS idx_executive_monthly_traffic ON executive_monthly_reports(traffic_source);
  `;
  
  try {
    // Create table
    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });
    
    if (tableError) {
      console.error('Error creating table:', tableError);
      console.log('\nPlease run this SQL directly in Supabase SQL editor:');
      console.log(createTableSQL);
      return;
    }
    
    console.log('✅ Table created successfully');
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql_query: createIndexesSQL 
    });
    
    if (indexError) {
      console.log('⚠️  Could not create indexes via RPC, but table was created');
    } else {
      console.log('✅ Indexes created successfully');
    }
    
    // Verify table exists
    const { data, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('\n❌ Table verification failed:', error);
    } else {
      console.log('\n✅ Table verified and ready for data!');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
    console.log('\nPlease run this SQL directly in Supabase SQL editor:');
    console.log(createTableSQL);
    console.log(createIndexesSQL);
  }
}

createTable();