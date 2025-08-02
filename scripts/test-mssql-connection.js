#!/usr/bin/env node

/**
 * MSSQL Connection Test Script
 * Tests connection to MSSQL server with various configurations
 */

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 MSSQL Connection Diagnostics');
console.log('================================\n');

// Display configuration (hiding password)
console.log('📋 Configuration:');
console.log(`  Server: ${process.env.MSSQL_SERVER}`);
console.log(`  Port: ${process.env.MSSQL_PORT}`);
console.log(`  Database: ${process.env.MSSQL_DATABASE}`);
console.log(`  Username: ${process.env.MSSQL_USERNAME}`);
console.log(`  Password: ${process.env.MSSQL_PASSWORD ? '***' + process.env.MSSQL_PASSWORD.slice(-4) : 'NOT SET'}`);
console.log();

// Test configurations
const configs = [
  {
    name: 'Standard Connection',
    config: {
      server: process.env.MSSQL_SERVER,
      port: parseInt(process.env.MSSQL_PORT || '1433'),
      database: process.env.MSSQL_DATABASE,
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    }
  },
  {
    name: 'Without Encryption',
    config: {
      server: process.env.MSSQL_SERVER,
      port: parseInt(process.env.MSSQL_PORT || '1433'),
      database: process.env.MSSQL_DATABASE,
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    }
  },
  {
    name: 'With Authentication Type',
    config: {
      server: process.env.MSSQL_SERVER,
      port: parseInt(process.env.MSSQL_PORT || '1433'),
      database: process.env.MSSQL_DATABASE,
      user: process.env.MSSQL_USERNAME,
      password: process.env.MSSQL_PASSWORD,
      authentication: {
        type: 'default'
      },
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
      }
    }
  }
];

async function testConnection(name, config) {
  console.log(`\n🔄 Testing: ${name}`);
  console.log('  Configuration:', {
    ...config,
    password: '***hidden***'
  });
  
  try {
    const pool = await sql.connect(config);
    console.log('  ✅ Connection successful!');
    
    // Try to query something
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('  📊 SQL Server Version:', result.recordset[0].version.split('\n')[0]);
    
    // Check if database exists
    const dbCheck = await pool.request()
      .input('dbname', sql.NVarChar, process.env.MSSQL_DATABASE)
      .query('SELECT DB_ID(@dbname) as dbid');
    
    if (dbCheck.recordset[0].dbid) {
      console.log(`  ✅ Database '${process.env.MSSQL_DATABASE}' exists`);
      
      // Check if table exists
      const tableCheck = await pool.request()
        .query(`
          SELECT COUNT(*) as count 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = 'executive_report_new_month'
        `);
      
      if (tableCheck.recordset[0].count > 0) {
        console.log('  ✅ Table executive_report_new_month exists');
        
        // Get row count
        try {
          const countResult = await pool.request()
            .query('SELECT COUNT(*) as total FROM executive_report_new_month');
          console.log(`  📊 Table has ${countResult.recordset[0].total} rows`);
        } catch (err) {
          console.log('  ⚠️  Could not count rows:', err.message);
        }
      } else {
        console.log('  ❌ Table executive_report_new_month not found');
      }
    } else {
      console.log(`  ❌ Database '${process.env.MSSQL_DATABASE}' not found`);
    }
    
    await pool.close();
    return true;
  } catch (error) {
    console.log('  ❌ Connection failed:', error.message);
    if (error.code === 'ELOGIN') {
      console.log('  💡 Hint: Check username/password or SQL Server authentication mode');
    }
    if (error.code === 'ETIMEOUT') {
      console.log('  💡 Hint: Check server address, port, and firewall settings');
    }
    return false;
  }
}

async function runTests() {
  let successfulConfig = null;
  
  for (const { name, config } of configs) {
    const success = await testConnection(name, config);
    if (success && !successfulConfig) {
      successfulConfig = { name, config };
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (successfulConfig) {
    console.log('✅ Connection successful with:', successfulConfig.name);
    console.log('\n📝 Recommended configuration for your migration script:');
    console.log(JSON.stringify(successfulConfig.config, null, 2));
  } else {
    console.log('❌ All connection attempts failed');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify the MSSQL server is accessible from your network');
    console.log('2. Check if SQL Server Authentication is enabled (not just Windows Auth)');
    console.log('3. Verify the username and password are correct');
    console.log('4. Check firewall rules for port 1433');
    console.log('5. Ensure the user has permissions to the database');
    console.log('\n💡 You can also try connecting with a SQL client like:');
    console.log('   - Azure Data Studio');
    console.log('   - SQL Server Management Studio');
    console.log('   - DBeaver');
    console.log('   Using the same credentials to verify they work');
  }
}

// Run the tests
runTests().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});