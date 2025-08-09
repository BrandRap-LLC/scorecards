#!/usr/bin/env node

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

async function checkPaidAdsColumns() {
  console.log('🔍 Checking MSSQL paid_ads table for leads columns\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get column information
    const result = await mssqlPool.request()
      .query(`
        SELECT COLUMN_NAME, DATA_TYPE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'paid_ads'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log('📋 Columns in MSSQL paid_ads table:');
    result.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    // Check if leads columns exist
    console.log('\n🔎 Checking for leads columns:');
    const leadsColumns = ['leads', 'new_leads', 'returning_leads', 'total_leads'];
    const existingLeadsColumns = result.recordset
      .filter(col => leadsColumns.some(lead => col.COLUMN_NAME.toLowerCase().includes(lead)))
      .map(col => col.COLUMN_NAME);
    
    if (existingLeadsColumns.length > 0) {
      console.log('✅ Found leads columns:', existingLeadsColumns.join(', '));
    } else {
      console.log('❌ No leads columns found in paid_ads table');
    }
    
    // Get a sample record to see the data
    const sampleResult = await mssqlPool.request()
      .query('SELECT TOP 1 * FROM paid_ads WHERE month = (SELECT MAX(month) FROM paid_ads)');
    
    if (sampleResult.recordset.length > 0) {
      console.log('\n📊 Sample record:');
      const record = sampleResult.recordset[0];
      Object.keys(record).forEach(key => {
        if (key.toLowerCase().includes('lead') || key.toLowerCase().includes('appointment')) {
          console.log(`  ${key}: ${record[key]}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

checkPaidAdsColumns();