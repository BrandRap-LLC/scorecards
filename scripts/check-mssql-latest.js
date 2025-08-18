const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    trustServerCertificate: true,
    encrypt: true,
    enableArithAbort: true
  }
};

async function checkMSSQLLatestData() {
  let pool;
  try {
    console.log('Connecting to MSSQL...');
    pool = await sql.connect(config);
    console.log('Connected successfully!\n');

    // Check executive_report_new_month
    console.log('Checking executive_report_new_month...');
    const monthlyResult = await pool.request()
      .query(`
        SELECT TOP 1 month, COUNT(*) OVER() as total_count
        FROM executive_report_new_month
        ORDER BY month DESC
      `);
    
    if (monthlyResult.recordset.length > 0) {
      console.log(`  Latest month: ${monthlyResult.recordset[0].month}`);
      console.log(`  Total records: ${monthlyResult.recordset[0].total_count}`);
    }

    // Check executive_report_new_week
    console.log('\nChecking executive_report_new_week...');
    const weeklyResult = await pool.request()
      .query(`
        SELECT TOP 1 week, COUNT(*) OVER() as total_count
        FROM executive_report_new_week
        ORDER BY week DESC
      `);
    
    if (weeklyResult.recordset.length > 0) {
      console.log(`  Latest week: ${weeklyResult.recordset[0].week}`);
      console.log(`  Total records: ${weeklyResult.recordset[0].total_count}`);
    }

    // Check marketing_score_card_daily (potential source for paid_ads)
    console.log('\nChecking marketing_score_card_daily...');
    const marketingResult = await pool.request()
      .query(`
        SELECT TOP 1 date, COUNT(*) OVER() as total_count
        FROM marketing_score_card_daily
        ORDER BY date DESC
      `);
    
    if (marketingResult.recordset.length > 0) {
      console.log(`  Latest date: ${marketingResult.recordset[0].date}`);
      console.log(`  Total records: ${marketingResult.recordset[0].total_count}`);
    }

    // List all tables that might contain SEO data
    console.log('\nLooking for potential SEO tables...');
    const tablesResult = await pool.request()
      .query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE'
        AND (TABLE_NAME LIKE '%seo%' OR TABLE_NAME LIKE '%keyword%' OR TABLE_NAME LIKE '%organic%')
        ORDER BY TABLE_NAME
      `);
    
    console.log('Potential SEO tables found:');
    tablesResult.recordset.forEach(row => {
      console.log(`  - ${row.TABLE_NAME}`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

checkMSSQLLatestData().catch(console.error);