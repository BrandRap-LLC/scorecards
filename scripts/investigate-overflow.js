#!/usr/bin/env node

const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

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
  }
};

async function investigateOverflow() {
  console.log('🔍 Investigating Numeric Overflow Issue');
  console.log('=====================================\n');
  
  let mssqlPool;
  
  try {
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get a sample of data to check for extreme values
    const result = await mssqlPool.request()
      .query(`
        SELECT TOP 10 *
        FROM executive_report_new_month
        ORDER BY month DESC
      `);
    
    console.log('📊 Sample data:\n');
    
    // Check each record for potentially problematic values
    result.recordset.forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  Clinic: ${record.clinic}`);
      console.log(`  Month: ${record.month}`);
      
      // Check numeric fields for extreme values
      const numericFields = [
        'impressions', 'visits', 'spend', 'leads', 'new_leads', 'returning_leads',
        'conversion_rate', 'new_conversion', 'returning_conversion',
        'total_appointments', 'new_appointments', 'returning_appointments',
        'online_booking', 'ltv', 'roas', 'estimated_ltv_6m',
        'cac_total', 'cac_new', 'total_estimated_revenue', 'new_estimated_revenue',
        'total_roas', 'new_roas', 'total_conversion', 'returning_conversion'
      ];
      
      console.log('  Numeric values:');
      numericFields.forEach(field => {
        const value = record[field];
        if (value !== null && value !== undefined) {
          if (Math.abs(value) > 1e10) {
            console.log(`    ⚠️  ${field}: ${value} (VERY LARGE)`);
          } else if (!isFinite(value)) {
            console.log(`    ❌ ${field}: ${value} (INFINITE)`);
          } else if (isNaN(value)) {
            console.log(`    ❌ ${field}: ${value} (NaN)`);
          } else {
            console.log(`    ${field}: ${value}`);
          }
        }
      });
      console.log('');
    });
    
    // Check for infinity or NaN values
    console.log('🔍 Checking for infinity or NaN values...\n');
    
    const checkQueries = [
      { field: 'cac_total', description: 'CAC Total' },
      { field: 'cac_new', description: 'CAC New' },
      { field: 'roas', description: 'ROAS' },
      { field: 'total_roas', description: 'Total ROAS' },
      { field: 'new_roas', description: 'New ROAS' }
    ];
    
    for (const check of checkQueries) {
      const infinityResult = await mssqlPool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM executive_report_new_month
          WHERE ${check.field} = 'Infinity' 
             OR ${check.field} = '-Infinity'
             OR ${check.field} IS NULL AND 1=0
        `);
      
      const count = infinityResult.recordset[0].count;
      if (count > 0) {
        console.log(`❌ Found ${count} infinity values in ${check.description}`);
        
        // Get examples
        const examples = await mssqlPool.request()
          .query(`
            SELECT TOP 3 clinic, month, traffic_source, ${check.field}
            FROM executive_report_new_month
            WHERE ${check.field} = 'Infinity' OR ${check.field} = '-Infinity'
          `);
        
        examples.recordset.forEach(ex => {
          console.log(`   - ${ex.clinic} | ${ex.month} | ${ex.traffic_source} | ${ex[check.field]}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

investigateOverflow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});