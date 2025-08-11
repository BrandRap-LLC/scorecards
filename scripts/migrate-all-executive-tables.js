#!/usr/bin/env node

/**
 * Comprehensive Migration: Migrate all executive and CEO tables from MSSQL to Supabase
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

// Migration configurations
const migrations = [
  {
    name: 'Executive Summary',
    source: 'executive_summary',
    target: 'executive_summary',
    expectedRows: 599,
    batchSize: 100,
    transform: (row) => ({
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
      conversion_rate: row['%conversion'] || row.conversion || row.conversion_rate || 0,
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
      import_source: 'mssql_executive_summary'
    })
  },
  {
    name: 'Executive Weekly Reports',
    source: 'executive_report_new_week',
    target: 'executive_weekly_reports',
    expectedRows: 2170,
    batchSize: 100,
    transform: (row) => ({
      clinic: row.clinic,
      week: row.week,
      traffic_source: row.traffic_source,
      impressions: row.impressions,
      visits: row.visits,
      spend: row.spend,
      ltv: row.ltv,
      estimated_ltv_6m: row.estimated_ltv_6m,
      avg_ltv: row.avg_ltv,
      roas: row.roas,
      leads: row.leads,
      conversion_rate: row['%conversion'] || row.conversion || row.conversion_rate || 0,
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
      import_source: 'mssql_executive_report_new_week'
    })
  },
  {
    name: 'CEO Monthly Reports',
    source: 'ceo_report_full_month',
    target: 'ceo_monthly_reports',
    expectedRows: 6380,
    batchSize: 100,
    transform: (row) => ({
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
      conversion_rate: row['%conversion'] || row.conversion || row.conversion_rate || 0,
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
      import_source: 'mssql_ceo_report_full_month'
    })
  },
  {
    name: 'CEO Weekly Reports',
    source: 'ceo_report_full_week',
    target: 'ceo_weekly_reports',
    expectedRows: 27115,
    batchSize: 500,
    transform: (row) => ({
      clinic: row.clinic,
      week: row.week,
      traffic_source: row.traffic_source,
      impressions: row.impressions,
      visits: row.visits,
      spend: row.spend,
      ltv: row.ltv,
      estimated_ltv_6m: row.estimated_ltv_6m,
      avg_ltv: row.avg_ltv,
      roas: row.roas,
      leads: row.leads,
      conversion_rate: row['%conversion'] || row.conversion || row.conversion_rate || 0,
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
      import_source: 'mssql_ceo_report_full_week'
    })
  }
];

async function clearTable(tableName) {
  console.log(`🗑️  Clearing existing data from ${tableName}...`);
  const { error } = await supabase
    .from(tableName)
    .delete()
    .neq('id', 0); // Delete all rows
  
  if (error) {
    console.error(`⚠️  Error clearing table ${tableName}:`, error.message);
    return false;
  }
  
  console.log(`✅ Table ${tableName} cleared`);
  return true;
}

async function migrateTable(mssqlPool, config) {
  console.log(`\n🔄 Migrating ${config.name}`);
  console.log('=' .repeat(50));
  
  try {
    // Clear existing data in target table
    const cleared = await clearTable(config.target);
    if (!cleared) {
      console.log(`⚠️  Skipping migration for ${config.name} due to clear error`);
      return { success: false, error: 'Failed to clear table' };
    }
    
    // Get data from MSSQL
    console.log(`📥 Fetching data from MSSQL ${config.source}...`);
    const dataResult = await mssqlPool.request()
      .query(`SELECT * FROM ${config.source}`);
    
    console.log(`📊 Found ${dataResult.recordset.length} records (expected: ${config.expectedRows})`);
    
    if (dataResult.recordset.length === 0) {
      console.log('⚠️  No data to migrate');
      return { success: true, inserted: 0, failed: 0 };
    }
    
    // Transform data
    console.log('🔄 Transforming data...');
    const transformedData = dataResult.recordset.map(config.transform);
    
    // Insert data into Supabase in batches
    console.log(`📤 Uploading to Supabase ${config.target}...`);
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < transformedData.length; i += config.batchSize) {
      const batch = transformedData.slice(i, i + config.batchSize);
      
      const { data, error } = await supabase
        .from(config.target)
        .insert(batch);
      
      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i/config.batchSize) + 1} failed:`, error.message || error);
        errors.push({ batch: Math.floor(i/config.batchSize) + 1, error });
        failed += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(`\r  Progress: ${inserted}/${transformedData.length} records`);
      }
    }
    
    console.log('\n');
    
    // Verify total count
    const { count } = await supabase
      .from(config.target)
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Migration complete for ${config.name}`);
    console.log(`   Inserted: ${inserted} records`);
    console.log(`   Failed: ${failed} records`);
    console.log(`   Total in Supabase: ${count} records`);
    
    return { success: true, inserted, failed, total: count, errors };
    
  } catch (error) {
    console.error(`❌ Migration failed for ${config.name}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function migrate() {
  console.log('🚀 Executive & CEO Tables Migration');
  console.log('===================================\n');
  
  let mssqlPool;
  const results = [];
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Run migrations in order (smallest to largest)
    for (const config of migrations) {
      const result = await migrateTable(mssqlPool, config);
      results.push({ name: config.name, ...result });
    }
    
    // Final summary
    console.log('\n\n📊 FINAL MIGRATION SUMMARY');
    console.log('=' .repeat(50));
    
    let totalInserted = 0;
    let totalFailed = 0;
    
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      if (result.success) {
        console.log(`  ✅ Success - Inserted: ${result.inserted}, Failed: ${result.failed}, Total: ${result.total}`);
        totalInserted += result.inserted;
        totalFailed += result.failed;
      } else {
        console.log(`  ❌ Failed - Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 Total Records Migrated: ${totalInserted}`);
    console.log(`❌ Total Records Failed: ${totalFailed}`);
    
  } catch (error) {
    console.error('\n❌ Migration process failed:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run migration
migrate().catch(console.error);