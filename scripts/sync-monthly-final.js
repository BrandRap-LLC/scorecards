#!/usr/bin/env node

const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to sanitize numeric values
function sanitizeNumeric(value, fieldName = '') {
  if (value === null || value === undefined) return null;
  
  // Convert to number
  const num = Number(value);
  
  // Handle special cases
  if (!isFinite(num) || isNaN(num)) {
    console.warn(`⚠️  Invalid numeric value for ${fieldName}: ${value} - setting to null`);
    return null;
  }
  
  // Cap extremely large values
  const MAX_SAFE_VALUE = 999999999; // Safe limit for numeric fields
  if (Math.abs(num) > MAX_SAFE_VALUE) {
    console.warn(`⚠️  Capping large value for ${fieldName}: ${value} → ${Math.sign(num) * MAX_SAFE_VALUE}`);
    return Math.sign(num) * MAX_SAFE_VALUE;
  }
  
  return num;
}

async function syncExecutiveMonthly() {
  console.log('📊 Syncing Executive Monthly Reports...');
  console.log('=====================================\n');
  
  const mssqlConfig = {
    server: '54.245.209.65',
    port: 1433,
    database: 'aggregated_reporting',
    user: 'supabase',
    password: 'R#8kZ2w$tE1Q',
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000
    }
  };
  
  let mssqlPool;
  
  try {
    console.log('📡 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Get all data from MSSQL
    const result = await mssqlPool.request()
      .query(`SELECT * FROM executive_report_new_month ORDER BY month DESC, clinic, traffic_source`);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    console.log('🗑️  Clearing existing data in Supabase...');
    const { error: deleteError } = await supabase
      .from('executive_monthly_reports')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.log('⚠️  No existing data to clear');
    } else {
      console.log('✅ Cleared existing data\n');
    }
    
    // Process in batches
    const batchSize = 50;
    let inserted = 0;
    let warnings = 0;
    
    console.log('📤 Inserting data into Supabase...');
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Map to the simple structure that matches the original migration
      const transformedBatch = batch.map(row => ({
        clinic: row.clinic,
        month: row.month ? new Date(row.month).toISOString().split('T')[0] : null,
        traffic_source: row.traffic_source,
        impressions: sanitizeNumeric(row.impressions, 'impressions'),
        visits: sanitizeNumeric(row.visits, 'visits'),
        spend: sanitizeNumeric(row.spend, 'spend'),
        ltv: sanitizeNumeric(row.ltv, 'ltv') || sanitizeNumeric(row.avg_ltv, 'ltv'), // fallback to avg_ltv
        estimated_ltv_6m: sanitizeNumeric(row.estimated_ltv_6m, 'estimated_ltv_6m'),
        avg_ltv: sanitizeNumeric(row.avg_ltv, 'avg_ltv') || sanitizeNumeric(row.ltv, 'avg_ltv'), // fallback to ltv
        roas: sanitizeNumeric(row.roas, 'roas') || sanitizeNumeric(row.total_roas, 'roas'), // fallback to total_roas
        leads: sanitizeNumeric(row.leads, 'leads'),
        conversion_rate: sanitizeNumeric(row['%total_conversion'], 'conversion_rate') || 
                        sanitizeNumeric(row['%conversion'], 'conversion_rate') || 
                        sanitizeNumeric(row.conversion_rate, 'conversion_rate') || 0,
        cac_total: sanitizeNumeric(row.cac_total, 'cac_total'),
        cac_new: sanitizeNumeric(row.cac_new, 'cac_new'),
        total_appointments: sanitizeNumeric(row.total_appointments, 'total_appointments'),
        new_appointments: sanitizeNumeric(row.new_appointments, 'new_appointments'),
        returning_appointments: sanitizeNumeric(row.returning_appointments, 'returning_appointments'),
        online_booking: sanitizeNumeric(row.online_booking, 'online_booking'),
        total_conversations: sanitizeNumeric(row.total_conversations, 'total_conversations'),
        new_conversations: sanitizeNumeric(row.new_conversations, 'new_conversations'),
        returning_conversations: sanitizeNumeric(row.returning_conversations, 'returning_conversations'),
        created_at: new Date().toISOString(),
        import_source: 'mssql_sync_' + new Date().toISOString().split('T')[0]
      }));
      
      const { error: insertError } = await supabase
        .from('executive_monthly_reports')
        .insert(transformedBatch);
      
      if (insertError) {
        console.error(`\n❌ Error inserting batch:`, insertError);
        
        // Log the first record to understand the issue
        console.log('\nFirst record of failing batch:');
        console.log(JSON.stringify(transformedBatch[0], null, 2));
        
        throw insertError;
      }
      
      inserted += batch.length;
      process.stdout.write(`\r✅ Progress: ${inserted}/${result.recordset.length} records`);
    }
    
    console.log('\n\n✅ Executive Monthly sync complete!');
    console.log(`📊 Total records synced: ${inserted}`);
    
    // Get sample of synced data
    const { data: sample, error: sampleError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .order('month', { ascending: false })
      .limit(5);
    
    if (sample && sample.length > 0) {
      console.log('\n📊 Sample of synced data:');
      sample.forEach(row => {
        console.log(`  - ${row.clinic} | ${row.month} | ${row.traffic_source} | Leads: ${row.leads} | ROAS: ${row.roas}`);
      });
    }
    
    return { success: true, records: inserted };
    
  } catch (error) {
    console.error('\n❌ Error syncing executive monthly:', error.message);
    return { success: false, error: error.message };
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔌 Disconnected from MSSQL');
    }
  }
}

// Run the sync
syncExecutiveMonthly().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});