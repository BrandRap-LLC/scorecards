const { createClient } = require('@supabase/supabase-js');
const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// MSSQL config
const mssqlConfig = {
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

async function checkWeeklyDataSync() {
  let mssqlPool;
  
  try {
    console.log('🔍 Checking weekly data sync status...\n');
    
    // Connect to MSSQL
    mssqlPool = await sql.connect(mssqlConfig);
    
    // Check latest week in Supabase
    const { data: supabaseData } = await supabase
      .from('executive_weekly_reports')
      .select('week')
      .order('week', { ascending: false })
      .limit(5);
    
    console.log('Latest weeks in Supabase executive_weekly_reports:');
    supabaseData?.forEach(row => {
      console.log(`  - ${row.week}`);
    });
    
    // Check latest week in MSSQL
    const mssqlResult = await mssqlPool.request()
      .query(`
        SELECT DISTINCT TOP 5 week
        FROM executive_report_new_week
        ORDER BY week DESC
      `);
    
    console.log('\nLatest weeks in MSSQL executive_report_new_week:');
    mssqlResult.recordset.forEach(row => {
      console.log(`  - ${new Date(row.week).toISOString().split('T')[0]}`);
    });
    
    // Check if there's newer data to sync
    const latestSupabaseWeek = supabaseData?.[0]?.week || '2000-01-01';
    const newerDataResult = await mssqlPool.request()
      .input('latestWeek', sql.Date, latestSupabaseWeek)
      .query(`
        SELECT COUNT(*) as count, MIN(week) as min_week, MAX(week) as max_week
        FROM executive_report_new_week
        WHERE week > @latestWeek
      `);
    
    if (newerDataResult.recordset[0].count > 0) {
      console.log(`\n⚠️  Found ${newerDataResult.recordset[0].count} newer records in MSSQL`);
      console.log(`  Date range: ${new Date(newerDataResult.recordset[0].min_week).toISOString().split('T')[0]} to ${new Date(newerDataResult.recordset[0].max_week).toISOString().split('T')[0]}`);
    } else {
      console.log('\n✅ Weekly data is up to date');
    }
    
    // Check current week data
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    console.log(`\nCurrent week starts: ${currentWeekStart.toISOString().split('T')[0]}`);
    
    const currentWeekResult = await mssqlPool.request()
      .input('currentWeek', sql.Date, currentWeekStart)
      .query(`
        SELECT COUNT(*) as count, COUNT(DISTINCT clinic) as clinics
        FROM executive_report_new_week
        WHERE week = @currentWeek
      `);
    
    if (currentWeekResult.recordset[0].count > 0) {
      console.log(`Current week data: ${currentWeekResult.recordset[0].count} records for ${currentWeekResult.recordset[0].clinics} clinics`);
    } else {
      console.log('No data yet for current week');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

checkWeeklyDataSync().catch(console.error);