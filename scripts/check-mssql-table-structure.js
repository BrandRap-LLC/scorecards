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

async function checkTableStructure() {
  let pool;
  try {
    console.log('Connecting to MSSQL...');
    pool = await sql.connect(config);
    console.log('Connected successfully!\n');

    // Check marketing_score_card_daily structure
    console.log('📊 marketing_score_card_daily table structure:');
    const marketingColumns = await pool.request()
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'marketing_score_card_daily'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log('Columns:');
    marketingColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
    });

    // Get sample data
    console.log('\nSample data:');
    const sampleData = await pool.request()
      .query(`
        SELECT TOP 2 *
        FROM marketing_score_card_daily
        WHERE date >= '2025-08-01'
        ORDER BY date DESC
      `);
    
    if (sampleData.recordset.length > 0) {
      console.log(JSON.stringify(sampleData.recordset[0], null, 2));
    }

    // Check seo_channels structure
    console.log('\n\n📊 seo_channels table structure:');
    const seoColumns = await pool.request()
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'seo_channels'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log('Columns:');
    seoColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
    });

    // Check score_card_keyword_summary structure
    console.log('\n\n📊 score_card_keyword_summary table structure:');
    const keywordColumns = await pool.request()
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'score_card_keyword_summary'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log('Columns:');
    keywordColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
    });

    // Check google_ads_optimazation_report_keyword structure
    console.log('\n\n📊 google_ads_optimazation_report_keyword table structure:');
    const googleAdsColumns = await pool.request()
      .query(`
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          CHARACTER_MAXIMUM_LENGTH,
          IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'google_ads_optimazation_report_keyword'
        ORDER BY ORDINAL_POSITION
      `);
    
    console.log('Columns:');
    googleAdsColumns.recordset.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

checkTableStructure().catch(console.error);