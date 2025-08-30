const sql = require('mssql');

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

async function getGoogleAdsSchema() {
  try {
    console.log('🔄 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Get schema for google_ads_optimazation_report_ad table
    console.log('📊 Schema for google_ads_optimazation_report_ad table:');
    console.log('========================================================');
    
    const columns = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        IS_NULLABLE,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'google_ads_optimazation_report_ad' 
      ORDER BY ORDINAL_POSITION
    `);
    
    columns.recordset.forEach(col => {
      let typeStr = col.DATA_TYPE;
      if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH !== -1) {
        typeStr += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
      } else if (col.CHARACTER_MAXIMUM_LENGTH === -1) {
        typeStr += '(MAX)';
      } else if (col.NUMERIC_PRECISION) {
        typeStr += `(${col.NUMERIC_PRECISION}${col.NUMERIC_SCALE ? ',' + col.NUMERIC_SCALE : ''})`;
      }
      console.log(`  ${col.ORDINAL_POSITION}. ${col.COLUMN_NAME}: ${typeStr} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Get row count
    const rowCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM google_ads_optimazation_report_ad
    `);
    console.log(`\n  Total rows: ${rowCount.recordset[0].count}`);

    // Get sample data
    console.log('\n📊 Sample data from google_ads_optimazation_report_ad (first row):');
    const sampleData = await pool.request().query(`
      SELECT TOP 1 * FROM google_ads_optimazation_report_ad
    `);
    
    if (sampleData.recordset.length > 0) {
      Object.keys(sampleData.recordset[0]).forEach(key => {
        const value = sampleData.recordset[0][key];
        console.log(`  ${key}: ${value} (${typeof value})`);
      });
    }

    await pool.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getGoogleAdsSchema();