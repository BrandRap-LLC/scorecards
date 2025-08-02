#!/usr/bin/env node

/**
 * Direct Migration: Insert MSSQL data directly into Supabase table
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL configuration
const mssqlConfig = {
  server: '54.245.209.65',
  port: 1433,
  database: 'aggregated_reporting',
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function migrate() {
  console.log('🔄 Executive Monthly Report Migration');
  console.log('=====================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get data from MSSQL
    console.log('📥 Fetching data from MSSQL executive_report_new_month...');
    const dataResult = await mssqlPool.request()
      .query('SELECT * FROM executive_report_new_month');
    
    console.log(`📊 Found ${dataResult.recordset.length} records\n`);
    
    if (dataResult.recordset.length === 0) {
      console.log('⚠️  No data to migrate');
      return;
    }
    
    // First, let's create a new table specifically for this data
    console.log('📋 Creating new table executive_monthly_reports in Supabase...');
    
    // Transform data for Supabase
    const transformedData = dataResult.recordset.map(row => ({
      clinic: row.clinic,
      month: row.month,
      traffic_source: row.traffic_source,
      impressions: row.impressions,
      visits: row.visits,
      spend: row.spend,
      ltv: row.ltv,
      estimated_ltv_6m: row.estimated_ltv_6m,
      avg_ltv: row.avg_ltv,
      roas: row.roas,
      leads: row.leads,
      conversion_rate: row['%conversion'] || row.conversion || 0,
      cac_total: row.cac_total,
      cac_new: row.cac_new,
      total_appointments: row.total_appointments,
      new_appointments: row.new_appointments,
      returning_appointments: row.returning_appointments,
      online_booking: row.online_booking,
      total_conversations: row.total_conversations,
      new_conversations: row.new_conversations,
      returning_conversations: row.returning_conversations,
      created_at: new Date().toISOString(),
      import_source: 'mssql_executive_report_new_month'
    }));
    
    // Insert data into Supabase
    console.log('📤 Uploading to Supabase...');
    const batchSize = 50;
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .insert(batch);
      
      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message || error);
        errors.push(error);
        failed += batch.length;
        
        // If table doesn't exist, try to create it
        if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log('\n📝 Table does not exist. Please create it first using this SQL:\n');
          console.log(`
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
CREATE INDEX idx_executive_monthly_clinic ON executive_monthly_reports(clinic);
CREATE INDEX idx_executive_monthly_month ON executive_monthly_reports(month);
CREATE INDEX idx_executive_monthly_traffic ON executive_monthly_reports(traffic_source);
          `);
          
          break;
        }
      } else {
        inserted += batch.length;
        process.stdout.write(`\r  Progress: ${inserted}/${transformedData.length} records`);
      }
    }
    
    console.log('\n\n✨ Migration Summary:');
    console.log('====================');
    console.log(`  ✅ Successfully migrated: ${inserted} records`);
    if (failed > 0) {
      console.log(`  ❌ Failed: ${failed} records`);
    }
    
    // Show sample of migrated data
    if (inserted > 0) {
      console.log('\n📊 Sample migrated data:');
      const { data: sample } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .limit(3);
      
      if (sample && sample.length > 0) {
        sample.forEach((row, i) => {
          console.log(`\n  Record ${i + 1}:`);
          console.log(`    Clinic: ${row.clinic}`);
          console.log(`    Month: ${row.month}`);
          console.log(`    Traffic Source: ${row.traffic_source}`);
          console.log(`    Spend: $${row.spend}`);
          console.log(`    Leads: ${row.leads}`);
        });
      }
    }
    
    // Verify total count
    const { count } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    if (count !== null) {
      console.log(`\n📈 Total records in Supabase executive_monthly_reports table: ${count}`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run migration
migrate().catch(console.error);