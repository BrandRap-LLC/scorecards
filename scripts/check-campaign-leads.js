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

async function checkCampaignLeads() {
  console.log('🔍 Searching for tables with campaign-level leads data\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Search for tables that might have campaign and leads data
    const tablesResult = await mssqlPool.request()
      .query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
          AND (TABLE_NAME LIKE '%campaign%' 
               OR TABLE_NAME LIKE '%lead%'
               OR TABLE_NAME LIKE '%paid%'
               OR TABLE_NAME LIKE '%ads%')
        ORDER BY TABLE_NAME
      `);
    
    console.log('📋 Potentially relevant tables:');
    tablesResult.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    
    // Check columns in tables that might have both campaign and leads
    console.log('\n🔎 Checking for tables with both campaign and leads columns:');
    
    for (const table of tablesResult.recordset) {
      const tableName = table.TABLE_NAME;
      
      try {
        const columnsResult = await mssqlPool.request()
          .query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = '${tableName}'
          `);
        
        const columns = columnsResult.recordset.map(r => r.COLUMN_NAME.toLowerCase());
        
        const hasCampaign = columns.some(col => col.includes('campaign'));
        const hasLeads = columns.some(col => col.includes('lead'));
        
        if (hasCampaign && hasLeads) {
          console.log(`\n✅ Table '${tableName}' has both campaign and leads columns:`);
          columnsResult.recordset
            .filter(r => r.COLUMN_NAME.toLowerCase().includes('campaign') || 
                        r.COLUMN_NAME.toLowerCase().includes('lead'))
            .forEach(col => {
              console.log(`     - ${col.COLUMN_NAME}`);
            });
        }
      } catch (err) {
        // Skip tables we can't access
      }
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

checkCampaignLeads();