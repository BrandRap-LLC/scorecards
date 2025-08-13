#!/usr/bin/env node

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing MSSQL Connection...');
  console.log('Server:', process.env.MSSQL_SERVER);
  console.log('Username:', process.env.MSSQL_USERNAME);
  console.log('Password length:', process.env.MSSQL_PASSWORD ? process.env.MSSQL_PASSWORD.length : 0);
  
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
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Successfully connected to MSSQL!');
    
    // Test query
    const result = await pool.request().query('SELECT TOP 1 * FROM executive_report_new_month');
    console.log('✅ Test query successful!');
    console.log('Sample record:', result.recordset[0] ? 'Found' : 'No records');
    
    await pool.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Try with hardcoded password to see if it's an escaping issue
    console.log('\nTrying with hardcoded password...');
    config.password = 'R#8kZ2w$tE1Q';
    
    try {
      const pool = await sql.connect(config);
      console.log('✅ Connected with hardcoded password!');
      console.log('This suggests an issue with .env.local password escaping');
      await pool.close();
    } catch (error2) {
      console.error('❌ Still failed with hardcoded password:', error2.message);
    }
  }
}

testConnection().catch(console.error);