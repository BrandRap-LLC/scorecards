const sql = require('mssql');

// MSSQL configuration - hardcoded to avoid parsing issues
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

async function checkColumns() {
  try {
    console.log('🔄 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Check executive_report_new_month columns
    console.log('📊 Columns in executive_report_new_month:');
    const monthColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'executive_report_new_month' 
      ORDER BY ORDINAL_POSITION
    `);
    
    monthColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Check executive_report_new_week columns
    console.log('\n📊 Columns in executive_report_new_week:');
    const weekColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'executive_report_new_week' 
      ORDER BY ORDINAL_POSITION
    `);
    
    weekColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Check marketing_score_card_daily columns
    console.log('\n📊 Columns in marketing_score_card_daily:');
    const marketingColumns = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'marketing_score_card_daily' 
      ORDER BY ORDINAL_POSITION
    `);
    
    marketingColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    // Get sample data from executive_report_new_month
    console.log('\n📊 Sample data from executive_report_new_month:');
    const sampleData = await pool.request().query(`
      SELECT TOP 1 * FROM executive_report_new_month ORDER BY month DESC
    `);
    
    if (sampleData.recordset.length > 0) {
      console.log('Available columns:', Object.keys(sampleData.recordset[0]));
    }

    await pool.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkColumns();