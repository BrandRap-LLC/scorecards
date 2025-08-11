#!/usr/bin/env node

/**
 * Fixed Migration Script: Migrate all executive and CEO tables from MSSQL to Supabase
 * Matches actual column names and table structures
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
    clearMethod: 'truncate',
    transform: (row) => ({
      clinic: row.clinic,
      month: row.month,
      traffic_source: row.traffic_source,
      total_appointments: row.total_appointments,
      new_appointments: row.new_appointments,
      returning_appointments: row.returning_appointments,
      avg_appointment_rev: row.avg_appointment_rev,
      appointment_est_revenue: row.appointment_est_revenue,
      new_appointment_est_6m_revenue: row.new_appointment_est_6m_revenue,
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
    expectedRows: 2169,
    batchSize: 100,
    clearMethod: 'truncate',
    transform: (row) => ({
      clinic: row.clinic,
      week: row.week,
      traffic_source: row.traffic_source,
      impressions: row.impressions,
      visits: row.visits,
      spend: row.spend,
      estimated_ltv_6m: row.estimated_ltv_6m,
      total_roas: row.total_roas,
      new_roas: row.new_roas,
      leads: row.leads,
      new_leads: row.new_leads,
      returning_leads: row.returning_leads,
      total_conversion: row['%total_conversion'],
      new_conversion: row['%new_conversion'],
      returning_conversion: row['%returning_conversion'],
      cac_total: row.cac_total,
      cac_new: row.cac_new,
      total_estimated_revenue: row.total_estimated_revenue,
      new_estimated_revenue: row.new_estimated_revenue,
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
    clearMethod: 'truncate',
    transform: (row) => ({
      company_name: row.Company_Name,
      month: row.month,
      month_number: row['month#'],
      year: row.year,
      field: row.field,
      metric: row.metric,
      trending_mth: row.trending_mth,
      workday_completed: row.workday_completed,
      total_workday: row.total_workday,
      metric_previous_month: row.metric_previous_month,
      metric_previous_year_month: row.metric_previous_year_month,
      trending_vs_prior_month: row.trending_vs_prior_month,
      trending_vs_prior_year_month: row.trending_vs_prior_year_month,
      goal: row.goal,
      trending_vs_goal: row.trending_vs_goal,
      rank: row.rank,
      final_field_name: row.final_field_name,
      format: row.format,
      descriptions: row.descriptions,
      formatted_metric: row.formatted_metric,
      formatted_trending_mth: row.formatted_trending_mth,
      formatted_metric_previous_month: row.formatted_metric_previous_month,
      formatted_metric_previous_year_month: row.formatted_metric_previous_year_month,
      formatted_trending_vs_prior_month: row.formatted_trending_vs_prior_month,
      formatted_trending_vs_prior_year_month: row.formatted_trending_vs_prior_year_month,
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
    clearMethod: 'truncate',
    transform: (row) => ({
      company_name: row.Company_Name,
      week: row.week,
      week_number: row['week#'],
      year: row.year,
      field: row.field,
      metric: row.metric,
      trending_week: row.trending_week,
      metric_previous_week: row.metric_previous_week,
      metric_previous_year_week: row.metric_previous_year_week,
      trending_vs_previous_week: row.trending_vs_previous_week,
      trending_vs_previous_year_week: row.trending_vs_previous_year_week,
      month: row.month,
      days_in_month: row.days_in_month,
      goal: row.goal,
      trending_vs_goal: row.trending_vs_goal,
      rank: row.rank,
      final_field_name: row.final_field_name,
      format: row.format,
      descriptions: row.descriptions,
      formatted_metric: row.formatted_metric,
      formatted_trending_week: row.formatted_trending_week,
      formatted_metric_previous_week: row.formatted_metric_previous_week,
      formatted_metric_previous_year_week: row.formatted_metric_previous_year_week,
      formatted_trending_vs_previous_week: row.formatted_trending_vs_previous_week,
      formatted_trending_vs_previous_year_week: row.formatted_trending_vs_previous_year_week,
      created_at: new Date().toISOString(),
      import_source: 'mssql_ceo_report_full_week'
    })
  }
];

async function clearTable(tableName, method = 'truncate') {
  console.log(`🗑️  Clearing existing data from ${tableName}...`);
  
  try {
    if (method === 'truncate') {
      // Use raw SQL to truncate table (faster and resets auto-increment)
      const { data, error } = await supabase.rpc('truncate_table', { table_name: tableName });
      
      if (error) {
        // If RPC doesn't exist, fall back to delete
        console.log(`  Falling back to DELETE method...`);
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .gte('created_at', '1900-01-01'); // Delete all rows with any created_at
        
        if (deleteError) {
          console.error(`⚠️  Error clearing table ${tableName}:`, deleteError.message);
          return false;
        }
      }
    }
    
    console.log(`✅ Table ${tableName} cleared`);
    return true;
  } catch (error) {
    console.error(`⚠️  Error clearing table ${tableName}:`, error.message);
    return false;
  }
}

async function migrateTable(mssqlPool, config) {
  console.log(`\n🔄 Migrating ${config.name}`);
  console.log('=' .repeat(50));
  
  try {
    // Clear existing data in target table
    const cleared = await clearTable(config.target, config.clearMethod);
    if (!cleared) {
      console.log(`⚠️  Continuing with migration despite clear error...`);
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
    
    // Show sample of transformed data
    console.log('\n📋 Sample transformed record:');
    const sample = transformedData[0];
    Object.entries(sample).slice(0, 5).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Insert data into Supabase in batches
    console.log(`\n📤 Uploading to Supabase ${config.target}...`);
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < transformedData.length; i += config.batchSize) {
      const batch = transformedData.slice(i, i + config.batchSize);
      
      const { data, error } = await supabase
        .from(config.target)
        .insert(batch);
      
      if (error) {
        const batchNum = Math.floor(i/config.batchSize) + 1;
        console.error(`\n❌ Batch ${batchNum} failed:`, error.message || error);
        errors.push({ batch: batchNum, error });
        failed += batch.length;
        
        // If it's a schema error, show the problematic column
        if (error.message && error.message.includes('column')) {
          console.log(`\n⚠️  Schema mismatch detected. First record of failed batch:`);
          console.log(JSON.stringify(batch[0], null, 2).substring(0, 500) + '...');
        }
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
      
      // Add a small delay between migrations
      if (config !== migrations[migrations.length - 1]) {
        console.log('\n⏳ Waiting 2 seconds before next migration...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
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
    console.log(`✨ Success Rate: ${((totalInserted / (totalInserted + totalFailed)) * 100).toFixed(1)}%`);
    
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
console.log('Starting migration in 3 seconds...\n');
setTimeout(() => {
  migrate().catch(console.error);
}, 3000);