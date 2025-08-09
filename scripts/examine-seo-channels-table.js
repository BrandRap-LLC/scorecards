#!/usr/bin/env node

/**
 * Examine MSSQL seo_channels table
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
    enableArithAbort: true
  }
};

async function examineSeoChannels() {
  console.log('🔍 Examining MSSQL seo_channels table');
  console.log('======================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get table schema
    console.log('📋 Table Schema:');
    console.log('----------------');
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
        WHERE TABLE_NAME = 'seo_channels'
        ORDER BY ORDINAL_POSITION
      `);
    
    schemaResult.recordset.forEach((col, index) => {
      let typeInfo = col.DATA_TYPE;
      if (col.CHARACTER_MAXIMUM_LENGTH) {
        typeInfo += `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})`;
      } else if (col.NUMERIC_PRECISION) {
        typeInfo += `(${col.NUMERIC_PRECISION}${col.NUMERIC_SCALE ? `,${col.NUMERIC_SCALE}` : ''})`;
      }
      
      console.log(`${index + 1}. ${col.COLUMN_NAME}`);
      console.log(`   Type: ${typeInfo}`);
      console.log(`   Nullable: ${col.IS_NULLABLE}`);
      console.log('');
    });
    
    // Get row count
    const countResult = await mssqlPool.request()
      .query('SELECT COUNT(*) as total FROM seo_channels');
    
    console.log(`📊 Total Records: ${countResult.recordset[0].total}\n`);
    
    // Get sample data
    console.log('📋 Sample Data (First 5 records):');
    console.log('----------------------------------');
    const sampleResult = await mssqlPool.request()
      .query('SELECT TOP 5 * FROM seo_channels ORDER BY clinic, month, traffic_source');
    
    sampleResult.recordset.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      Object.keys(record).forEach(key => {
        const value = record[key];
        console.log(`  ${key}: ${value === null ? 'NULL' : value}`);
      });
    });
    
    // Analyze data patterns
    console.log('\n\n📊 Data Analysis:');
    console.log('------------------');
    
    // Get unique clinics
    const clinicsResult = await mssqlPool.request()
      .query('SELECT DISTINCT clinic FROM seo_channels ORDER BY clinic');
    
    console.log(`\n✅ Unique Clinics (${clinicsResult.recordset.length}):`);
    clinicsResult.recordset.forEach(row => {
      console.log(`   - ${row.clinic}`);
    });
    
    // Get unique traffic sources
    const sourcesResult = await mssqlPool.request()
      .query('SELECT DISTINCT traffic_source FROM seo_channels ORDER BY traffic_source');
    
    console.log(`\n✅ Traffic Sources (${sourcesResult.recordset.length}):`);
    sourcesResult.recordset.forEach(row => {
      console.log(`   - ${row.traffic_source}`);
    });
    
    // Get date range
    const dateRangeResult = await mssqlPool.request()
      .query(`
        SELECT 
          MIN(CAST(month AS DATE)) as earliest_date,
          MAX(CAST(month AS DATE)) as latest_date,
          COUNT(DISTINCT month) as unique_months
        FROM seo_channels
      `);
    
    const dateRange = dateRangeResult.recordset[0];
    console.log(`\n📅 Date Range:`);
    console.log(`   Earliest: ${dateRange.earliest_date ? new Date(dateRange.earliest_date).toISOString().split('T')[0] : 'N/A'}`);
    console.log(`   Latest: ${dateRange.latest_date ? new Date(dateRange.latest_date).toISOString().split('T')[0] : 'N/A'}`);
    console.log(`   Unique Months: ${dateRange.unique_months}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run the examination
examineSeoChannels()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });