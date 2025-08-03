#!/usr/bin/env node

/**
 * Sync new columns from updated MSSQL schema to Supabase
 * Updates existing records with new metric data
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
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all data from MSSQL with new columns
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
        avg_estimated_ltv_6m,
        new_leads,
        returning_leads
      FROM executive_report_new_month
      ORDER BY month, clinic, traffic_source
    `);
    
    console.log(`📊 Found ${result.recordset.length} records to sync\n`);
    
    // Process in batches
    const batchSize = 50;
    let updated = 0;
    let failed = 0;
    const errors = [];
    
    console.log('📤 Updating Supabase records...');
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Update each record
      for (const record of batch) {
        const { data, error } = await supabase
          .from('executive_monthly_reports')
          .update({
            total_roas: record.total_roas,
            new_roas: record.new_roas,
            total_conversion: record.total_conversion,
            new_conversion: record.new_conversion,
            total_estimated_revenue: record.total_estimated_revenue,
            new_estimated_revenue: record.new_estimated_revenue,
            avg_appointment_rev: record.avg_appointment_rev,
            avg_estimated_ltv_6m: record.avg_estimated_ltv_6m,
            // Also update new_leads and returning_leads from source
            new_leads: record.new_leads,
            returning_leads: record.returning_leads
          })
          .eq('clinic', record.clinic)
          .eq('month', new Date(record.month).toISOString().split('T')[0])
          .eq('traffic_source', record.traffic_source);
        
        if (error) {
          failed++;
          errors.push({
            clinic: record.clinic,
            month: record.month,
            traffic_source: record.traffic_source,
            error: error.message
          });
        } else {
          updated++;
        }
      }
      
      // Progress indicator
      process.stdout.write(`\r  Progress: ${updated + failed}/${result.recordset.length} records processed`);
    }
    
    console.log('\n');
    
    // Summary
    console.log('✨ Sync Complete!');
    console.log('=================');
    console.log(`✅ Successfully updated: ${updated} records`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} records`);
      if (errors.length > 0 && errors.length <= 5) {
        console.log('\nError details:');
        errors.forEach(e => {
          console.log(`  - ${e.clinic} (${e.month}): ${e.error}`);
        });
      }
    }
    
    // Verify update with sample data
    console.log('\n🔍 Verifying sync...');
    const { data: sample } = await supabase
      .from('executive_monthly_reports')
      .select('clinic, month, traffic_source, total_roas, new_roas, total_estimated_revenue, new_estimated_revenue')
      .not('total_roas', 'is', null)
      .limit(3);
    
    if (sample && sample.length > 0) {
      console.log('\nSample synced records:');
      sample.forEach(r => {
        console.log(`\n  ${r.clinic} - ${r.traffic_source} (${r.month}):`);
        console.log(`    Total ROAS: ${r.total_roas?.toFixed(2) || 'N/A'}`);
        console.log(`    New ROAS: ${r.new_roas?.toFixed(2) || 'N/A'}`);
        console.log(`    Total Revenue: $${r.total_estimated_revenue?.toFixed(2) || 'N/A'}`);
        console.log(`    New Revenue: $${r.new_estimated_revenue?.toFixed(2) || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    
    // Check if it's a column not found error
    if (error.message && error.message.includes('column')) {
      console.log('\n⚠️  It looks like the new columns might not exist in Supabase yet.');
      console.log('Please run the SQL script first:');
      console.log('  1. Go to: https://supabase.com/dashboard/project/igzswopyyggvelncjmuh/sql/new');
      console.log('  2. Run the SQL from: sql/update_schema_new_columns.sql');
      console.log('  3. Then run this sync script again');
    }
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run the sync
syncNewColumns().catch(console.error);