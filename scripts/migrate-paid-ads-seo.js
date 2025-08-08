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

async function createTables() {
  console.log('📊 Creating tables in Supabase...\n');

  // Create paid_ads table
  const paidAdsTableSQL = `
    CREATE TABLE IF NOT EXISTS paid_ads (
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
      avg_appointment_rev float,
      appointment_est_revenue float,
      new_appointment_est_6m_revenue float,
      total_conversations float,
      new_conversations float,
      returning_conversations float,
      conversation_rate float,
      appointment_rate float,
      ctr float
    );
  `;

  // Create seo_channels table
  const seoChannelsTableSQL = `
    CREATE TABLE IF NOT EXISTS seo_channels (
      clinic text,
      month timestamp,
      traffic_source text,
      impressions float,
      visits float,
      total_appointments float,
      new_appointments float,
      returning_appointments float,
      avg_appointment_rev float,
      appointment_est_revenue float,
      new_appointment_est_6m_revenue float,
      total_conversations float,
      new_conversations float,
      returning_conversations float,
      conversation_rate float,
      appointment_rate float,
      ctr float
    );
  `;

  try {
    // Execute SQL to create tables
    const { error: paidAdsError } = await supabase.rpc('exec_sql', { sql_query: paidAdsTableSQL });
    if (paidAdsError && !paidAdsError.message.includes('already exists')) {
      console.error('Error creating paid_ads table:', paidAdsError);
      
      // Try direct SQL approach
      console.log('Attempting to create paid_ads table via direct SQL...');
      const { data, error } = await supabase.from('paid_ads').select('*').limit(1);
      if (error && error.code === '42P01') {
        // Table doesn't exist, create it via API
        console.log('Table does not exist. Please create it manually in Supabase dashboard.');
      }
    } else {
      console.log('✅ paid_ads table created/verified');
    }

    const { error: seoError } = await supabase.rpc('exec_sql', { sql_query: seoChannelsTableSQL });
    if (seoError && !seoError.message.includes('already exists')) {
      console.error('Error creating seo_channels table:', seoError);
      
      // Try direct SQL approach
      console.log('Attempting to create seo_channels table via direct SQL...');
      const { data, error } = await supabase.from('seo_channels').select('*').limit(1);
      if (error && error.code === '42P01') {
        // Table doesn't exist, create it via API
        console.log('Table does not exist. Please create it manually in Supabase dashboard.');
      }
    } else {
      console.log('✅ seo_channels table created/verified');
    }
  } catch (err) {
    console.log('Note: Tables might need to be created manually in Supabase dashboard');
    console.log('Continuing with migration attempt...\n');
  }
}

async function migratePaidAds(mssqlPool) {
  console.log('\n📊 Migrating paid_ads data...');
  
  try {
    // Get all data from MSSQL
    const result = await mssqlPool.request().query('SELECT * FROM paid_ads');
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL paid_ads table`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('paid_ads')
      .delete()
      .neq('clinic', '');
    
    if (deleteError) {
      console.log('Note: Could not clear existing data:', deleteError.message);
    }
    
    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data
      const transformedBatch = batch.map(record => ({
        clinic: record.clinic,
        month: record.month,
        traffic_source: record.traffic_source,
        campaign: record.campaign,
        impressions: record.impressions,
        visits: record.visits,
        spend: record.spend,
        total_appointments: record.total_appointments,
        new_appointments: record.new_appointments,
        returning_appointments: record.returning_appointments,
        avg_appointment_rev: record.avg_appointment_rev,
        appointment_est_revenue: record.appointment_est_revenue,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue,
        total_conversations: record.total_conversations,
        new_conversations: record.new_conversations,
        returning_conversations: record.returning_conversations,
        conversation_rate: record.conversation_rate,
        appointment_rate: record.appointment_rate,
        ctr: record.ctr
      }));
      
      const { error } = await supabase
        .from('paid_ads')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(records.length / batchSize)}`);
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
  console.log('\n📊 Migrating seo_channels data...');
  
  try {
    // Get all data from MSSQL
    const result = await mssqlPool.request().query('SELECT * FROM seo_channels');
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL seo_channels table`);
    
    // Clear existing data in Supabase
    const { error: deleteError } = await supabase
      .from('seo_channels')
      .delete()
      .neq('clinic', '');
    
    if (deleteError) {
      console.log('Note: Could not clear existing data:', deleteError.message);
    }
    
    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data
      const transformedBatch = batch.map(record => ({
        clinic: record.clinic,
        month: record.month,
        traffic_source: record.traffic_source,
        impressions: record.impressions,
        visits: record.visits,
        total_appointments: record.total_appointments,
        new_appointments: record.new_appointments,
        returning_appointments: record.returning_appointments,
        avg_appointment_rev: record.avg_appointment_rev,
        appointment_est_revenue: record.appointment_est_revenue,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue,
        total_conversations: record.total_conversations,
        new_conversations: record.new_conversations,
        returning_conversations: record.returning_conversations,
        conversation_rate: record.conversation_rate,
        appointment_rate: record.appointment_rate,
        ctr: record.ctr
      }));
      
      const { error } = await supabase
        .from('seo_channels')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        throw error;
      }
      
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(records.length / batchSize)}`);
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
  console.log('🚀 Starting migration of paid_ads and seo_channels tables\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Create tables in Supabase
    await createTables();
    
    // Migrate data
    await migratePaidAds(mssqlPool);
    await migrateSeoChannels(mssqlPool);
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n👋 Closed MSSQL connection');
    }
  }
}

// Run the migration
main();