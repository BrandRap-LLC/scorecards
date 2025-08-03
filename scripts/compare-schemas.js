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

async function compareSchemas() {
  try {
    const pool = await sql.connect(mssqlConfig);
    
    console.log('📊 Schema Comparison: MSSQL vs Supabase');
    console.log('========================================\n');
    
    // Get MSSQL columns
    const mssqlResult = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'executive_report_new_month' 
      ORDER BY ORDINAL_POSITION
    `);
    
    const mssqlColumns = mssqlResult.recordset.map(r => r.COLUMN_NAME);
    
    // Get Supabase columns
    const { data: supabaseColumns } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);
    
    const supabaseColumnNames = supabaseColumns ? Object.keys(supabaseColumns[0]) : [];
    
    console.log('📋 MSSQL Columns (Current):', mssqlColumns.length);
    console.log(mssqlColumns.join(', '));
    
    console.log('\n📋 Supabase Columns (Existing):', supabaseColumnNames.length);
    console.log(supabaseColumnNames.join(', '));
    
    // Find removed columns (in Supabase but not in MSSQL)
    const removedColumns = supabaseColumnNames.filter(col => {
      // Skip Supabase-specific columns
      if (['id', 'created_at', 'import_source'].includes(col)) return false;
      
      // Map column names that were renamed
      const mappings = {
        'roas': 'total_roas',
        'conversion_rate': '%total_conversion'
      };
      
      const mssqlEquivalent = mappings[col] || col;
      return !mssqlColumns.includes(mssqlEquivalent) && !mssqlColumns.includes('%' + col);
    });
    
    console.log('\n❌ REMOVED Columns (in Supabase but NOT in MSSQL):');
    if (removedColumns.length > 0) {
      removedColumns.forEach(col => console.log(`  - ${col}`));
    } else {
      console.log('  None - all Supabase columns have MSSQL equivalents');
    }
    
    // Find added columns (in MSSQL but not in Supabase)
    const addedColumns = mssqlColumns.filter(col => {
      // Map MSSQL columns to Supabase names
      const mappings = {
        '%total_conversion': 'conversion_rate',
        '%new_conversion': 'new_conversion',
        'total_roas': 'roas'
      };
      
      const supabaseEquivalent = mappings[col] || col;
      return !supabaseColumnNames.includes(supabaseEquivalent);
    });
    
    console.log('\n✅ ADDED Columns (in MSSQL but NOT in Supabase):');
    addedColumns.forEach(col => console.log(`  - ${col}`));
    
    // Find renamed columns
    console.log('\n🔄 RENAMED Columns:');
    console.log('  - roas → total_roas');
    console.log('  - %conversion → %total_conversion');
    
    await pool.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

compareSchemas();