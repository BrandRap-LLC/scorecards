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

async function findTables() {
  try {
    console.log('🔄 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Find all tables with "google" or "ads" in the name
    console.log('📊 Tables containing "google" or "ads":');
    console.log('======================================');
    
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND (TABLE_NAME LIKE '%google%' OR TABLE_NAME LIKE '%ads%')
      ORDER BY TABLE_NAME
    `);
    
    if (tables.recordset.length === 0) {
      console.log('  No tables found with "google" or "ads" in name');
    } else {
      tables.recordset.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }

    // Also check for tables with "optimization" in the name
    console.log('\n📊 Tables containing "optimization":');
    console.log('====================================');
    
    const optTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME LIKE '%optimization%'
      ORDER BY TABLE_NAME
    `);
    
    if (optTables.recordset.length === 0) {
      console.log('  No tables found with "optimization" in name');
    } else {
      optTables.recordset.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }

    // List all tables to see what's available
    console.log('\n📊 All available tables in aggregated_reporting:');
    console.log('==================================================');
    
    const allTables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    allTables.recordset.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    await pool.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findTables();