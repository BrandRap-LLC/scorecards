#!/usr/bin/env node

/**
 * Check MSSQL executive_report_new_week table structure
 */

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

// Database configuration
const mssqlConfig = {
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  server: '54.245.209.65',
  database: 'aggregated_reporting',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function checkWeeklyTable() {
  console.log('🔍 Checking MSSQL executive_report_new_week table');
  console.log('=' .repeat(60));
  
  let pool;
  
  try {
    // Connect to MSSQL
    console.log('\n📡 Connecting to MSSQL...');
    pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Get count
    console.log('\n📊 Checking table data...');
    const countResult = await pool.request()
      .query('SELECT COUNT(*) as total FROM executive_report_new_week');
    
    console.log(`Total records: ${countResult.recordset[0].total}`);
    
    // Get sample record to see structure
    console.log('\n📋 Sample record structure:');
    const sampleResult = await pool.request()
      .query('SELECT TOP 1 * FROM executive_report_new_week ORDER BY week DESC');
    
    if (sampleResult.recordset.length > 0) {
      const sample = sampleResult.recordset[0];
      console.log('\nColumns found:');
      Object.keys(sample).forEach(col => {
        console.log(`  - ${col}: ${typeof sample[col]} (${sample[col]})`);
      });
      
      // Get unique values for key fields
      console.log('\n📈 Unique values:');
      
      // Clinics
      const clinicsResult = await pool.request()
        .query('SELECT DISTINCT clinic FROM executive_report_new_week ORDER BY clinic');
      console.log(`\nClinics (${clinicsResult.recordset.length}):`);
      clinicsResult.recordset.forEach(row => console.log(`  - ${row.clinic}`));
      
      // Date range
      const dateRangeResult = await pool.request()
        .query('SELECT MIN(week) as min_week, MAX(week) as max_week FROM executive_report_new_week');
      console.log(`\nDate range: ${dateRangeResult.recordset[0].min_week} to ${dateRangeResult.recordset[0].max_week}`);
      
      // Traffic sources
      const sourcesResult = await pool.request()
        .query('SELECT DISTINCT traffic_source FROM executive_report_new_week ORDER BY traffic_source');
      console.log(`\nTraffic sources (${sourcesResult.recordset.length}):`);
      sourcesResult.recordset.forEach(row => console.log(`  - ${row.traffic_source}`));
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    if (pool) {
      await pool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

checkWeeklyTable();