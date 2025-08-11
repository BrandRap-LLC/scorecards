#!/usr/bin/env node

/**
 * Final Migration Script - Handles existing tables by truncating them
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

// Simple truncate function
async function truncateTable(tableName) {
  console.log(`🗑️  Truncating ${tableName}...`);
  
  // First, delete all rows
  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .gte('id', 0); // Delete all rows with id >= 0
  
  if (deleteError) {
    console.log(`  ⚠️  Could not delete rows: ${deleteError.message}`);
    // Try alternative delete approach
    const { error: altDeleteError } = await supabase
      .from(tableName)
      .delete()
      .not('id', 'is', null); // Delete all rows where id is not null
    
    if (altDeleteError) {
      console.log(`  ❌ Failed to truncate table: ${altDeleteError.message}`);
      return false;
    }
  }
  
  console.log(`  ✅ Table truncated`);
  return true;
}

// Migration configurations - simplified to match actual table structures
const migrations = [
  {
    name: 'Executive Summary',
    source: 'executive_summary',
    target: 'executive_summary',
    expectedRows: 599,
    batchSize: 50,
    skipIfSchemaError: true,
    sampleFirst: true
  },
  {
    name: 'Executive Weekly Reports',
    source: 'executive_report_new_week',
    target: 'executive_weekly_reports',
    expectedRows: 2169,
    batchSize: 50,
    skipIfSchemaError: true,
    sampleFirst: true
  },
  {
    name: 'CEO Monthly Reports',
    source: 'ceo_report_full_month',
    target: 'ceo_monthly_reports',
    expectedRows: 6380,
    batchSize: 50,
    skipIfSchemaError: true,
    sampleFirst: true
  },
  {
    name: 'CEO Weekly Reports',
    source: 'ceo_report_full_week',
    target: 'ceo_weekly_reports',
    expectedRows: 27115,
    batchSize: 100,
    skipIfSchemaError: true,
    sampleFirst: true
  }
];

async function migrateTable(mssqlPool, config) {
  console.log(`\n🔄 Migrating ${config.name}`);
  console.log('=' .repeat(50));
  
  try {
    // Truncate target table
    await truncateTable(config.target);
    
    // Get data from MSSQL
    console.log(`📥 Fetching data from MSSQL ${config.source}...`);
    const dataResult = await mssqlPool.request()
      .query(`SELECT * FROM ${config.source}`);
    
    console.log(`📊 Found ${dataResult.recordset.length} records (expected: ${config.expectedRows})`);
    
    if (dataResult.recordset.length === 0) {
      console.log('⚠️  No data to migrate');
      return { success: true, inserted: 0, failed: 0 };
    }
    
    // If sampleFirst is true, try inserting just one record first
    if (config.sampleFirst && dataResult.recordset.length > 0) {
      console.log('\n🧪 Testing with single record first...');
      const testRecord = dataResult.recordset[0];
      
      // Clean the record - remove any undefined or null values
      const cleanedTestRecord = {};
      for (const [key, value] of Object.entries(testRecord)) {
        if (value !== undefined && value !== null) {
          cleanedTestRecord[key] = value;
        }
      }
      
      console.log('Test record keys:', Object.keys(cleanedTestRecord).join(', '));
      
      const { error: testError } = await supabase
        .from(config.target)
        .insert(cleanedTestRecord);
      
      if (testError) {
        console.log(`❌ Test insert failed: ${testError.message}`);
        console.log('\n⚠️  Table schema mismatch detected.');
        
        if (config.skipIfSchemaError) {
          console.log('📋 Skipping this table due to schema incompatibility.');
          console.log('💡 Please check table schema and update manually.');
          return { success: false, error: 'Schema mismatch', inserted: 0, failed: dataResult.recordset.length };
        }
      } else {
        console.log('✅ Test insert successful! Proceeding with full migration...');
        
        // Delete the test record
        await supabase
          .from(config.target)
          .delete()
          .gte('id', 0);
      }
    }
    
    // Insert data in batches
    console.log(`\n📤 Uploading to Supabase ${config.target}...`);
    let inserted = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < dataResult.recordset.length; i += config.batchSize) {
      const batch = dataResult.recordset.slice(i, i + config.batchSize);
      
      // Clean the batch - remove any undefined or null values
      const cleanedBatch = batch.map(record => {
        const cleaned = {};
        for (const [key, value] of Object.entries(record)) {
          if (value !== undefined) {
            cleaned[key] = value;
          }
        }
        return cleaned;
      });
      
      const { error } = await supabase
        .from(config.target)
        .insert(cleanedBatch);
      
      if (error) {
        const batchNum = Math.floor(i/config.batchSize) + 1;
        errors.push({ batch: batchNum, error: error.message });
        failed += batch.length;
        
        // If first batch fails, likely schema issue
        if (batchNum === 1) {
          console.error(`\n❌ First batch failed: ${error.message}`);
          if (config.skipIfSchemaError) {
            console.log('📋 Stopping migration for this table.');
            return { success: false, error: 'Schema mismatch', inserted: 0, failed: dataResult.recordset.length };
          }
        }
      } else {
        inserted += batch.length;
        process.stdout.write(`\r  Progress: ${inserted}/${dataResult.recordset.length} records`);
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
  console.log('🚀 Executive & CEO Tables Migration (Final Attempt)');
  console.log('==================================================\n');
  
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
      
      // Add delay between migrations
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
    let successfulTables = 0;
    let failedTables = 0;
    
    results.forEach(result => {
      console.log(`\n${result.name}:`);
      if (result.success) {
        console.log(`  ✅ Success - Inserted: ${result.inserted}, Failed: ${result.failed}, Total: ${result.total}`);
        totalInserted += result.inserted;
        totalFailed += result.failed;
        if (result.inserted > 0) successfulTables++;
      } else {
        console.log(`  ❌ Failed - Error: ${result.error}`);
        failedTables++;
      }
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`   Successful tables: ${successfulTables}`);
    console.log(`   Failed tables: ${failedTables}`);
    console.log(`   Total records migrated: ${totalInserted}`);
    console.log(`   Total records failed: ${totalFailed}`);
    
    if (failedTables > 0) {
      console.log('\n⚠️  Some tables failed to migrate due to schema mismatches.');
      console.log('💡 Please check the Supabase table schemas and ensure they match the MSSQL source.');
      console.log('📝 You may need to recreate the tables with the correct schema.');
    }
    
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