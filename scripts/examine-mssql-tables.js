const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function examineTables() {
  try {
    await sql.connect(config);
    console.log('Connected to MSSQL');

    // Examine paid_ads table
    console.log('\n=== PAID_ADS TABLE ===');
    
    // Get column information
    const columnsResult = await sql.query`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'paid_ads'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log('\nColumns:');
    columnsResult.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Get sample data and count
    const countResult = await sql.query`SELECT COUNT(*) as count FROM paid_ads`;
    console.log(`\nTotal rows: ${countResult.recordset[0].count}`);

    const sampleData = await sql.query`SELECT TOP 5 * FROM paid_ads`;
    console.log('\nSample data:');
    console.log(JSON.stringify(sampleData.recordset, null, 2));

    // Examine seo_channels table
    console.log('\n\n=== SEO_CHANNELS TABLE ===');
    
    // Get column information
    const seoColumnsResult = await sql.query`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'seo_channels'
      ORDER BY ORDINAL_POSITION
    `;
    
    console.log('\nColumns:');
    seoColumnsResult.recordset.forEach(col => {
      const length = col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : '';
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE}${length} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Get sample data and count
    const seoCountResult = await sql.query`SELECT COUNT(*) as count FROM seo_channels`;
    console.log(`\nTotal rows: ${seoCountResult.recordset[0].count}`);

    const seoSampleData = await sql.query`SELECT TOP 5 * FROM seo_channels`;
    console.log('\nSample data:');
    console.log(JSON.stringify(seoSampleData.recordset, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.close();
  }
}

examineTables();