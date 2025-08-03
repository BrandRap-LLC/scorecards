#!/usr/bin/env node

/**
 * Sync new columns from MSSQL to Supabase with detailed debugging
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mssqlConfig = {
  server: '54.245.209.65',
  port: 1433,
  database: 'aggregated_reporting',
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 60000
  }
};

async function syncNewColumns() {
  console.log('🔄 Syncing New Columns from MSSQL to Supabase');
  console.log('==============================================\n');
  
  let mssqlPool;
  
  try {
    // First check if columns exist in Supabase
    console.log('🔍 Checking Supabase schema...');
    const { data: sample, error: schemaError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1)
      .single();
    
    if (!sample) {
      console.error('❌ Could not fetch Supabase schema');
      return;
    }
    
    const currentColumns = Object.keys(sample);
    const requiredColumns = [
      'total_roas', 'new_roas', 'total_conversion', 'new_conversion',
      'total_estimated_revenue', 'new_estimated_revenue',
      'avg_appointment_rev', 'avg_estimated_ltv_6m'
    ];
    
    const missingColumns = requiredColumns.filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing columns in Supabase:', missingColumns.join(', '));
      console.log('\n⚠️  IMPORTANT: You must first add the columns to Supabase!');
      console.log('\n📝 Steps to add columns:');
      console.log('1. Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new');
      console.log('2. Copy and run the SQL from: sql/execute_now.sql');
      console.log('3. After running the SQL, run this sync script again\n');
      return;
    }
    
    console.log('✅ All required columns exist in Supabase\n');
    
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all data from MSSQL
    console.log('📥 Fetching data from MSSQL...');
    const result = await mssqlPool.request().query(`
      SELECT 
        clinic,
        month,
        traffic_source,
        total_roas,
        new_roas,
        [%total_conversion] as total_conversion,
        [%new_conversion] as new_conversion,
        total_estimated_revenue,
        new_estimated_revenue,
        avg_appointment_rev,
        avg_estimated_ltv_6m
      FROM executive_report_new_month
      ORDER BY month, clinic, traffic_source
    `);
    
    console.log(`📊 Found ${result.recordset.length} records in MSSQL\n`);
    
    // Show sample of data to sync
    if (result.recordset.length > 0) {
      console.log('📋 Sample data from MSSQL (first record):');
      const sample = result.recordset[0];
      console.log(`  Clinic: ${sample.clinic}`);
      console.log(`  Month: ${sample.month}`);
      console.log(`  Traffic Source: ${sample.traffic_source}`);
      console.log(`  Total ROAS: ${sample.total_roas}`);
      console.log(`  New ROAS: ${sample.new_roas}`);
      console.log(`  Total Revenue: ${sample.total_estimated_revenue}`);
      console.log('\n');
    }
    
    // Process in batches
    const batchSize = 50;
    let updated = 0;
    let failed = 0;
    const errors = [];
    
    console.log('📤 Updating Supabase records...');
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      for (const record of batch) {
        const updateData = {
          total_roas: record.total_roas,
          new_roas: record.new_roas,
          total_conversion: record.total_conversion,
          new_conversion: record.new_conversion,
          total_estimated_revenue: record.total_estimated_revenue,
          new_estimated_revenue: record.new_estimated_revenue,
          avg_appointment_rev: record.avg_appointment_rev,
          avg_estimated_ltv_6m: record.avg_estimated_ltv_6m
        };
        
        // Format month properly
        const monthDate = new Date(record.month);
        const formattedMonth = monthDate.toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('executive_monthly_reports')
          .update(updateData)
          .eq('clinic', record.clinic)
          .eq('month', formattedMonth)
          .eq('traffic_source', record.traffic_source)
          .select();
        
        if (error) {
          failed++;
          if (errors.length < 5) {
            errors.push({
              clinic: record.clinic,
              month: formattedMonth,
              traffic_source: record.traffic_source,
              error: error.message
            });
          }
        } else if (data && data.length > 0) {
          updated++;
        } else {
          failed++;
          if (errors.length < 5) {
            errors.push({
              clinic: record.clinic,
              month: formattedMonth,
              traffic_source: record.traffic_source,
              error: 'No matching record found in Supabase'
            });
          }
        }
      }
      
      process.stdout.write(`\r  Progress: ${updated + failed}/${result.recordset.length} records processed`);
    }
    
    console.log('\n');
    
    // Summary
    console.log('✨ Sync Complete!');
    console.log('=================');
    console.log(`✅ Successfully updated: ${updated} records`);
    console.log(`❌ Failed: ${failed} records`);
    
    if (errors.length > 0) {
      console.log('\n❌ Sample errors (first 5):');
      errors.forEach(e => {
        console.log(`  - ${e.clinic} | ${e.month} | ${e.traffic_source}`);
        console.log(`    Error: ${e.error}`);
      });
    }
    
    // Verify the sync
    console.log('\n🔍 Verifying sync...');
    const { data: verifyData } = await supabase
      .from('executive_monthly_reports')
      .select('clinic, month, traffic_source, total_roas, new_roas, total_estimated_revenue')
      .not('total_roas', 'is', null)
      .limit(5);
    
    if (verifyData && verifyData.length > 0) {
      console.log(`\n✅ Found ${verifyData.length} records with synced data:`);
      verifyData.forEach(r => {
        console.log(`  ${r.clinic} (${r.month}): ROAS=${r.total_roas?.toFixed(2)}, Revenue=$${r.total_estimated_revenue?.toFixed(2)}`);
      });
    } else {
      console.log('\n⚠️  No records found with synced data');
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run the sync
syncNewColumns().catch(console.error);