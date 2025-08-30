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

async function getTableSchemas() {
  try {
    console.log('🔄 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Get schema for paid_ads table
    console.log('📊 Schema for paid_ads table:');
    console.log('================================');
    
    const paidAdsColumns = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        IS_NULLABLE,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'paid_ads' 
      ORDER BY ORDINAL_POSITION
    `);
    
    if (paidAdsColumns.recordset.length === 0) {
      console.log('  ❌ Table paid_ads not found');
    } else {
      paidAdsColumns.recordset.forEach(col => {
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
    }

    // Get row count for paid_ads
    const paidAdsCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM paid_ads
    `);
    console.log(`\n  Total rows: ${paidAdsCount.recordset[0].count}`);

    // Get schema for google_ads_optimization_report_ad table
    console.log('\n📊 Schema for google_ads_optimization_report_ad table:');
    console.log('========================================================');
    
    const googleAdsColumns = await pool.request().query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        IS_NULLABLE,
        ORDINAL_POSITION
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'google_ads_optimization_report_ad' 
      ORDER BY ORDINAL_POSITION
    `);
    
    if (googleAdsColumns.recordset.length === 0) {
      console.log('  ❌ Table google_ads_optimization_report_ad not found');
    } else {
      googleAdsColumns.recordset.forEach(col => {
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
    }

    // Get row count for google_ads_optimization_report_ad
    const googleAdsCount = await pool.request().query(`
      SELECT COUNT(*) as count FROM google_ads_optimization_report_ad
    `);
    console.log(`\n  Total rows: ${googleAdsCount.recordset[0].count}`);

    // Get sample data from paid_ads
    console.log('\n📊 Sample data from paid_ads (first row):');
    const paidAdsSample = await pool.request().query(`
      SELECT TOP 1 * FROM paid_ads
    `);
    
    if (paidAdsSample.recordset.length > 0) {
      Object.keys(paidAdsSample.recordset[0]).forEach(key => {
        const value = paidAdsSample.recordset[0][key];
        console.log(`  ${key}: ${value} (${typeof value})`);
      });
    }

    // Get sample data from google_ads_optimization_report_ad
    console.log('\n📊 Sample data from google_ads_optimization_report_ad (first row):');
    const googleAdsSample = await pool.request().query(`
      SELECT TOP 1 * FROM google_ads_optimization_report_ad
    `);
    
    if (googleAdsSample.recordset.length > 0) {
      Object.keys(googleAdsSample.recordset[0]).forEach(key => {
        const value = googleAdsSample.recordset[0][key];
        console.log(`  ${key}: ${value} (${typeof value})`);
      });
    }

    await pool.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getTableSchemas();