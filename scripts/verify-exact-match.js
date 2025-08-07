#!/usr/bin/env node

/**
 * Verify exact schema match between MSSQL and Supabase
 */

const sql = require('mssql');
const { Client } = require('pg');
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
    connectTimeout: 30000
  }
};

// PostgreSQL configuration
const pgConfig = {
  host: 'db.igzswopyyggvelncjmuh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'CPRREPORT1!',
  ssl: { rejectUnauthorized: false }
};

async function verifyExactMatch() {
  console.log('✅ Verifying Exact Schema Match');
  console.log('================================\n');
  
  let mssqlPool;
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to both databases
    console.log('📡 Connecting to databases...');
    mssqlPool = await sql.connect(mssqlConfig);
    await pgClient.connect();
    console.log('✅ Connected to both\n');
    
    // Get MSSQL columns
    const mssqlResult = await mssqlPool.request()
      .query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'executive_report_new_month'
        ORDER BY ORDINAL_POSITION
      `);
    
    const mssqlColumns = mssqlResult.recordset.map(col => col.COLUMN_NAME.toLowerCase());
    
    // Get Supabase columns (excluding system columns)
    const supabaseResult = await pgClient.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
      AND column_name NOT IN ('id', 'created_at', 'import_source')
      ORDER BY ordinal_position
    `);
    
    const supabaseColumns = supabaseResult.rows.map(col => col.column_name.toLowerCase());
    
    console.log('📊 Column Count:');
    console.log(`  MSSQL: ${mssqlColumns.length} business columns`);
    console.log(`  Supabase: ${supabaseColumns.length} business columns (excluding system)\n`);
    
    // Create mapping for special cases
    const columnMappings = {
      '%total_conversion': 'total_conversion',
      '%new_conversion': 'new_conversion'
    };
    
    // Check each MSSQL column exists in Supabase
    console.log('📋 Checking MSSQL → Supabase:');
    let allMatch = true;
    
    mssqlColumns.forEach(mssqlCol => {
      const supabaseCol = columnMappings[mssqlCol] || mssqlCol;
      if (!supabaseColumns.includes(supabaseCol)) {
        console.log(`  ❌ Missing: ${mssqlCol}`);
        allMatch = false;
      }
    });
    
    if (allMatch) {
      console.log('  ✅ All MSSQL columns exist in Supabase!');
    }
    
    // Check for extra columns in Supabase
    console.log('\n📋 Checking for extra columns in Supabase:');
    const reverseMapping = {
      'total_conversion': '%total_conversion',
      'new_conversion': '%new_conversion'
    };
    
    const extraColumns = supabaseColumns.filter(supCol => {
      const originalName = reverseMapping[supCol] || supCol;
      return !mssqlColumns.includes(originalName) && !mssqlColumns.includes(supCol);
    });
    
    if (extraColumns.length > 0) {
      console.log('  ❌ Extra columns found:');
      extraColumns.forEach(col => console.log(`    - ${col}`));
    } else {
      console.log('  ✅ No extra columns!');
    }
    
    // Final verdict
    console.log('\n📊 Final Verdict:');
    if (allMatch && extraColumns.length === 0) {
      console.log('  ✅ PERFECT MATCH! Supabase schema exactly matches MSSQL');
      console.log('     (except for system columns: id, created_at, import_source)');
    } else {
      console.log('  ❌ Schema mismatch detected');
    }
    
    // Show the mappings
    console.log('\n📌 Special Column Mappings:');
    console.log('  MSSQL "%total_conversion" → Supabase "total_conversion"');
    console.log('  MSSQL "%new_conversion" → Supabase "new_conversion"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) await mssqlPool.close();
    await pgClient.end();
    console.log('\n🔌 Disconnected from databases');
  }
}

verifyExactMatch();