#!/usr/bin/env node

/**
 * Fixed Migration Script: MSSQL executive_report_new_month to Supabase
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL configuration that works
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

// Metric mapping from MSSQL columns to metric codes
const metricMapping = {
  // Revenue Metrics
  'monthly_revenue': 'monthly_revenue',
  'net_revenue': 'net_revenue',
  'gross_revenue': 'gross_revenue',
  'service_revenue': 'service_revenue',
  'product_revenue': 'product_revenue',
  'recurring_revenue': 'recurring_revenue',
  'non_recurring_revenue': 'non_recurring_revenue',
  'refunds': 'refunds',
  'discounts': 'discounts',
  
  // Customer Metrics
  'new_customers': 'new_customers',
  'returning_customers': 'returning_customers',
  'total_customers': 'total_customers',
  'customer_acquisition_cost': 'customer_acquisition_cost',
  'customer_lifetime_value': 'customer_lifetime_value',
  'customer_retention_rate': 'customer_retention_rate',
  'customer_churn_rate': 'customer_churn_rate',
  'net_promoter_score': 'net_promoter_score',
  
  // Operations Metrics
  'total_orders': 'total_orders',
  'completed_orders': 'completed_orders',
  'cancelled_orders': 'cancelled_orders',
  'average_order_value': 'average_order_value',
  'fulfillment_rate': 'fulfillment_rate',
  'return_rate': 'return_rate',
  'inventory_turnover': 'inventory_turnover',
  'operational_efficiency': 'operational_efficiency',
  
  // Financial Metrics
  'gross_profit': 'gross_profit',
  'operating_profit': 'operating_profit',
  'net_profit': 'net_profit',
  'gross_margin': 'gross_margin',
  'operating_margin': 'operating_margin',
  'net_margin': 'net_margin',
  'ebitda': 'ebitda',
  'cash_flow': 'cash_flow',
  'burn_rate': 'burn_rate',
  'runway_months': 'runway_months'
};

async function getMetricId(metricCode) {
  const { data, error } = await supabase
    .from('executive_monthly_metrics')
    .select('id')
    .eq('metric_code', metricCode)
    .single();
  
  if (error || !data) {
    // Create the metric if it doesn't exist
    const { data: newMetric, error: insertError } = await supabase
      .from('executive_monthly_metrics')
      .insert({
        metric_code: metricCode,
        display_name: metricCode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'Uncategorized',
        unit: 'number',
        is_percentage: false,
        is_currency: metricCode.includes('revenue') || metricCode.includes('profit') || 
                     metricCode.includes('cost') || metricCode.includes('value'),
        decimal_places: 2
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error(`Failed to create metric ${metricCode}:`, insertError);
      return null;
    }
    
    return newMetric.id;
  }
  
  return data.id;
}

async function migrate() {
  console.log('🔄 Executive Monthly Report Migration Tool');
  console.log('==========================================\n');
  
  console.log('🚀 Starting Executive Monthly Report Migration\n');
  console.log('📊 Source: MSSQL executive_report_new_month');
  console.log('🎯 Target: Supabase executive_monthly_data\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get table structure
    console.log('🔍 Analyzing source table structure...');
    const columnsResult = await mssqlPool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'executive_report_new_month'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log(`📋 Found ${columnsResult.recordset.length} columns\n`);
    
    // Get data from MSSQL
    console.log('📥 Fetching data from MSSQL...');
    const dataResult = await mssqlPool.request()
      .query('SELECT TOP 1000 * FROM executive_report_new_month');
    
    console.log(`📊 Found ${dataResult.recordset.length} records to migrate\n`);
    
    if (dataResult.recordset.length === 0) {
      console.log('⚠️  No data to migrate');
      return;
    }
    
    // Prepare data for Supabase
    console.log('🔄 Transforming data for Supabase...');
    const dataToInsert = [];
    let skippedColumns = new Set();
    
    for (const row of dataResult.recordset) {
      // Extract base fields
      const baseRecord = {
        report_date: row.report_date || new Date(),
        organization_id: row.organization_id || row.org_id || 'default',
        department: row.department || null,
        region: row.region || null,
        metadata: {}
      };
      
      // Process each column as a potential metric
      for (const [columnName, value] of Object.entries(row)) {
        // Skip base fields and non-metric columns
        if (['id', 'report_date', 'organization_id', 'org_id', 'department', 'region', 'created_at', 'updated_at'].includes(columnName)) {
          continue;
        }
        
        // Check if this column maps to a metric
        const metricCode = metricMapping[columnName] || columnName;
        
        // Skip if value is null or undefined
        if (value === null || value === undefined) {
          continue;
        }
        
        // Try to get or create the metric
        const metricId = await getMetricId(metricCode);
        
        if (metricId) {
          dataToInsert.push({
            ...baseRecord,
            metric_id: metricId,
            value: parseFloat(value) || 0,
            metadata: {
              source_column: columnName,
              import_date: new Date().toISOString()
            }
          });
        } else {
          skippedColumns.add(columnName);
        }
      }
    }
    
    if (skippedColumns.size > 0) {
      console.log(`⚠️  Skipped columns without metric mapping: ${Array.from(skippedColumns).join(', ')}\n`);
    }
    
    console.log(`📦 Prepared ${dataToInsert.length} metric records\n`);
    
    // Insert data into Supabase in batches
    console.log('📤 Uploading to Supabase...');
    const batchSize = 100;
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < dataToInsert.length; i += batchSize) {
      const batch = dataToInsert.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('executive_monthly_data')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} failed:`, error.message);
        failed += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(`\r  📊 Progress: ${inserted}/${dataToInsert.length} records`);
      }
    }
    
    console.log('\n');
    
    // Summary
    console.log('✨ Migration Complete!\n');
    console.log('📊 Summary:');
    console.log(`  ✅ Successfully migrated: ${inserted} records`);
    if (failed > 0) {
      console.log(`  ❌ Failed: ${failed} records`);
    }
    console.log(`  📅 Report dates migrated: ${new Set(dataResult.recordset.map(r => r.report_date?.toISOString?.() || 'unknown')).size} unique dates`);
    console.log(`  🏢 Organizations: ${new Set(dataResult.recordset.map(r => r.organization_id || r.org_id || 'default')).size} unique orgs`);
    
    // Verify in Supabase
    console.log('\n🔍 Verifying migration...');
    const { count, error: countError } = await supabase
      .from('executive_monthly_data')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`✅ Supabase now contains ${count} records in executive_monthly_data`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run migration
migrate().catch(console.error);