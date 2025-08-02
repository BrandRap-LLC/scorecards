#!/usr/bin/env node

/**
 * Simplified Migration: MSSQL executive_report_new_month to Supabase
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

async function getOrCreateMetric(metricCode, displayName = null) {
  // Check if metric exists
  const { data: existing } = await supabase
    .from('executive_monthly_metrics')
    .select('id')
    .eq('metric_code', metricCode)
    .single();
  
  if (existing) {
    return existing.id;
  }
  
  // Create new metric
  const { data: newMetric, error } = await supabase
    .from('executive_monthly_metrics')
    .insert({
      metric_code: metricCode,
      display_name: displayName || metricCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category: 'Monthly Report',
      unit_type: 'number',
      format_type: 'standard',
      is_active: true
    })
    .select('id')
    .single();
  
  if (error) {
    console.error(`Failed to create metric ${metricCode}:`, error.message);
    return null;
  }
  
  return newMetric.id;
}

async function migrate() {
  console.log('🔄 Executive Monthly Report Migration');
  console.log('=====================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get column names
    console.log('🔍 Analyzing table structure...');
    const columnsResult = await mssqlPool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'executive_report_new_month'
      ORDER BY ORDINAL_POSITION
    `);
    
    const columns = columnsResult.recordset.map(r => r.COLUMN_NAME);
    console.log(`📋 Found columns: ${columns.join(', ')}\n`);
    
    // Get data from MSSQL
    console.log('📥 Fetching data from MSSQL...');
    const dataResult = await mssqlPool.request()
      .query('SELECT * FROM executive_report_new_month');
    
    console.log(`📊 Found ${dataResult.recordset.length} records\n`);
    
    if (dataResult.recordset.length === 0) {
      console.log('⚠️  No data to migrate');
      return;
    }
    
    // Process and insert data
    console.log('🔄 Processing data...');
    const dataToInsert = [];
    const processedMetrics = new Set();
    
    // Process first record to understand structure
    const firstRow = dataResult.recordset[0];
    console.log('\n📊 Sample data from first row:');
    for (const [key, value] of Object.entries(firstRow)) {
      if (value !== null && value !== undefined && value !== '') {
        console.log(`  ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
      }
    }
    
    // Process all records
    for (const row of dataResult.recordset) {
      // Determine the date field
      const reportDate = row.month || row.report_date || row.date || new Date();
      
      // Determine organization/clinic
      const organization = row.clinic || row.organization || row.organization_id || 'default';
      
      // Process numeric columns as metrics
      for (const [columnName, value] of Object.entries(row)) {
        // Skip non-metric columns
        if (['clinic', 'month', 'traffic_source', 'report_date', 'date', 'organization', 'organization_id'].includes(columnName)) {
          continue;
        }
        
        // Only process numeric values
        if (value !== null && value !== undefined && !isNaN(value)) {
          const metricCode = columnName.toLowerCase().replace(/ /g, '_');
          
          // Get or create metric
          if (!processedMetrics.has(metricCode)) {
            const metricId = await getOrCreateMetric(metricCode);
            if (metricId) {
              processedMetrics.add(metricCode);
            }
          }
          
          // Add to data to insert
          const metricId = await getOrCreateMetric(metricCode);
          if (metricId) {
            dataToInsert.push({
              metric_id: metricId,
              report_date: reportDate,
              organization_id: String(organization),
              department: row.traffic_source || null,
              value: parseFloat(value),
              metadata: {
                source: 'executive_report_new_month',
                import_date: new Date().toISOString()
              }
            });
          }
        }
      }
    }
    
    console.log(`\n📦 Prepared ${dataToInsert.length} metric records`);
    console.log(`📊 Unique metrics: ${processedMetrics.size}`);
    
    // Insert data into Supabase
    console.log('\n📤 Uploading to Supabase...');
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('executive_monthly_data')
        .insert(batch);
      
      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        failed += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(`\r  Progress: ${inserted}/${dataToInsert.length} records`);
      }
    }
    
    console.log('\n\n✨ Migration Complete!');
    console.log('📊 Summary:');
    console.log(`  ✅ Successfully migrated: ${inserted} records`);
    if (failed > 0) {
      console.log(`  ❌ Failed: ${failed} records`);
    }
    
    // Verify migration
    const { count } = await supabase
      .from('executive_monthly_data')
      .select('*', { count: 'exact', head: true });
    
    console.log(`  📈 Total records in Supabase: ${count}`);
    
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