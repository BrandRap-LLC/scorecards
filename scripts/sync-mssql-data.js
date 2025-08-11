#!/usr/bin/env node

/**
 * Syncs data from MSSQL to existing Supabase tables
 * Updates existing records and adds new ones
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
  server: process.env.MSSQL_SERVER || '54.245.209.65',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.MSSQL_DATABASE || 'aggregated_reporting',
  user: process.env.MSSQL_USERNAME || 'supabase',
  password: process.env.MSSQL_PASSWORD || 'R#8kZ2w$tE1Q',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 300000
  }
};

async function syncMonthlyReports(mssqlPool) {
  console.log('\n📊 Syncing executive_monthly_reports...');
  
  try {
    // Get latest data from MSSQL
    const result = await mssqlPool.request().query(`
      SELECT 
        clinic,
        month,
        traffic_source,
        impressions,
        visits,
        spend,
        estimated_ltv_6m,
        total_roas as roas,
        leads,
        new_leads,
        returning_leads,
        [%total_conversion] as conversion_rate,
        [%new_conversion],
        [%returning_conversion],
        cac_total,
        cac_new,
        total_appointments as appointments,
        new_appointments as appointments_new,
        returning_appointments as appointments_returning,
        online_booking,
        total_conversations as conversations,
        new_conversations as conversations_new,
        returning_conversations as conversations_returning
      FROM executive_report_new_month
      ORDER BY month DESC, clinic, traffic_source
    `);
    
    console.log(`📥 Found ${result.recordset.length} records in MSSQL`);
    
    // Get existing data from Supabase to check what's new
    const { data: existingData, error: fetchError } = await supabase
      .from('executive_monthly_reports')
      .select('clinic, month, traffic_source')
      .order('month', { ascending: false });
    
    if (fetchError) {
      console.error('❌ Error fetching existing data:', fetchError.message);
      return;
    }
    
    // Create a Set of existing records for quick lookup
    const existingKeys = new Set(
      existingData.map(row => `${row.clinic}|${row.month}|${row.traffic_source}`)
    );
    
    // Separate new and existing records
    const newRecords = [];
    const updateRecords = [];
    
    result.recordset.forEach(row => {
      const key = `${row.clinic}|${row.month}|${row.traffic_source}`;
      if (existingKeys.has(key)) {
        updateRecords.push(row);
      } else {
        newRecords.push(row);
      }
    });
    
    console.log(`📈 New records to insert: ${newRecords.length}`);
    console.log(`🔄 Existing records to update: ${updateRecords.length}`);
    
    // Insert new records
    if (newRecords.length > 0) {
      const { error: insertError } = await supabase
        .from('executive_monthly_reports')
        .insert(newRecords);
      
      if (insertError) {
        console.error('❌ Error inserting new records:', insertError.message);
      } else {
        console.log(`✅ Inserted ${newRecords.length} new records`);
      }
    }
    
    // Update existing records with new columns (if they were added)
    if (updateRecords.length > 0) {
      console.log('🔄 Updating existing records with new column data...');
      
      // Update in batches
      const batchSize = 100;
      let updated = 0;
      
      for (let i = 0; i < updateRecords.length; i += batchSize) {
        const batch = updateRecords.slice(i, i + batchSize);
        
        for (const record of batch) {
          const { error } = await supabase
            .from('executive_monthly_reports')
            .update({
              '%new_conversion': record['%new_conversion'],
              '%returning_conversion': record['%returning_conversion']
            })
            .eq('clinic', record.clinic)
            .eq('month', record.month)
            .eq('traffic_source', record.traffic_source);
          
          if (!error) updated++;
        }
      }
      
      console.log(`✅ Updated ${updated} records with new column data`);
    }
    
  } catch (error) {
    console.error('❌ Error syncing monthly reports:', error.message);
  }
}

async function migrateWeeklyReports(mssqlPool) {
  console.log('\n📊 Migrating executive_weekly_reports (currently empty)...');
  
  try {
    // Check if table is empty
    const { count } = await supabase
      .from('executive_weekly_reports')
      .select('*', { count: 'exact', head: true });
    
    if (count > 0) {
      console.log(`⚠️  Table already has ${count} records. Skipping to avoid duplicates.`);
      return;
    }
    
    // Get all data from MSSQL
    const result = await mssqlPool.request().query(`
      SELECT * FROM executive_report_new_week
      ORDER BY week DESC, clinic, traffic_source
    `);
    
    console.log(`📥 Found ${result.recordset.length} records to migrate`);
    
    // Migrate in batches
    const batchSize = 500;
    let migrated = 0;
    
    for (let i = 0; i < result.recordset.length; i += batchSize) {
      const batch = result.recordset.slice(i, i + batchSize);
      
      // Map column names
      const mappedBatch = batch.map(row => ({
        clinic: row.clinic,
        week: row.week,
        traffic_source: row.traffic_source,
        impressions: row.impressions,
        visits: row.visits,
        spend: row.spend,
        ltv: row.estimated_ltv_6m,
        roas: row.total_roas,
        leads: row.leads,
        leads_new: row.new_leads,
        leads_returning: row.returning_leads,
        conversion_rate: row['%total_conversion'],
        cac_total: row.cac_total,
        cac_new: row.cac_new,
        appointments: row.total_appointments,
        appointments_new: row.new_appointments,
        appointments_returning: row.returning_appointments,
        online_booking: row.online_booking,
        conversations: row.total_conversations,
        conversations_new: row.new_conversations,
        conversations_returning: row.returning_conversations
      }));
      
      const { error } = await supabase
        .from('executive_weekly_reports')
        .insert(mappedBatch);
      
      if (error) {
        console.error(`❌ Error inserting batch at offset ${i}:`, error.message);
      } else {
        migrated += batch.length;
        const progress = Math.round((migrated / result.recordset.length) * 100);
        process.stdout.write(`\r   Progress: ${progress}% (${migrated}/${result.recordset.length} rows)`);
      }
    }
    
    console.log(`\n✅ Successfully migrated ${migrated} records to executive_weekly_reports`);
    
  } catch (error) {
    console.error('❌ Error migrating weekly reports:', error.message);
  }
}

async function main() {
  console.log('🔄 Starting MSSQL to Supabase data sync');
  console.log('=' . repeat(50));
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('\n🔗 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Sync monthly reports (update existing and add new)
    await syncMonthlyReports(mssqlPool);
    
    // Migrate weekly reports (populate empty table)
    await migrateWeeklyReports(mssqlPool);
    
    console.log('\n✅ Data sync complete!');
    
    // Final verification
    console.log('\n📊 Final table status:');
    const tables = ['executive_monthly_reports', 'executive_weekly_reports'];
    
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      console.log(`   ${table}: ${count} rows`);
    }
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

// Run sync
main().catch(console.error);