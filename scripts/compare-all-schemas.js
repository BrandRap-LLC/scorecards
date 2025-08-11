#!/usr/bin/env node

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mssqlConfig = {
  server: '54.245.209.65',
  port: 1433,
  database: 'aggregated_reporting',
  user: 'supabase',
  password: 'R#8kZ2w$tE1Q',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function getTableSchema(pool, tableName) {
  const result = await pool.request().query(`
    SELECT 
      COLUMN_NAME,
      DATA_TYPE,
      CHARACTER_MAXIMUM_LENGTH,
      IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = '${tableName}' 
    ORDER BY ORDINAL_POSITION
  `);
  
  return result.recordset;
}

async function getSupabaseColumns(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`  Table ${tableName} not found in Supabase`);
      return null;
    }
    
    return data && data.length > 0 ? Object.keys(data[0]) : [];
  } catch (error) {
    console.log(`  Error checking ${tableName}: ${error.message}`);
    return null;
  }
}

async function compareSchemas() {
  try {
    const pool = await sql.connect(mssqlConfig);
    
    console.log('📊 Comprehensive Schema Comparison: MSSQL vs Supabase');
    console.log('======================================================\n');
    
    const comparisons = [
      {
        mssql: 'executive_report_new_month',
        supabase: 'executive_monthly_reports',
        title: '1. Executive Monthly Reports'
      },
      {
        mssql: 'executive_report_new_week',
        supabase: 'executive_weekly_reports',
        title: '2. Executive Weekly Reports'
      },
      {
        mssql: 'ceo_report_full_month',
        supabase: 'ceo_metrics',
        title: '3. CEO Metrics'
      }
    ];
    
    for (const comparison of comparisons) {
      console.log(`\n${comparison.title}`);
      console.log('='.repeat(comparison.title.length));
      console.log(`MSSQL: ${comparison.mssql} → Supabase: ${comparison.supabase}\n`);
      
      // Get MSSQL schema
      const mssqlSchema = await getTableSchema(pool, comparison.mssql);
      
      if (mssqlSchema.length === 0) {
        console.log(`  ❌ MSSQL table ${comparison.mssql} not found`);
        continue;
      }
      
      const mssqlColumns = mssqlSchema.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE,
        length: col.CHARACTER_MAXIMUM_LENGTH,
        nullable: col.IS_NULLABLE
      }));
      
      // Get Supabase columns
      const supabaseColumns = await getSupabaseColumns(comparison.supabase);
      
      if (!supabaseColumns) {
        console.log(`  ❌ Supabase table ${comparison.supabase} not found or empty`);
        console.log(`\n  📋 MSSQL Columns (${mssqlColumns.length}):`);
        mssqlColumns.forEach(col => {
          console.log(`    - ${col.name} (${col.type}${col.length ? `(${col.length})` : ''})`);
        });
        continue;
      }
      
      const mssqlColumnNames = mssqlColumns.map(c => c.name);
      
      console.log(`  📋 MSSQL Columns (${mssqlColumnNames.length}):`);
      console.log(`    ${mssqlColumnNames.join(', ')}`);
      
      console.log(`\n  📋 Supabase Columns (${supabaseColumns.length}):`);
      console.log(`    ${supabaseColumns.join(', ')}`);
      
      // Find missing columns in Supabase
      const missingInSupabase = mssqlColumnNames.filter(col => {
        // Skip if it's a Supabase-specific column
        const supabaseSpecific = ['id', 'created_at', 'updated_at', 'import_source'];
        
        // Check common name mappings
        const mappings = {
          '%total_conversion': 'conversion_rate',
          '%new_conversion': 'new_conversion_rate',
          '%returning_conversion': 'returning_conversion_rate',
          'total_roas': 'roas',
          'Clinic': 'clinic',
          'Month': 'month',
          'Traffic_Source': 'traffic_source'
        };
        
        const supabaseEquivalent = mappings[col] || col.toLowerCase();
        return !supabaseColumns.includes(supabaseEquivalent) && !supabaseColumns.includes(col);
      });
      
      console.log(`\n  ❌ Missing in Supabase (${missingInSupabase.length}):`);
      if (missingInSupabase.length > 0) {
        missingInSupabase.forEach(col => {
          const colInfo = mssqlColumns.find(c => c.name === col);
          console.log(`    - ${col} (${colInfo.type}${colInfo.length ? `(${colInfo.length})` : ''})`);
        });
      } else {
        console.log('    None');
      }
      
      // Find extra columns in Supabase
      const extraInSupabase = supabaseColumns.filter(col => {
        // Skip Supabase-specific columns
        if (['id', 'created_at', 'updated_at', 'import_source'].includes(col)) return false;
        
        // Check reverse mappings
        const reverseMappings = {
          'conversion_rate': '%total_conversion',
          'new_conversion_rate': '%new_conversion',
          'returning_conversion_rate': '%returning_conversion',
          'roas': 'total_roas'
        };
        
        const mssqlEquivalent = reverseMappings[col] || col;
        return !mssqlColumnNames.includes(mssqlEquivalent) && 
               !mssqlColumnNames.map(c => c.toLowerCase()).includes(col.toLowerCase());
      });
      
      console.log(`\n  ➕ Extra in Supabase (${extraInSupabase.length}):`);
      if (extraInSupabase.length > 0) {
        extraInSupabase.forEach(col => console.log(`    - ${col}`));
      } else {
        console.log('    None');
      }
      
      // Show data type differences for matching columns
      console.log(`\n  🔍 Data Type Analysis:`);
      const matchingColumns = mssqlColumnNames.filter(col => {
        const mappings = {
          '%total_conversion': 'conversion_rate',
          '%new_conversion': 'new_conversion_rate',
          '%returning_conversion': 'returning_conversion_rate',
          'total_roas': 'roas'
        };
        const supabaseEquivalent = mappings[col] || col.toLowerCase();
        return supabaseColumns.includes(supabaseEquivalent) || supabaseColumns.includes(col);
      });
      
      if (matchingColumns.length > 0) {
        console.log(`    Matched ${matchingColumns.length} columns`);
      }
    }
    
    console.log('\n\n📊 Summary Recommendations:');
    console.log('============================');
    console.log('1. For executive_monthly_reports: Table exists and is populated');
    console.log('2. For executive_weekly_reports: Need to check if table exists');
    console.log('3. For ceo_metrics: Need to check if table exists');
    console.log('\nRun this script to see detailed missing columns and data type differences.');
    
    await pool.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

compareSchemas();