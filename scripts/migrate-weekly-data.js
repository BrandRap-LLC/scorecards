#!/usr/bin/env node

/**
 * Migrate executive_report_new_week from MSSQL to Supabase
 * Using EXACT schema match - NO calculations
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

async function migrateWeekly() {
  console.log('🔄 Executive Weekly Report Migration (EXACT Schema Match)');
  console.log('=' .repeat(60));
  
  let pool;
  
  try {
    // Connect to MSSQL
    console.log('\n📡 Connecting to MSSQL...');
    pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Fetch all data from MSSQL
    console.log('\n📥 Fetching data from MSSQL executive_report_new_week...');
    const dataResult = await pool.request()
      .query('SELECT * FROM executive_report_new_week ORDER BY week DESC, clinic, traffic_source');
    
    console.log(`📊 Found ${dataResult.recordset.length} records`);
    
    if (dataResult.recordset.length === 0) {
      console.log('No data to migrate');
      return;
    }
    
    // Show sample record to verify columns
    console.log('\n📋 Sample MSSQL record:');
    const sampleRecord = dataResult.recordset[0];
    console.log(JSON.stringify(sampleRecord, null, 2));
    
    // Transform data for Supabase - EXACT mapping, no calculations
    const transformedData = dataResult.recordset.map(row => ({
      // Identity columns
      clinic: row.clinic,
      week: row.week, // Date column
      traffic_source: row.traffic_source,
      
      // Metrics - direct mapping from MSSQL
      impressions: row.impressions || 0,
      visits: row.visits || 0,
      spend: row.spend || 0,
      estimated_ltv_6m: row.estimated_ltv_6m || 0,
      total_roas: row.total_roas || 0,
      new_roas: row.new_roas || 0,
      leads: row.leads || 0,
      new_leads: row.new_leads || 0,
      returning_leads: row.returning_leads || 0,
      total_conversion: row['%total_conversion'] || 0,  // Note: % prefix in MSSQL
      new_conversion: row['%new_conversion'] || 0,      // Note: % prefix in MSSQL
      returning_conversion: row['%returning_conversion'] || 0, // Note: % prefix in MSSQL
      cac_total: row.cac_total || 0,
      cac_new: row.cac_new || 0,
      total_estimated_revenue: row.total_estimated_revenue || 0,
      new_estimated_revenue: row.new_estimated_revenue || 0,
      total_appointments: row.total_appointments || 0,
      new_appointments: row.new_appointments || 0,
      returning_appointments: row.returning_appointments || 0,
      online_booking: row.online_booking || 0,
      total_conversations: row.total_conversations || 0,
      new_conversations: row.new_conversations || 0,
      returning_conversations: row.returning_conversations || 0,
      
      // Metadata
      created_at: new Date().toISOString(),
      import_source: 'mssql_executive_report_new_week'
    }));
    
    // Show sample transformed record
    console.log('\n📋 Sample transformed record:');
    console.log(JSON.stringify(transformedData[0], null, 2));
    
    // Clear existing data first
    console.log('\n🗑️  Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('executive_weekly_reports')
      .delete()
      .gte('id', 0);
    
    if (deleteError) {
      console.error('Error clearing data:', deleteError);
    } else {
      console.log('✅ Existing data cleared');
    }
    
    // Insert data into Supabase
    console.log('\n📤 Uploading to Supabase...');
    const batchSize = 50;
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('executive_weekly_reports')
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
      .from('executive_weekly_reports')
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
migrateWeekly().catch(console.error);