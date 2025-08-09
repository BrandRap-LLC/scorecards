#!/usr/bin/env node

/**
 * Find SEO highlights table in MSSQL
 */

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

async function findSeoHighlightsTable() {
  console.log('🔍 Searching for SEO highlights tables in MSSQL');
  console.log('================================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Search for tables with similar names
    console.log('📋 Tables containing "seo" or "highlight" or "keyword":\n');
    const tablesResult = await mssqlPool.request()
      .query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
          AND (
            LOWER(TABLE_NAME) LIKE '%seo%'
            OR LOWER(TABLE_NAME) LIKE '%highlight%'
            OR LOWER(TABLE_NAME) LIKE '%keyword%'
            OR LOWER(TABLE_NAME) LIKE '%page%one%'
          )
        ORDER BY TABLE_NAME
      `);
    
    if (tablesResult.recordset.length === 0) {
      console.log('❌ No tables found matching the search criteria');
    } else {
      console.log(`Found ${tablesResult.recordset.length} potential tables:\n`);
      tablesResult.recordset.forEach((row, index) => {
        console.log(`${index + 1}. ${row.TABLE_NAME}`);
      });
    }
    
    // Also check all tables
    console.log('\n\n📋 All tables in database:\n');
    const allTablesResult = await mssqlPool.request()
      .query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `);
    
    console.log(`Total tables: ${allTablesResult.recordset.length}\n`);
    
    // Group by prefix for easier viewing
    const tablesByPrefix = {};
    allTablesResult.recordset.forEach(row => {
      const prefix = row.TABLE_NAME.split('_')[0];
      if (!tablesByPrefix[prefix]) {
        tablesByPrefix[prefix] = [];
      }
      tablesByPrefix[prefix].push(row.TABLE_NAME);
    });
    
    // Show tables by prefix
    Object.keys(tablesByPrefix).sort().forEach(prefix => {
      const tables = tablesByPrefix[prefix];
      console.log(`\n${prefix}_* tables (${tables.length}):`);
      tables.forEach(table => {
        if (table.toLowerCase().includes('seo') || 
            table.toLowerCase().includes('highlight') || 
            table.toLowerCase().includes('keyword')) {
          console.log(`  ⭐ ${table}`);
        } else {
          console.log(`     ${table}`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run the search
findSeoHighlightsTable()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });