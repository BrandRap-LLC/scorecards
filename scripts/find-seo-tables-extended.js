#!/usr/bin/env node

/**
 * Find SEO-related tables in MSSQL with extended search
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

async function findSeoTables() {
  console.log('🔍 Searching for SEO-related tables in MSSQL');
  console.log('================================================\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Extended search for SEO-related tables
    console.log('📋 Tables that might contain SEO data:\n');
    const tablesResult = await mssqlPool.request()
      .query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
          AND (
            LOWER(TABLE_NAME) LIKE '%seo%'
            OR LOWER(TABLE_NAME) LIKE '%search%'
            OR LOWER(TABLE_NAME) LIKE '%organic%'
            OR LOWER(TABLE_NAME) LIKE '%keyword%'
            OR LOWER(TABLE_NAME) LIKE '%page%'
            OR LOWER(TABLE_NAME) LIKE '%position%'
            OR LOWER(TABLE_NAME) LIKE '%rank%'
            OR LOWER(TABLE_NAME) LIKE '%google%'
          )
        ORDER BY TABLE_NAME
      `);
    
    if (tablesResult.recordset.length === 0) {
      console.log('❌ No tables found matching the search criteria');
    } else {
      console.log(`Found ${tablesResult.recordset.length} potential tables:\n`);
      
      // Check each table for SEO-specific columns
      for (const row of tablesResult.recordset) {
        console.log(`\n📊 Table: ${row.TABLE_NAME}`);
        console.log('   Checking for SEO-related columns...');
        
        const columnsResult = await mssqlPool.request()
          .query(`
            SELECT COLUMN_NAME, DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = '${row.TABLE_NAME}'
              AND (
                LOWER(COLUMN_NAME) LIKE '%position%'
                OR LOWER(COLUMN_NAME) LIKE '%rank%'
                OR LOWER(COLUMN_NAME) LIKE '%keyword%'
                OR LOWER(COLUMN_NAME) LIKE '%query%'
                OR LOWER(COLUMN_NAME) LIKE '%impression%'
                OR LOWER(COLUMN_NAME) LIKE '%click%'
                OR LOWER(COLUMN_NAME) LIKE '%ctr%'
                OR LOWER(COLUMN_NAME) LIKE '%page%'
              )
            ORDER BY ORDINAL_POSITION
          `);
        
        if (columnsResult.recordset.length > 0) {
          console.log('   ✅ SEO-related columns found:');
          columnsResult.recordset.forEach(col => {
            console.log(`      - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
          });
          
          // Get record count
          try {
            const countResult = await mssqlPool.request()
              .query(`SELECT COUNT(*) as total FROM ${row.TABLE_NAME}`);
            console.log(`   📊 Total records: ${countResult.recordset[0].total}`);
          } catch (e) {
            console.log(`   ⚠️  Could not get record count`);
          }
        } else {
          console.log('   ❌ No SEO-specific columns found');
        }
      }
    }
    
    // Also check views
    console.log('\n\n📋 Views that might contain SEO data:\n');
    const viewsResult = await mssqlPool.request()
      .query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.VIEWS
        WHERE (
            LOWER(TABLE_NAME) LIKE '%seo%'
            OR LOWER(TABLE_NAME) LIKE '%search%'
            OR LOWER(TABLE_NAME) LIKE '%organic%'
            OR LOWER(TABLE_NAME) LIKE '%keyword%'
            OR LOWER(TABLE_NAME) LIKE '%page%'
            OR LOWER(TABLE_NAME) LIKE '%position%'
            OR LOWER(TABLE_NAME) LIKE '%rank%'
          )
        ORDER BY TABLE_NAME
      `);
    
    if (viewsResult.recordset.length > 0) {
      console.log(`Found ${viewsResult.recordset.length} views:`);
      viewsResult.recordset.forEach((row, index) => {
        console.log(`${index + 1}. ${row.TABLE_NAME}`);
      });
    } else {
      console.log('No SEO-related views found');
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

// Run the search
findSeoTables()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });