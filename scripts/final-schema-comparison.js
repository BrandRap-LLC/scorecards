#!/usr/bin/env node

/**
 * Final comparison to ensure no columns are missing
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

async function compareSchemas() {
  console.log('🔍 Final Schema Comparison: MSSQL vs Supabase');
  console.log('============================================\n');
  
  let mssqlPool;
  const pgClient = new Client(pgConfig);
  
  try {
    // Connect to both databases
    console.log('📡 Connecting to databases...');
    mssqlPool = await sql.connect(mssqlConfig);
    await pgClient.connect();
    console.log('✅ Connected to both databases\n');
    
    // Get MSSQL columns
    console.log('📋 Fetching MSSQL columns...');
    const mssqlResult = await mssqlPool.request()
      .query(`
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'executive_report_new_month'
        ORDER BY ORDINAL_POSITION
      `);
    
    const mssqlColumns = mssqlResult.recordset.map(col => ({
      name: col.COLUMN_NAME,
      type: col.DATA_TYPE
    }));
    
    console.log(`  Found ${mssqlColumns.length} columns in MSSQL\n`);
    
    // Get Supabase columns
    console.log('📋 Fetching Supabase columns...');
    const supabaseResult = await pgClient.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'executive_monthly_reports' 
      ORDER BY ordinal_position
    `);
    
    const supabaseColumns = supabaseResult.rows.map(col => ({
      name: col.column_name,
      type: col.data_type
    }));
    
    console.log(`  Found ${supabaseColumns.length} columns in Supabase\n`);
    
    // Compare columns
    console.log('📊 Column Comparison:');
    console.log('====================\n');
    
    // Find columns in MSSQL but not in Supabase
    const supabaseColumnNames = supabaseColumns.map(c => c.name.toLowerCase());
    const missingInSupabase = mssqlColumns.filter(mssqlCol => {
      const mssqlColName = mssqlCol.name.toLowerCase();
      
      // Handle special mappings
      const mappings = {
        '%total_conversion': 'total_conversion',
        '%new_conversion': 'new_conversion'
      };
      
      const mappedName = mappings[mssqlColName] || mssqlColName;
      
      // Check if column exists in Supabase (either directly or mapped)
      return !supabaseColumnNames.includes(mappedName) && 
             !supabaseColumnNames.includes(mssqlColName);
    });
    
    if (missingInSupabase.length > 0) {
      console.log('❌ Columns in MSSQL but NOT in Supabase:');
      missingInSupabase.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    } else {
      console.log('✅ All MSSQL columns exist in Supabase!');
    }
    
    // Find columns in Supabase but not in MSSQL (extra columns)
    console.log('\n📋 Extra columns in Supabase (not from MSSQL):');
    const mssqlColumnNames = mssqlColumns.map(c => c.name.toLowerCase());
    const extraInSupabase = supabaseColumns.filter(supCol => {
      const supColName = supCol.name.toLowerCase();
      
      // Skip system columns
      if (['id', 'created_at', 'import_source'].includes(supColName)) {
        return false;
      }
      
      // Check mappings
      const reverseMappings = {
        'total_conversion': '%total_conversion',
        'new_conversion': '%new_conversion',
        'conversion_rate': '%total_conversion',  // Also mapped
        'roas': 'total_roas'  // Duplicate mapping
      };
      
      const originalName = reverseMappings[supColName];
      
      return !mssqlColumnNames.includes(supColName) && 
             (!originalName || !mssqlColumnNames.includes(originalName));
    });
    
    if (extraInSupabase.length > 0) {
      extraInSupabase.forEach(col => {
        console.log(`   - ${col.name} (${col.type})`);
      });
    } else {
      console.log('   (None - only system columns)');
    }
    
    // Show mapping summary
    console.log('\n📌 Column Mappings:');
    console.log('   MSSQL "%total_conversion" → Supabase "total_conversion"');
    console.log('   MSSQL "%new_conversion" → Supabase "new_conversion"');
    console.log('   MSSQL "total_roas" → Supabase "roas" (backward compatibility)');
    console.log('   MSSQL "total_roas" → Supabase "total_roas" (new column)');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   MSSQL columns: ${mssqlColumns.length}`);
    console.log(`   Supabase columns: ${supabaseColumns.length}`);
    console.log(`   Missing in Supabase: ${missingInSupabase.length}`);
    console.log(`   System/extra columns in Supabase: ${supabaseColumns.length - mssqlColumns.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) await mssqlPool.close();
    await pgClient.end();
    console.log('\n🔌 Disconnected from databases');
  }
}

compareSchemas();