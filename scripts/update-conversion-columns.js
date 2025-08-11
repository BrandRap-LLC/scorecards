const mssql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// MSSQL Configuration
const mssqlConfig = {
  server: process.env.MSSQL_SERVER,
  port: parseInt(process.env.MSSQL_PORT),
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USERNAME,
  password: process.env.MSSQL_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
};

// Supabase Configuration
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateConversionColumns() {
  let mssqlPool;
  
  try {
    console.log('📊 Starting conversion columns update...\n');
    
    // Connect to MSSQL
    console.log('🔄 Connecting to MSSQL...');
    mssqlPool = await mssql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all records with conversion data from MSSQL
    console.log('📥 Fetching conversion data from MSSQL...');
    const mssqlResult = await mssqlPool.request().query(`
      SELECT 
        clinic, 
        month, 
        traffic_source,
        [%new_conversion] as new_conversion_percent,
        [%returning_conversion] as returning_conversion_percent
      FROM executive_report_new_month
      WHERE [%new_conversion] IS NOT NULL 
        OR [%returning_conversion] IS NOT NULL
    `);
    
    console.log(`✅ Found ${mssqlResult.recordset.length} records with conversion data\n`);
    
    // Update records in batches
    const batchSize = 50;
    let updatedCount = 0;
    
    for (let i = 0; i < mssqlResult.recordset.length; i += batchSize) {
      const batch = mssqlResult.recordset.slice(i, i + batchSize);
      
      console.log(`📝 Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)...`);
      
      // Update each record in the batch
      for (const record of batch) {
        const { error } = await supabase
          .from('executive_monthly_reports')
          .update({
            '%new_conversion': record.new_conversion_percent,
            '%returning_conversion': record.returning_conversion_percent
          })
          .eq('clinic', record.clinic)
          .eq('month', new Date(record.month).toISOString().split('T')[0])
          .eq('traffic_source', record.traffic_source);
        
        if (error) {
          console.error(`❌ Error updating record for ${record.clinic}, ${record.month}, ${record.traffic_source}:`, error);
        } else {
          updatedCount++;
        }
      }
      
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed\n`);
    }
    
    console.log(`✅ Successfully updated ${updatedCount} records with conversion data`);
    
    // Verify the updates
    console.log('\n📊 Verifying updates...');
    const { data: verifyData, count } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact' })
      .not('%new_conversion', 'is', null);
    
    console.log(`✅ ${count} records now have conversion data in Supabase\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('🔒 MSSQL connection closed');
    }
  }
}

// Run the update
updateConversionColumns();