#!/usr/bin/env node

/**
 * Migrate executive_report_new_month from MSSQL to Supabase
 * Using EXACT column mapping with NO calculations
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Database configurations
const mssqlConfig = {
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  server: '54.245.209.65',
  database: 'aggregated_reporting',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('🔄 Executive Monthly Report Migration (EXACT Column Mapping)');
  console.log('=' .repeat(60));
  
  let pool;
  
  try {
    // Connect to MSSQL
    console.log('\n📡 Connecting to MSSQL...');
    pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Fetch all data from MSSQL
    console.log('\n📥 Fetching data from MSSQL executive_report_new_month...');
    const dataResult = await pool.request()
      .query('SELECT * FROM executive_report_new_month ORDER BY month DESC, clinic, traffic_source');
    
    console.log(`📊 Found ${dataResult.recordset.length} records`);
    
    if (dataResult.recordset.length === 0) {
      console.log('No data to migrate');
      return;
    }
    
    // Show sample record to verify columns
    console.log('\n📋 Sample MSSQL record columns:');
    const sampleRecord = dataResult.recordset[0];
    console.log(Object.keys(sampleRecord).join(', '));
    
    // Transform data for Supabase - EXACT mapping, no calculations
    const transformedData = dataResult.recordset.map(row => ({
      // Identity columns
      clinic: row.clinic,
      month: row.month,
      traffic_source: row.traffic_source,
      
      // All required metrics - direct mapping from MSSQL (removed 4 metrics)
      cac_new: row.cac_new || 0,
      cac_total: row.cac_total || 0,
      estimated_ltv_6m: row.estimated_ltv_6m || 0,
      impressions: row.impressions || 0,
      leads: row.leads || 0,
      new_appointments: row.new_appointments || 0,
      new_conversations: row.new_conversations || 0,
      new_conversion: row.new_conversion || 0,
      new_estimated_revenue: row.new_estimated_revenue || 0,
      new_leads: row.new_leads || 0,
      new_roas: row.new_roas || 0,
      online_booking: row.online_booking || 0,
      returning_appointments: row.returning_appointments || 0,
      returning_conversations: row.returning_conversations || 0,
      returning_leads: row.returning_leads || 0,
      spend: row.spend || 0,
      total_appointments: row.total_appointments || 0,
      total_conversations: row.total_conversations || 0,
      total_conversion: row.total_conversion || 0,
      total_estimated_revenue: row.total_estimated_revenue || 0,
      total_roas: row.total_roas || 0,
      visits: row.visits || 0,
      
      // Metadata
      created_at: new Date().toISOString(),
      import_source: 'mssql_executive_report_new_month'
    }));
    
    // Show sample transformed record
    console.log('\n📋 Sample transformed record:');
    console.log(JSON.stringify(transformedData[0], null, 2));
    
    // Insert data into Supabase
    console.log('\n📤 Uploading to Supabase...');
    const batchSize = 50;
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        failed += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(`\r✅ Progress: ${inserted}/${transformedData.length} records`);
      }
    }
    
    console.log('\n');
    
    // Verify the migration
    const { count } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n✨ Migration Summary:');
    console.log('=' .repeat(25));
    console.log(`  ✅ Successfully migrated: ${inserted} records`);
    console.log(`  ❌ Failed: ${failed} records`);
    console.log(`\n📈 Total records in Supabase: ${count}`);
    
  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error(error);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run migration
migrate().catch(console.error);