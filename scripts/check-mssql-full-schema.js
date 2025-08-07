#!/usr/bin/env node

/**
 * Check full MSSQL schema for executive_report_new_month table
 */

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

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

async function checkSchema() {
  console.log('🔍 Checking MSSQL Schema for executive_report_new_month');
  console.log('======================================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get column information
    console.log('📋 Fetching column information...');
    const schemaResult = await mssqlPool.request()
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          NUMERIC_PRECISION,
          NUMERIC_SCALE,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'executive_report_new_month'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log(`\n📊 Total columns: ${schemaResult.recordset.length}\n`);
    console.log('Column Details:');
    console.log('===============\n');
    
    schemaResult.recordset.forEach((col, index) => {
      console.log(`${index + 1}. ${col.COLUMN_NAME}`);
      console.log(`   Type: ${col.DATA_TYPE}`);
      if (col.CHARACTER_MAXIMUM_LENGTH) {
        console.log(`   Max Length: ${col.CHARACTER_MAXIMUM_LENGTH}`);
      }
      if (col.NUMERIC_PRECISION) {
        console.log(`   Precision: ${col.NUMERIC_PRECISION}, Scale: ${col.NUMERIC_SCALE}`);
      }
      console.log(`   Nullable: ${col.IS_NULLABLE}`);
      console.log('');
    });
    
    // Get sample data to understand the content
    console.log('\n📊 Sample data (first row):');
    const sampleResult = await mssqlPool.request()
      .query('SELECT TOP 1 * FROM executive_report_new_month ORDER BY month DESC');
    
    if (sampleResult.recordset.length > 0) {
      const sample = sampleResult.recordset[0];
      Object.keys(sample).forEach(key => {
        console.log(`  ${key}: ${sample[key]}`);
      });
    }
    
    // Get row count
    const countResult = await mssqlPool.request()
      .query('SELECT COUNT(*) as total FROM executive_report_new_month');
    console.log(`\n📊 Total rows in MSSQL: ${countResult.recordset[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

checkSchema();