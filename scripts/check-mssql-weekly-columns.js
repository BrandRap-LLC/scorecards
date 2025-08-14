#!/usr/bin/env node

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
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

async function checkMSSQLWeeklyColumns() {
  let pool;
  
  try {
    console.log('🔍 Checking MSSQL executive_report_new_week columns...\n');
    
    pool = await sql.connect(config);
    console.log('✅ Connected to MSSQL\n');
    
    // Get column information
    const result = await pool.request()
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'executive_report_new_week'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log('📊 Available columns in MSSQL executive_report_new_week:');
    console.log('=' .repeat(60));
    
    result.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME.padEnd(30)} (${col.DATA_TYPE})`);
    });
    
    // Get a sample record to see actual data
    console.log('\n📋 Sample record from MSSQL:');
    const sampleResult = await pool.request()
      .query(`
        SELECT TOP 1 *
        FROM executive_report_new_week
        WHERE clinic = 'advancedlifeclinic.com'
        ORDER BY week DESC
      `);
    
    if (sampleResult.recordset[0]) {
      const record = sampleResult.recordset[0];
      console.log('\nNon-null values in sample record:');
      Object.entries(record).forEach(([key, value]) => {
        if (value !== null && value !== 0) {
          console.log(`  ${key}: ${value}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

checkMSSQLWeeklyColumns();