#!/usr/bin/env node

/**
 * Simple MSSQL Connection Test
 * Tests with exact credentials and different password escaping
 */

const sql = require('mssql');

console.log('🔍 Testing MSSQL Connection with Different Password Formats\n');

// Try different password formats
const passwords = [
  'R#8kZ2w$tE1Q',           // Original
  'R#8kZ2w\\$tE1Q',         // Escaped dollar sign
  String.raw`R#8kZ2w$tE1Q`, // Raw string
];

async function testPassword(password, description) {
  console.log(`\nTesting: ${description}`);
  console.log(`Password format: ${password.replace(/./g, (c, i) => i < 4 ? c : '*')}`);
  
  const config = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: password,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000
    }
  };
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ SUCCESS! Connection established');
    
    // Test query
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✅ Query successful:', result.recordset);
    
    // Check for the table
    const tableResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%executive%'
    `);
    
    console.log('📊 Executive tables found:');
    tableResult.recordset.forEach(row => {
      console.log(`   - ${row.TABLE_NAME}`);
    });
    
    await pool.close();
    return true;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return false;
  }
}

async function runTests() {
  let success = false;
  
  for (let i = 0; i < passwords.length; i++) {
    const result = await testPassword(
      passwords[i], 
      i === 0 ? 'Original password' : 
      i === 1 ? 'Escaped dollar sign' : 
      'Raw string format'
    );
    if (result) {
      success = true;
      console.log('\n✅ Found working configuration!');
      break;
    }
  }
  
  if (!success) {
    console.log('\n❌ All password formats failed');
    console.log('\nPossible issues:');
    console.log('1. The password might have changed');
    console.log('2. The user might not exist');
    console.log('3. SQL Authentication might be disabled');
    console.log('4. The server might be blocking your IP');
    console.log('\n💡 Try using the Python MCP server instead:');
    console.log('   ./scripts/start-mcp-servers.sh start');
    console.log('   Then use the MCP tools to query the database');
  }
}

runTests().catch(console.error);