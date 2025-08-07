#!/usr/bin/env node

/**
 * Full Resync: Add missing columns, delete all data, and re-import from MSSQL
 */

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function fullResync() {
  console.log('🔄 Full MSSQL to Supabase Resync');
  console.log('=================================\n');
  
  let mssqlPool;
  
  try {
    // Step 1: Add missing columns to Supabase
    console.log('📊 Step 1: Adding missing columns to Supabase...');
    
    const alterStatements = [
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS new_leads INTEGER;',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS returning_leads INTEGER;',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(10,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(10,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2);',
      'ALTER TABLE executive_monthly_reports ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);'
    ];
    
    // Execute each ALTER statement
    for (const statement of alterStatements) {
      const columnName = statement.match(/ADD COLUMN IF NOT EXISTS (\w+)/)[1];
      console.log(`  Adding column: ${columnName}`);
      
      // Note: Supabase doesn't support direct SQL execution through the client
      // We'll need to handle this differently or run these in the Supabase SQL editor
    }
    
    console.log('\n⚠️  Please run the following SQL in Supabase SQL editor:');
    console.log('--------------------------------------------------------');
    alterStatements.forEach(stmt => console.log(stmt));
    console.log('--------------------------------------------------------\n');
    
    // Step 2: Delete all existing data
    console.log('🗑️  Step 2: Deleting all existing data from Supabase...');
    const { error: deleteError, count } = await supabase
      .from('executive_monthly_reports')
      .delete()
      .neq('id', 0); // Delete all rows
      
    if (deleteError) {
      console.error('Error deleting data:', deleteError);
      return;
    }
    
    console.log(`✅ Deleted all existing records\n`);
    
    // Step 3: Connect to MSSQL and fetch all data
    console.log('📡 Step 3: Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all data from MSSQL
    console.log('📥 Fetching all data from MSSQL...');
    const dataResult = await mssqlPool.request()
      .query('SELECT * FROM executive_report_new_month ORDER BY month, clinic, traffic_source');
    
    console.log(`📊 Found ${dataResult.recordset.length} records to import\n`);
    
    // Step 4: Transform and insert data
    console.log('📤 Step 4: Importing data to Supabase...');
    
    // Process in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < dataResult.recordset.length; i += batchSize) {
      const batch = dataResult.recordset.slice(i, i + batchSize);
      
      // Transform the batch
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month,
        traffic_source: row.traffic_source,
        impressions: row.impressions || 0,
        visits: row.visits || 0,
        spend: row.spend || 0,
        ltv: row.ltv || 0,
        estimated_ltv_6m: row.estimated_ltv_6m || 0,
        avg_ltv: row.avg_ltv || 0,
        roas: row.total_roas || 0,  // Map total_roas to roas for backward compatibility
        total_roas: row.total_roas || 0,
        new_roas: row.new_roas || 0,
        leads: row.leads || 0,
        new_leads: row.new_leads || 0,
        returning_leads: row.returning_leads || 0,
        conversion_rate: row['%total_conversion'] || 0,  // Map for backward compatibility
        total_conversion: row['%total_conversion'] || 0,
        new_conversion: row['%new_conversion'] || 0,
        cac_total: row.cac_total || 0,
        cac_new: row.cac_new || 0,
        total_estimated_revenue: row.total_estimated_revenue || 0,
        new_estimated_revenue: row.new_estimated_revenue || 0,
        total_appointments: row.total_appointments || 0,
        new_appointments: row.new_appointments || 0,
        returning_appointments: row.returning_appointments || 0,
        online_booking: row.online_booking || 0,
        total_conversations: row.total_conversations || 0,
        new_conversations: row.new_conversations || 0,
        returning_conversations: row.returning_conversations || 0,
        avg_appointment_rev: row.avg_appointment_rev || 0,
        avg_estimated_ltv_6m: row.avg_estimated_ltv_6m || 0,
        import_source: 'MSSQL_FULL_RESYNC'
      }));
      
      // Insert the batch
      const { error: insertError } = await supabase
        .from('executive_monthly_reports')
        .insert(transformedBatch);
        
      if (insertError) {
        console.error(`❌ Error inserting batch ${i/batchSize + 1}:`, insertError.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        process.stdout.write(`  Progress: ${successCount}/${dataResult.recordset.length} records\\r`);
      }
    }
    
    console.log('\n');
    
    // Step 5: Verify the import
    console.log('✅ Step 5: Verifying import...');
    
    const { count: finalCount } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
      
    console.log(`\n📊 Import Summary:`);
    console.log(`  Total records in MSSQL: ${dataResult.recordset.length}`);
    console.log(`  Successfully imported: ${successCount}`);
    console.log(`  Failed to import: ${errorCount}`);
    console.log(`  Final count in Supabase: ${finalCount}`);
    
    // Check a sample of the imported data
    const { data: sampleData } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .order('month', { ascending: false })
      .limit(3);
      
    console.log('\n📋 Sample imported data:');
    sampleData?.forEach((record, i) => {
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    Clinic: ${record.clinic}`);
      console.log(`    Month: ${record.month}`);
      console.log(`    Traffic: ${record.traffic_source}`);
      console.log(`    Total ROAS: ${record.total_roas}`);
      console.log(`    New Leads: ${record.new_leads}`);
      console.log(`    Total Revenue: ${record.total_estimated_revenue}`);
    });
    
  } catch (error) {
    console.error('❌ Error during resync:', error.message);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Create SQL file for manual execution
function createAlterTableSQL() {
  const sqlContent = `-- Add missing columns to executive_monthly_reports table
-- Run this in Supabase SQL editor before running the resync script

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS total_roas DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_roas DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_leads INTEGER;

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS returning_leads INTEGER;

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS total_conversion DECIMAL(5,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_conversion DECIMAL(5,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS total_estimated_revenue DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS new_estimated_revenue DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS avg_appointment_rev DECIMAL(10,2);

ALTER TABLE executive_monthly_reports 
ADD COLUMN IF NOT EXISTS avg_estimated_ltv_6m DECIMAL(10,2);

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'executive_monthly_reports' 
ORDER BY ordinal_position;
`;

  require('fs').writeFileSync('sql/add_missing_columns.sql', sqlContent);
  console.log('📄 Created sql/add_missing_columns.sql - Run this in Supabase first!');
}

// Check if we should create the SQL file
if (process.argv[2] === '--create-sql') {
  createAlterTableSQL();
} else {
  fullResync();
}