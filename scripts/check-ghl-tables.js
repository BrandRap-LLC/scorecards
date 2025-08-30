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

async function checkGHLTables() {
  try {
    console.log('🔄 Connecting to MSSQL...');
    const pool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');

    // Check for GHL tables
    const ghlTables = [
      'ghl_outbound_opportunity_week',
      'ghl_outbound_overdue_week'
    ];

    for (const tableName of ghlTables) {
      console.log(`📊 Checking ${tableName}:`);
      console.log('================================');
      
      try {
        // Check if table exists
        const tableCheck = await pool.request().query(`
          SELECT COUNT(*) as count 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_NAME = '${tableName}'
        `);
        
        if (tableCheck.recordset[0].count === 0) {
          console.log(`  ❌ Table '${tableName}' does not exist in MSSQL\n`);
          continue;
        }
        
        // Get row count
        const rowCount = await pool.request().query(`
          SELECT COUNT(*) as count FROM ${tableName}
        `);
        console.log(`  ✅ Table exists with ${rowCount.recordset[0].count} records`);
        
        // Get schema
        const schema = await pool.request().query(`
          SELECT 
            COLUMN_NAME,
            DATA_TYPE,
            CHARACTER_MAXIMUM_LENGTH,
            IS_NULLABLE
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = '${tableName}' 
          ORDER BY ORDINAL_POSITION
        `);
        
        console.log('  Columns:');
        schema.recordset.forEach(col => {
          let typeStr = col.DATA_TYPE;
          if (col.CHARACTER_MAXIMUM_LENGTH && col.CHARACTER_MAXIMUM_LENGTH !== -1) {
            typeStr += `(${col.CHARACTER_MAXIMUM_LENGTH})`;
          } else if (col.CHARACTER_MAXIMUM_LENGTH === -1) {
            typeStr += '(MAX)';
          }
          console.log(`    ${col.COLUMN_NAME}: ${typeStr} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Get sample data
        const sample = await pool.request().query(`
          SELECT TOP 1 * FROM ${tableName}
        `);
        
        if (sample.recordset.length > 0) {
          console.log('  Sample data:');
          Object.keys(sample.recordset[0]).forEach(key => {
            const value = sample.recordset[0][key];
            console.log(`    ${key}: ${value}`);
          });
        }
        
        console.log(''); // Empty line
        
      } catch (error) {
        console.log(`  ❌ Error checking ${tableName}: ${error.message}\n`);
      }
    }

    // Also search for any tables with 'ghl' in the name
    console.log('📊 All tables containing "ghl":');
    console.log('================================');
    
    const ghlSearch = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME LIKE '%ghl%'
      ORDER BY TABLE_NAME
    `);
    
    if (ghlSearch.recordset.length === 0) {
      console.log('  No tables found containing "ghl"');
    } else {
      ghlSearch.recordset.forEach(table => {
        console.log(`  - ${table.TABLE_NAME}`);
      });
    }

    await pool.close();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkGHLTables();