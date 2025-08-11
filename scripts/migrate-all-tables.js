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
  server: process.env.MSSQL_SERVER || '54.245.209.65',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE || 'aggregated_reporting',
  user: process.env.MSSQL_USERNAME || 'supabase',
  password: process.env.MSSQL_PASSWORD || 'R#8kZ2w$tE1Q',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 300000 // 5 minutes for large queries
  }
};

// Tables to migrate
const MIGRATION_CONFIG = [
  {
    source: 'executive_report_new_week',
    target: 'executive_weekly_reports',
    batchSize: 500,
    priority: 'high',
    description: 'Weekly executive metrics (2,170 rows)'
  },
  {
    source: 'executive_summary',
    target: 'executive_summary',
    batchSize: 500,
    priority: 'medium',
    description: 'Executive summary data (599 rows)'
  },
  {
    source: 'executive_summary_raw',
    target: 'executive_summary_raw',
    batchSize: 500,
    priority: 'low',
    description: 'Raw executive summary data (688 rows)'
  },
  {
    source: 'ceo_report_full_week',
    target: 'ceo_weekly_reports',
    batchSize: 1000,
    priority: 'medium',
    description: 'CEO weekly reports (27,115 rows)'
  },
  {
    source: 'ceo_report_full_month',
    target: 'ceo_monthly_reports',
    batchSize: 1000,
    priority: 'medium',
    description: 'CEO monthly reports (6,380 rows)'
  },
  {
    source: 'marketing_score_card_daily',
    target: 'marketing_scorecard_daily',
    batchSize: 1000,
    priority: 'low',
    description: 'Daily marketing scorecard (56,079 rows)'
  },
  {
    source: 'score_card_keyword_summary',
    target: 'scorecard_keyword_summary',
    batchSize: 1000,
    priority: 'low',
    description: 'Keyword summary scorecard (161,055 rows)'
  }
];

async function createSupabaseTable(tableName, columns) {
  console.log(`📋 Creating table ${tableName} in Supabase...`);
  
  // Build CREATE TABLE statement
  const columnDefs = columns.map(col => {
    let sqlType = 'text';
    if (col.DATA_TYPE === 'float') sqlType = 'numeric';
    else if (col.DATA_TYPE === 'int') sqlType = 'integer';
    else if (col.DATA_TYPE === 'datetime') sqlType = 'timestamp';
    else if (col.DATA_TYPE === 'bit') sqlType = 'boolean';
    
    const nullable = col.IS_NULLABLE === 'YES' ? '' : ' NOT NULL';
    return `${col.COLUMN_NAME} ${sqlType}${nullable}`;
  }).join(',\n  ');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ${columnDefs}
    );
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });
    
    if (error && !error.message.includes('already exists')) {
      throw error;
    }
    
    console.log(`✅ Table ${tableName} ready`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create table ${tableName}:`, error.message);
    return false;
  }
}

async function migrateTable(config, mssqlPool) {
  console.log(`\n🚀 Migrating ${config.source} → ${config.target}`);
  console.log(`   ${config.description}`);
  
  try {
    // Get table schema from MSSQL
    const schemaResult = await mssqlPool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${config.source}'
      ORDER BY ORDINAL_POSITION
    `);
    
    if (schemaResult.recordset.length === 0) {
      console.log(`❌ Table ${config.source} not found in MSSQL`);
      return { success: false, error: 'Table not found' };
    }
    
    // Create table in Supabase if it doesn't exist
    await createSupabaseTable(config.target, schemaResult.recordset);
    
    // Get total row count
    const countResult = await mssqlPool.request().query(
      `SELECT COUNT(*) as total FROM ${config.source}`
    );
    const totalRows = countResult.recordset[0].total;
    console.log(`📊 Total rows to migrate: ${totalRows}`);
    
    // Clear existing data in target table
    console.log(`🧹 Clearing existing data in ${config.target}...`);
    const { error: deleteError } = await supabase
      .from(config.target)
      .delete()
      .neq('clinic', ''); // Delete all rows
    
    if (deleteError && !deleteError.message.includes('no rows')) {
      console.error(`❌ Failed to clear table: ${deleteError.message}`);
    }
    
    // Migrate data in batches
    let offset = 0;
    let migratedRows = 0;
    
    while (offset < totalRows) {
      const result = await mssqlPool.request().query(`
        SELECT * FROM ${config.source}
        ORDER BY (SELECT NULL)
        OFFSET ${offset} ROWS
        FETCH NEXT ${config.batchSize} ROWS ONLY
      `);
      
      if (result.recordset.length === 0) break;
      
      // Insert batch into Supabase
      const { error } = await supabase
        .from(config.target)
        .insert(result.recordset);
      
      if (error) {
        console.error(`❌ Error inserting batch at offset ${offset}:`, error.message);
        return { success: false, error: error.message, migratedRows };
      }
      
      migratedRows += result.recordset.length;
      offset += config.batchSize;
      
      // Progress update
      const progress = Math.round((migratedRows / totalRows) * 100);
      process.stdout.write(`\r   Progress: ${progress}% (${migratedRows}/${totalRows} rows)`);
    }
    
    console.log(`\n✅ Successfully migrated ${migratedRows} rows`);
    
    // Verify migration
    const { count } = await supabase
      .from(config.target)
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Verified: ${count} rows in Supabase table ${config.target}`);
    
    return { success: true, migratedRows, verifiedRows: count };
    
  } catch (error) {
    console.error(`\n❌ Migration failed for ${config.source}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔄 Starting comprehensive MSSQL to Supabase migration');
  console.log('=' . repeat(50));
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('\n🔗 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Sort tables by priority
    const sortedTables = MIGRATION_CONFIG.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Migration summary
    const results = [];
    
    // Migrate each table
    for (const config of sortedTables) {
      const result = await migrateTable(config, mssqlPool);
      results.push({
        ...config,
        ...result
      });
    }
    
    // Print summary
    console.log('\n\n📊 Migration Summary');
    console.log('=' . repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`\n✅ Successful migrations: ${successful.length}`);
    successful.forEach(r => {
      console.log(`   - ${r.source} → ${r.target}: ${r.migratedRows} rows`);
    });
    
    if (failed.length > 0) {
      console.log(`\n❌ Failed migrations: ${failed.length}`);
      failed.forEach(r => {
        console.log(`   - ${r.source}: ${r.error}`);
      });
    }
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

// Handle missing RPC function
async function setupRPCFunction() {
  console.log('📋 Setting up RPC function for dynamic SQL...');
  
  const { error } = await supabase.rpc('create_exec_sql_function', {});
  
  if (error && !error.message.includes('already exists')) {
    console.log('⚠️  Note: You may need to create the exec_sql function manually in Supabase');
    console.log('   Run this SQL in Supabase SQL Editor:');
    console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
  }
}

// Run migration
main().catch(console.error);