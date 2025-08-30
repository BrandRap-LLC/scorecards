const sql = require('mssql');

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
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

async function checkDates() {
  try {
    console.log('🔄 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Check monthly data
    console.log('📊 Executive Monthly Reports - Date Range:');
    const monthlyDates = await pool.request().query(`
      SELECT 
        MIN(month) as min_month,
        MAX(month) as max_month,
        COUNT(DISTINCT month) as unique_months,
        COUNT(*) as total_records
      FROM executive_report_new_month
    `);
    
    console.log('  Min month:', monthlyDates.recordset[0].min_month);
    console.log('  Max month:', monthlyDates.recordset[0].max_month);
    console.log('  Unique months:', monthlyDates.recordset[0].unique_months);
    console.log('  Total records:', monthlyDates.recordset[0].total_records);

    // Check latest months
    console.log('\n📊 Latest Monthly Data:');
    const latestMonths = await pool.request().query(`
      SELECT DISTINCT TOP 5 month, COUNT(*) as record_count
      FROM executive_report_new_month
      GROUP BY month
      ORDER BY month DESC
    `);
    
    latestMonths.recordset.forEach(row => {
      console.log(`  ${row.month.toISOString().split('T')[0]}: ${row.record_count} records`);
    });

    // Check weekly data
    console.log('\n📊 Executive Weekly Reports - Date Range:');
    const weeklyDates = await pool.request().query(`
      SELECT 
        MIN(week) as min_week,
        MAX(week) as max_week,
        COUNT(DISTINCT week) as unique_weeks,
        COUNT(*) as total_records
      FROM executive_report_new_week
    `);
    
    console.log('  Min week:', weeklyDates.recordset[0].min_week);
    console.log('  Max week:', weeklyDates.recordset[0].max_week);
    console.log('  Unique weeks:', weeklyDates.recordset[0].unique_weeks);
    console.log('  Total records:', weeklyDates.recordset[0].total_records);

    // Check latest weeks
    console.log('\n📊 Latest Weekly Data:');
    const latestWeeks = await pool.request().query(`
      SELECT DISTINCT TOP 5 week, COUNT(*) as record_count
      FROM executive_report_new_week
      GROUP BY week
      ORDER BY week DESC
    `);
    
    latestWeeks.recordset.forEach(row => {
      console.log(`  ${row.week.toISOString().split('T')[0]}: ${row.record_count} records`);
    });

    // Check for August 2025 monthly data
    console.log('\n📊 August 2025 Monthly Data Check:');
    const august2025 = await pool.request().query(`
      SELECT COUNT(*) as count, COUNT(DISTINCT clinic) as clinics
      FROM executive_report_new_month
      WHERE YEAR(month) = 2025 AND MONTH(month) = 8
    `);
    
    console.log(`  Records: ${august2025.recordset[0].count}`);
    console.log(`  Clinics: ${august2025.recordset[0].clinics}`);

    // Sample August 2025 data
    if (august2025.recordset[0].count > 0) {
      console.log('\n📊 Sample August 2025 Monthly Records:');
      const augustSample = await pool.request().query(`
        SELECT TOP 3 clinic, month, traffic_source, visits, spend
        FROM executive_report_new_month
        WHERE YEAR(month) = 2025 AND MONTH(month) = 8
        ORDER BY clinic, traffic_source
      `);
      
      augustSample.recordset.forEach(row => {
        console.log(`  ${row.clinic} | ${row.month.toISOString().split('T')[0]} | ${row.traffic_source}`);
      });
    }

    await pool.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDates();