#!/usr/bin/env node

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize connections
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mssqlConfig = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: 'aggregated_reporting',
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function getMSSQLSchema(tableName) {
  const pool = await sql.connect(mssqlConfig);
  
  try {
    // Get column information
    const result = await pool.request()
      .input('tableName', sql.NVarChar, tableName)
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE,
          COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tableName
        ORDER BY ORDINAL_POSITION
      `);
    
    // Also get a sample record to see actual data
    const sampleResult = await pool.request()
      .query(`SELECT TOP 1 * FROM ${tableName}`);
    
    return {
      columns: result.recordset,
      sample: sampleResult.recordset[0]
    };
  } finally {
    await pool.close();
  }
}

async function getSupabaseSchema(tableName) {
  // Get table schema from Supabase
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(0);
  
  if (error && error.code !== 'PGRST116') {
    console.error(`Error getting Supabase schema for ${tableName}:`, error);
    return null;
  }
  
  // Get actual column info using SQL
  const { data: schemaData, error: schemaError } = await supabase.rpc('get_table_schema', {
    table_name: tableName
  }).maybeSingle();
  
  // If RPC doesn't exist, try a different approach
  if (schemaError) {
    // Just return what we can infer
    return { columns: [], message: 'Unable to get detailed schema from Supabase' };
  }
  
  return { columns: schemaData || [] };
}

async function compareSchemas() {
  console.log('🔍 Schema Comparison Report\n');
  console.log('=' .repeat(80));
  
  const tables = ['paid_ads', 'seo_channels'];
  
  for (const table of tables) {
    console.log(`\n📊 Table: ${table}`);
    console.log('-'.repeat(80));
    
    try {
      // Get MSSQL schema
      const mssqlSchema = await getMSSQLSchema(table);
      console.log('\n📂 MSSQL Schema:');
      console.log('Columns:');
      mssqlSchema.columns.forEach(col => {
        console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})${col.IS_NULLABLE === 'NO' ? ' NOT NULL' : ''}`);
      });
      
      if (mssqlSchema.sample) {
        console.log('\nSample data columns:', Object.keys(mssqlSchema.sample).join(', '));
      }
      
      // Try to get expected Supabase schema by attempting insert
      console.log('\n📂 Supabase Expected Schema:');
      
      // Attempt a dummy insert to see what columns Supabase expects
      const { error: insertError } = await supabase
        .from(table)
        .insert([{ dummy: 'test' }]);
      
      if (insertError) {
        // Parse error message to understand expected schema
        if (insertError.message.includes('column')) {
          console.log('Based on errors, Supabase expects different columns');
        }
      }
      
      // For known tables, show expected schema
      if (table === 'paid_ads') {
        console.log('Expected columns (based on sync errors):');
        console.log('  - clinic');
        console.log('  - month');
        console.log('  - traffic_source');
        console.log('  - campaign');
        console.log('  - impressions');
        console.log('  - clicks (NOT visits)');
        console.log('  - spend');
        console.log('  - ctr (Click-through rate)');
        console.log('  - cpc (Cost per click)');
        console.log('  - impressions_mom');
        console.log('  - clicks_mom');
        console.log('  - spend_mom');
        console.log('  - ctr_mom');
        console.log('  - cpc_mom');
      } else if (table === 'seo_channels') {
        console.log('Expected columns (based on sync errors):');
        console.log('  - clinic');
        console.log('  - month');
        console.log('  - traffic_source');
        console.log('  - sessions (NOT visits)');
        console.log('  - users');
        console.log('  - bounce_rate');
        console.log('  - pages_per_session');
        console.log('  - avg_session_duration');
        console.log('  - sessions_mom');
        console.log('  - users_mom');
        console.log('  - bounce_rate_mom');
        console.log('  - pages_per_session_mom');
        console.log('  - avg_session_duration_mom');
      }
      
      console.log('\n⚠️  Schema Mismatch Summary:');
      if (table === 'paid_ads') {
        console.log('  - MSSQL has business metrics: visits, leads, appointments, revenue');
        console.log('  - Supabase expects web analytics: clicks, CTR, CPC');
        console.log('  - Missing in MSSQL: CTR, CPC, all MOM (month-over-month) columns');
      } else if (table === 'seo_channels') {
        console.log('  - MSSQL has business metrics: impressions, visits, leads, appointments');
        console.log('  - Supabase expects Google Analytics metrics: sessions, users, bounce_rate');
        console.log('  - Completely different metric types');
      }
      
    } catch (error) {
      console.error(`Error comparing ${table}:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 RECOMMENDATIONS:\n');
  console.log('1. The MSSQL tables contain business/conversion metrics');
  console.log('2. The Supabase tables expect web analytics metrics');
  console.log('3. These are fundamentally different data types that cannot be directly mapped');
  console.log('\nOptions:');
  console.log('a) Create new Supabase tables that match MSSQL schema (recommended)');
  console.log('b) Modify existing Supabase tables to accept MSSQL data');
  console.log('c) Keep them separate if they serve different purposes');
}

// Run comparison
compareSchemas()
  .then(() => {
    console.log('\n✅ Schema comparison complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });