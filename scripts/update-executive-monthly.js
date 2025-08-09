#!/usr/bin/env node

/**
 * Update Executive Monthly Reports from MSSQL
 * Only includes columns that exist in Supabase
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
    enableArithAbort: true
  }
};

async function updateExecutiveMonthly() {
  console.log('🔄 Updating Executive Monthly Reports from MSSQL');
  console.log('=================================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all data from MSSQL
    console.log('📥 Fetching data from MSSQL executive_report_new_month...');
    const result = await mssqlPool.request()
      .query('SELECT * FROM executive_report_new_month ORDER BY month DESC, clinic, traffic_source');
    
    console.log(`📊 Found ${result.recordset.length} records in MSSQL\n`);
    
    // Delete existing data in Supabase
    console.log('🗑️  Deleting existing data in Supabase...');
    const { error: deleteError } = await supabase
      .from('executive_monthly_reports')
      .delete()
      .neq('id', 0); // Delete all rows
      
    if (deleteError) {
      console.error('Error deleting data:', deleteError);
      return;
    }
    console.log('✅ Deleted existing data\n');
    
    // Transform and insert data
    console.log('📤 Inserting new data into Supabase...');
    
    // Process in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Transform the batch - only include columns that exist in Supabase
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month,
        traffic_source: row.traffic_source,
        impressions: row.impressions || 0,
        visits: row.visits || 0,
        spend: row.spend || 0,
        estimated_ltv_6m: row.estimated_ltv_6m || 0,
        leads: row.leads || 0,
        new_leads: row.new_leads || 0,
        returning_leads: row.returning_leads || 0,
        cac_total: row.cac_total || 0,
        cac_new: row.cac_new || 0,
        total_appointments: row.total_appointments || 0,
        new_appointments: row.new_appointments || 0,
        returning_appointments: row.returning_appointments || 0,
        online_booking: row.online_booking || 0,
        total_roas: row.total_roas || 0,
        new_roas: row.new_roas || 0,
        total_conversion: row['%total_conversion'] || 0,
        new_conversion: row['%new_conversion'] || 0,
        returning_conversion: row['%returning_conversion'] || 0,
        total_estimated_revenue: row.total_estimated_revenue || 0,
        new_estimated_revenue: row.new_estimated_revenue || 0,
        import_source: 'MSSQL_UPDATE_' + new Date().toISOString().split('T')[0]
      }));
      
      // Insert the batch
      const { error: insertError } = await supabase
        .from('executive_monthly_reports')
        .insert(transformedBatch);
        
      if (insertError) {
        console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, insertError.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        process.stdout.write(`\r  Progress: ${successCount}/${result.recordset.length} records`);
      }
    }
    
    console.log('\n');
    
    // Verify the update
    console.log('✅ Verifying update...');
    
    const { count: finalCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
      
    console.log(`\n📊 Update Summary:`);
    console.log(`  Total records in MSSQL: ${result.recordset.length}`);
    console.log(`  Successfully inserted: ${successCount}`);
    console.log(`  Failed to insert: ${errorCount}`);
    console.log(`  Final count in Supabase: ${finalCount}`);
    
    // Show most recent data
    const { data: recentData } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .order('month', { ascending: false })
      .limit(5);
      
    console.log('\n📋 Most recent records:');
    recentData?.forEach((record, i) => {
      console.log(`  ${i + 1}. ${record.clinic} - ${record.month} - ${record.traffic_source}`);
    });
    
  } catch (error) {
    console.error('❌ Error during update:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run the update
updateExecutiveMonthly()
  .then(() => {
    console.log('\n✨ Update completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  });