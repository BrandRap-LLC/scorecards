#!/usr/bin/env node

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

async function fixTableAndMigrate() {
  console.log('🔄 Executive Monthly Report Migration (with table fix)');
  console.log('====================================================\n');
  
  let mssqlPool;
  
  try {
    // First, let's add the missing column
    console.log('🔧 Adding missing conversion_rate column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2)'
    });
    
    if (alterError && !alterError.message.includes('already exists')) {
      console.log('⚠️  Could not add column via RPC, continuing...');
    } else {
      console.log('✅ Column added or already exists\n');
    }
    
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
    
    // Clear existing data first (if any)
    console.log('🧹 Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('executive_monthly_reports')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.log('⚠️  Could not clear existing data:', deleteError.message);
    }
    
    // Transform data for Supabase - excluding conversion_rate for now
    const transformedData = dataResult.recordset.map(row => ({
      clinic: row.clinic,
      month: row.month,
      traffic_source: row.traffic_source,
      impressions: row.impressions || 0,
      visits: row.visits || 0,
      spend: row.spend || 0,
      ltv: row.ltv || 0,
      estimated_ltv_6m: row.estimated_ltv_6m || 0,
      avg_ltv: row.avg_ltv || 0,
      roas: row.roas || 0,
      leads: row.leads || 0,
      // We'll add conversion_rate in a separate update if the column exists
      cac_total: row.cac_total || 0,
      cac_new: row.cac_new || 0,
      total_appointments: row.total_appointments || 0,
      new_appointments: row.new_appointments || 0,
      returning_appointments: row.returning_appointments || 0,
      online_booking: row.online_booking || 0,
      total_conversations: row.total_conversations || 0,
      new_conversations: row.new_conversations || 0,
      returning_conversations: row.returning_conversations || 0,
      created_at: new Date().toISOString(),
      import_source: 'mssql_executive_report_new_month'
    }));
    
    // Insert data into Supabase
    console.log('📤 Uploading to Supabase (without conversion_rate)...');
    const batchSize = 50;
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message || error);
        errors.push(error);
        failed += batch.length;
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
    
    // Now try to update conversion_rate values if we have any records
    if (inserted > 0) {
      console.log('\n📝 Updating conversion_rate values...');
      
      // Get the conversion data from MSSQL
      const conversionData = dataResult.recordset.map(row => ({
        clinic: row.clinic,
        month: row.month,
        traffic_source: row.traffic_source,
        conversion_rate: row['%conversion'] || row.conversion || 0
      }));
      
      // Update in batches
      let updated = 0;
      for (let i = 0; i < conversionData.length; i += batchSize) {
        const batch = conversionData.slice(i, i + batchSize);
        
        for (const record of batch) {
          const { error: updateError } = await supabase
            .from('executive_monthly_reports')
            .update({ conversion_rate: record.conversion_rate })
            .eq('clinic', record.clinic)
            .eq('month', record.month)
            .eq('traffic_source', record.traffic_source);
          
          if (!updateError) {
            updated++;
          }
        }
        process.stdout.write(`\r  Updated conversion rates: ${updated}/${conversionData.length}`);
      }
      console.log('\n');
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
          console.log(`    Conversion Rate: ${row.conversion_rate || 'N/A'}`);
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
fixTableAndMigrate().catch(console.error);