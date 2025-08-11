#!/usr/bin/env node

/**
 * Check table schemas in both MSSQL and Supabase
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

async function checkSchemas() {
  console.log('🔍 Checking Table Schemas');
  console.log('========================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Tables to check
    const tables = [
      { mssql: 'executive_summary', supabase: 'executive_summary' },
      { mssql: 'executive_report_new_week', supabase: 'executive_weekly_reports' },
      { mssql: 'ceo_report_full_month', supabase: 'ceo_monthly_reports' },
      { mssql: 'ceo_report_full_week', supabase: 'ceo_weekly_reports' }
    ];
    
    for (const table of tables) {
      console.log(`\n📊 ${table.mssql} → ${table.supabase}`);
      console.log('-'.repeat(50));
      
      // Get MSSQL schema
      console.log('\nMSSQL Schema:');
      const mssqlSchema = await mssqlPool.request()
        .query(`
          SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_NAME = '${table.mssql}'
          ORDER BY ORDINAL_POSITION
        `);
      
      if (mssqlSchema.recordset.length > 0) {
        mssqlSchema.recordset.forEach(col => {
          console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      } else {
        console.log('  ❌ Table not found or no columns');
      }
      
      // Get row count from MSSQL
      const countResult = await mssqlPool.request()
        .query(`SELECT COUNT(*) as count FROM ${table.mssql}`);
      console.log(`  Total rows: ${countResult.recordset[0].count}`);
      
      // Check if table exists in Supabase
      console.log(`\nSupabase Table (${table.supabase}):`);
      const { data: sample, error } = await supabase
        .from(table.supabase)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
      } else {
        console.log('  ✅ Table exists');
        
        // Get count
        const { count } = await supabase
          .from(table.supabase)
          .select('*', { count: 'exact', head: true });
        console.log(`  Current rows: ${count || 0}`);
      }
    }
    
    // Get sample data from executive_report_new_week to see actual columns
    console.log('\n\n📋 Sample Data from executive_report_new_week:');
    const sampleData = await mssqlPool.request()
      .query('SELECT TOP 1 * FROM executive_report_new_week');
    
    if (sampleData.recordset.length > 0) {
      console.log('Columns found:');
      Object.keys(sampleData.recordset[0]).forEach(key => {
        console.log(`  - ${key}: ${typeof sampleData.recordset[0][key]} (value: ${sampleData.recordset[0][key]})`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run check
checkSchemas().catch(console.error);