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

async function migrate() {
  console.log('🔄 Executive Monthly Report Migration (Minimal)');
  console.log('==============================================\n');
  
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
    
    // First, let's check what columns are available in MSSQL
    console.log('📋 MSSQL columns found:');
    if (dataResult.recordset.length > 0) {
      const sampleRow = dataResult.recordset[0];
      Object.keys(sampleRow).forEach(col => {
        console.log(`  - ${col}: ${typeof sampleRow[col]} (sample: ${sampleRow[col]})`);
      });
      console.log('');
    }
    
    // Try a minimal insert with just basic fields
    console.log('📤 Attempting minimal insert to Supabase...');
    
    // Transform data with only essential fields
    const transformedData = dataResult.recordset.map(row => ({
      clinic: row.clinic || '',
      month: row.month || new Date().toISOString(),
      traffic_source: row.traffic_source || '',
      impressions: parseInt(row.impressions) || 0,
      visits: parseInt(row.visits) || 0,
      spend: parseFloat(row.spend) || 0,
      leads: parseInt(row.leads) || 0
    }));
    
    // Try inserting just one record first
    console.log('🧪 Testing with single record...');
    const testRecord = transformedData[0];
    console.log('Test record:', JSON.stringify(testRecord, null, 2));
    
    const { data: testData, error: testError } = await supabase
      .from('executive_monthly_reports')
      .insert([testRecord])
      .select();
    
    if (testError) {
      console.error('❌ Test insert failed:', testError.message);
      console.error('Full error:', testError);
      
      // Try to understand what columns exist
      console.log('\n📝 Attempting to query table structure...');
      const { data: structureData, error: structureError } = await supabase
        .from('executive_monthly_reports')
        .select()
        .limit(0);
      
      if (structureError) {
        console.error('❌ Could not query table structure:', structureError.message);
      }
      
      return;
    }
    
    console.log('✅ Test insert successful!');
    console.log('Inserted data:', testData);
    
    // If test was successful, insert the rest
    console.log('\n📤 Inserting remaining records...');
    const batchSize = 50;
    let inserted = 1; // We already inserted one
    let failed = 0;
    
    for (let i = 1; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, Math.min(i + batchSize, transformedData.length));
      
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
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
    
    // Verify total count
    const { count } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    if (count !== null) {
      console.log(`\n📈 Total records in Supabase executive_monthly_reports table: ${count}`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run migration
migrate().catch(console.error);