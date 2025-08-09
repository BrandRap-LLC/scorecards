#!/usr/bin/env node

/**
 * Examine MSSQL seo_hightlights_keyword_page_one table in reporting database
 */

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

// MSSQL configuration - using reporting database
const mssqlConfig = {
  server: '54.245.209.65',
  port: 1433,
  database: 'reporting',  // Changed to reporting database
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function examineSeoHighlights() {
  console.log('🔍 Examining MSSQL seo_hightlights_keyword_page_one table in reporting database');
  console.log('==============================================================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL (reporting database)...');
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
        WHERE TABLE_NAME = 'seo_hightlights_keyword_page_one'
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
      .query('SELECT COUNT(*) as total FROM seo_hightlights_keyword_page_one');
    
    console.log(`📊 Total Records: ${countResult.recordset[0].total}\n`);
    
    // Get sample data
    console.log('📋 Sample Data (First 10 records):');
    console.log('-----------------------------------');
    const sampleResult = await mssqlPool.request()
      .query('SELECT TOP 10 * FROM seo_hightlights_keyword_page_one ORDER BY Company_Name, query');
    
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
      .query('SELECT DISTINCT Company_Name FROM seo_hightlights_keyword_page_one ORDER BY Company_Name');
    
    console.log(`\n✅ Unique Companies (${clinicsResult.recordset.length}):`);
    clinicsResult.recordset.forEach(row => {
      console.log(`   - ${row.Company_Name}`);
    });
    
    // Get date range if there's a date/month column
    try {
      const dateColumns = schemaResult.recordset
        .filter(col => col.DATA_TYPE.includes('date') || col.DATA_TYPE.includes('time'))
        .map(col => col.COLUMN_NAME);
      
      if (dateColumns.length > 0) {
        const dateColumn = dateColumns[0];
        const dateRangeResult = await mssqlPool.request()
          .query(`
            SELECT 
              MIN(CAST(${dateColumn} AS DATE)) as earliest_date,
              MAX(CAST(${dateColumn} AS DATE)) as latest_date,
              COUNT(DISTINCT ${dateColumn}) as unique_dates
            FROM seo_hightlights_keyword_page_one
          `);
        
        const dateRange = dateRangeResult.recordset[0];
        console.log(`\n📅 Date Range (${dateColumn}):`);
        console.log(`   Earliest: ${dateRange.earliest_date ? new Date(dateRange.earliest_date).toISOString().split('T')[0] : 'N/A'}`);
        console.log(`   Latest: ${dateRange.latest_date ? new Date(dateRange.latest_date).toISOString().split('T')[0] : 'N/A'}`);
        console.log(`   Unique Dates: ${dateRange.unique_dates}`);
      }
    } catch (e) {
      // Date analysis failed, skip it
    }
    
    // Get sample keywords
    console.log('\n🔍 Sample Queries (Top 20):');
    const keywordsResult = await mssqlPool.request()
      .query('SELECT TOP 20 DISTINCT query FROM seo_hightlights_keyword_page_one ORDER BY query');
    
    keywordsResult.recordset.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.query}`);
    });
    
    // Check for position/ranking data
    const positionColumns = schemaResult.recordset
      .filter(col => col.COLUMN_NAME.toLowerCase().includes('position') || 
                     col.COLUMN_NAME.toLowerCase().includes('rank'))
      .map(col => col.COLUMN_NAME);
    
    if (positionColumns.length > 0) {
      console.log(`\n📈 Position/Ranking Columns Found:`);
      for (const colName of positionColumns) {
        const statsResult = await mssqlPool.request()
          .query(`
            SELECT 
              MIN(${colName}) as min_value,
              MAX(${colName}) as max_value,
              AVG(${colName}) as avg_value
            FROM seo_hightlights_keyword_page_one
            WHERE ${colName} IS NOT NULL
          `);
        
        const stats = statsResult.recordset[0];
        console.log(`   ${colName}:`);
        console.log(`     Min: ${stats.min_value}, Max: ${stats.max_value}, Avg: ${stats.avg_value?.toFixed(2)}`);
      }
    }
    
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
examineSeoHighlights()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });