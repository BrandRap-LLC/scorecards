#!/usr/bin/env node

/**
 * Direct Migration - Insert MSSQL data directly without transformation
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

const migrations = [
  {
    name: 'Executive Summary',
    source: 'executive_summary',
    target: 'executive_summary',
    expectedRows: 599,
    batchSize: 50
  },
  {
    name: 'Executive Weekly Reports',
    source: 'executive_report_new_week',
    target: 'executive_weekly_reports',
    expectedRows: 2169,
    batchSize: 50
  },
  {
    name: 'CEO Monthly Reports',
    source: 'ceo_report_full_month',
    target: 'ceo_monthly_reports',
    expectedRows: 6380,
    batchSize: 100
  },
  {
    name: 'CEO Weekly Reports',
    source: 'ceo_report_full_week',
    target: 'ceo_weekly_reports',
    expectedRows: 27115,
    batchSize: 200
  }
];

async function migrateTable(mssqlPool, config) {
  console.log(`\n🔄 Migrating ${config.name}`);
  console.log('=' .repeat(50));
  
  try {
    // Get data from MSSQL
    console.log(`📥 Fetching data from MSSQL ${config.source}...`);
    const dataResult = await mssqlPool.request()
      .query(`SELECT * FROM ${config.source}`);
    
    console.log(`📊 Found ${dataResult.recordset.length} records`);
    
    if (dataResult.recordset.length === 0) {
      console.log('⚠️  No data to migrate');
      return { success: true, inserted: 0, failed: 0 };
    }
    
    // Insert data directly without transformation
    console.log(`📤 Uploading to Supabase ${config.target}...`);
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < dataResult.recordset.length; i += config.batchSize) {
      const batch = dataResult.recordset.slice(i, i + config.batchSize);
      
      const { error } = await supabase
        .from(config.target)
        .insert(batch);
      
      if (error) {
        console.error(`\n❌ Batch ${Math.floor(i/config.batchSize) + 1} failed:`, error.message);
        failed += batch.length;
      } else {
        inserted += batch.length;
        process.stdout.write(`\r  Progress: ${inserted}/${dataResult.recordset.length} records`);
      }
    }
    
    console.log('\n');
    
    // Verify count
    const { count } = await supabase
      .from(config.target)
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Migration complete`);
    console.log(`   Inserted: ${inserted} records`);
    console.log(`   Failed: ${failed} records`);
    console.log(`   Total in Supabase: ${count} records`);
    
    return { success: true, inserted, failed, total: count };
    
  } catch (error) {
    console.error(`❌ Migration failed:`, error.message);
    return { success: false, error: error.message };
  }
}

async function migrate() {
  console.log('🚀 Direct Migration from MSSQL to Supabase');
  console.log('==========================================\n');
  
  console.log('⚠️  IMPORTANT: This migration assumes tables exist with matching column names.');
  console.log('📝 Run the SQL script in create-tables-sql.sql first!\n');
  
  let mssqlPool;
  const results = [];
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Run migrations
    for (const config of migrations) {
      const result = await migrateTable(mssqlPool, config);
      results.push({ name: config.name, ...result });
      
      if (config !== migrations[migrations.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Summary
    console.log('\n\n📊 MIGRATION SUMMARY');
    console.log('=' .repeat(50));
    
    let totalInserted = 0;
    let totalFailed = 0;
    
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      if (result.success) {
        console.log(`  ✅ Inserted: ${result.inserted}, Failed: ${result.failed}`);
        totalInserted += result.inserted;
        totalFailed += result.failed;
      } else {
        console.log(`  ❌ Error: ${result.error}`);
      }
    });
    
    console.log(`\n📈 Total Records Migrated: ${totalInserted}`);
    console.log(`❌ Total Records Failed: ${totalFailed}`);
    
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