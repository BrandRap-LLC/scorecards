#!/usr/bin/env node

const sql = require('mssql');

async function listTables() {
  console.log('🔍 Listing MSSQL Tables\n');
  
  // Check aggregated_reporting database
  const aggregatedConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  // Check reporting database
  const reportingConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  try {
    // Check aggregated_reporting database
    console.log('📊 Tables in aggregated_reporting database:');
    console.log('==========================================');
    let pool = await sql.connect(aggregatedConfig);
    let result = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
      `);
    
    result.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    await pool.close();
    
    // Check reporting database
    console.log('\n📊 Tables in reporting database:');
    console.log('================================');
    pool = await sql.connect(reportingConfig);
    result = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
      `);
    
    result.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    await pool.close();
    
    // Look for specific patterns
    console.log('\n🔍 Looking for executive/SEO/paid ads tables:');
    console.log('============================================');
    
    // Re-connect to aggregated_reporting
    pool = await sql.connect(aggregatedConfig);
    
    // Executive tables
    result = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (TABLE_NAME LIKE '%executive%' OR TABLE_NAME LIKE '%ceo%')
        ORDER BY TABLE_NAME
      `);
    
    console.log('\nExecutive/CEO tables in aggregated_reporting:');
    result.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    
    // SEO tables
    result = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME LIKE '%seo%'
        ORDER BY TABLE_NAME
      `);
    
    console.log('\nSEO tables in aggregated_reporting:');
    result.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    
    // Paid ads tables
    result = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND (TABLE_NAME LIKE '%paid%' OR TABLE_NAME LIKE '%ads%')
        ORDER BY TABLE_NAME
      `);
    
    console.log('\nPaid ads tables in aggregated_reporting:');
    result.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });
    
    await pool.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listTables().catch(console.error);