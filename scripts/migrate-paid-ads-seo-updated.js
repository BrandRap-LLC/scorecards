const sql = require('mssql');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// MSSQL config
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

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
  console.log('✅ Supabase connection successful\n');
  return true;
}

async function migratePaidAds(mssqlPool) {
  console.log('\n📊 Migrating paid_ads table (without conversation metrics)...');
  
  try {
    // Get all data from MSSQL
    const result = await mssqlPool.request().query('SELECT * FROM paid_ads ORDER BY month, clinic, traffic_source');
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL paid_ads table`);
    
    if (records.length === 0) {
      console.log('No records to migrate');
      return;
    }
    
    // First, try to check if table exists by querying it
    const { error: checkError } = await supabase
      .from('paid_ads')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table paid_ads does not exist. Please create it first in Supabase dashboard with this SQL:');
      console.log(`
CREATE TABLE paid_ads (
  clinic text,
  month timestamp,
  traffic_source text,
  campaign text,
  impressions float,
  visits float,
  spend float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  appointment_rate float,
  ctr float
);
      `);
      return;
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('paid_ads').delete().gte('clinic', '');
    
    // Insert data in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data - handle nulls and format dates - EXCLUDING conversation metrics
      const transformedBatch = batch.map(record => ({
        clinic: record.clinic || null,
        month: record.month ? new Date(record.month).toISOString() : null,
        traffic_source: record.traffic_source || null,
        campaign: record.campaign || null,
        impressions: record.impressions ?? null,
        visits: record.visits ?? null,
        spend: record.spend ?? null,
        total_appointments: record.total_appointments ?? null,
        new_appointments: record.new_appointments ?? null,
        returning_appointments: record.returning_appointments ?? null,
        appointment_est_revenue: record.appointment_est_revenue ?? null,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue ?? null,
        appointment_rate: record.appointment_rate ?? null,
        ctr: record.ctr ?? null
      }));
      
      const { data, error } = await supabase
        .from('paid_ads')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.log('Sample record that failed:', transformedBatch[0]);
        throw error;
      }
      
      successCount += batch.length;
      console.log(`Progress: ${successCount}/${records.length} records`);
    }
    
    // Verify count
    const { count } = await supabase
      .from('paid_ads')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Successfully migrated ${count} records to Supabase paid_ads table`);
    
  } catch (err) {
    console.error('Error migrating paid_ads:', err);
    throw err;
  }
}

async function migrateSeoChannels(mssqlPool) {
  console.log('\n📊 Migrating seo_channels table (without conversation metrics)...');
  
  try {
    // Get all data from MSSQL
    const result = await mssqlPool.request().query('SELECT * FROM seo_channels ORDER BY month, clinic, traffic_source');
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL seo_channels table`);
    
    if (records.length === 0) {
      console.log('No records to migrate');
      return;
    }
    
    // First, try to check if table exists by querying it
    const { error: checkError } = await supabase
      .from('seo_channels')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Table seo_channels does not exist. Please create it first in Supabase dashboard with this SQL:');
      console.log(`
CREATE TABLE seo_channels (
  clinic text,
  month timestamp,
  traffic_source text,
  impressions float,
  visits float,
  total_appointments float,
  new_appointments float,
  returning_appointments float,
  appointment_est_revenue float,
  new_appointment_est_6m_revenue float,
  appointment_rate float,
  ctr float
);
      `);
      return;
    }
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabase.from('seo_channels').delete().gte('clinic', '');
    
    // Insert data in batches
    const batchSize = 100;
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data - handle nulls and format dates - EXCLUDING conversation metrics
      const transformedBatch = batch.map(record => ({
        clinic: record.clinic || null,
        month: record.month ? new Date(record.month).toISOString() : null,
        traffic_source: record.traffic_source || null,
        impressions: record.impressions ?? null,
        visits: record.visits ?? null,
        total_appointments: record.total_appointments ?? null,
        new_appointments: record.new_appointments ?? null,
        returning_appointments: record.returning_appointments ?? null,
        appointment_est_revenue: record.appointment_est_revenue ?? null,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue ?? null,
        appointment_rate: record.appointment_rate ?? null,
        ctr: record.ctr ?? null
      }));
      
      const { data, error } = await supabase
        .from('seo_channels')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        console.log('Sample record that failed:', transformedBatch[0]);
        throw error;
      }
      
      successCount += batch.length;
      console.log(`Progress: ${successCount}/${records.length} records`);
    }
    
    // Verify count
    const { count } = await supabase
      .from('seo_channels')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Successfully migrated ${count} records to Supabase seo_channels table`);
    
  } catch (err) {
    console.error('Error migrating seo_channels:', err);
    throw err;
  }
}

async function main() {
  console.log('🚀 Starting Paid Ads and SEO Channels Data Migration\n');
  console.log('=' .repeat(60));
  console.log('⚠️  This script has been updated to EXCLUDE conversation metrics');
  console.log('=' .repeat(60) + '\n');
  
  // Test Supabase first
  const supabaseOk = await testSupabaseConnection();
  if (!supabaseOk) {
    console.error('❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('📊 Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL successfully\n');
    
    // Migrate tables
    await migratePaidAds(mssqlPool);
    await migrateSeoChannels(mssqlPool);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Note: The following columns were NOT migrated:');
    console.log('- total_conversations');
    console.log('- new_conversations');
    console.log('- returning_conversations');
    console.log('- avg_appointment_rev');
    console.log('- conversation_rate');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n📊 Closed MSSQL connection');
    }
  }
}

// Run the migration
main().catch(console.error);