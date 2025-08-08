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

async function remigratePaidAds() {
  console.log('🔄 Re-migrating paid_ads table with proper ordering...\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Get all data from MSSQL with specific ordering
    console.log('\nFetching data from MSSQL...');
    const result = await mssqlPool.request().query(`
      SELECT * FROM paid_ads 
      ORDER BY clinic, month, traffic_source, campaign
    `);
    const records = result.recordset;
    
    console.log(`Found ${records.length} records in MSSQL`);
    
    // Clear existing data in Supabase
    console.log('\nClearing existing data in Supabase...');
    await supabase.from('paid_ads').delete().gte('clinic', '');
    
    // Insert data in exact order
    console.log('\nInserting data in exact order...');
    const batchSize = 50; // Smaller batches to maintain order
    let successCount = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Transform data - handle nulls and format dates
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
        avg_appointment_rev: record.avg_appointment_rev ?? null,
        appointment_est_revenue: record.appointment_est_revenue ?? null,
        new_appointment_est_6m_revenue: record.new_appointment_est_6m_revenue ?? null,
        total_conversations: record.total_conversations ?? null,
        new_conversations: record.new_conversations ?? null,
        returning_conversations: record.returning_conversations ?? null,
        conversation_rate: record.conversation_rate ?? null,
        appointment_rate: record.appointment_rate ?? null,
        ctr: record.ctr ?? null
      }));
      
      const { data, error } = await supabase
        .from('paid_ads')
        .insert(transformedBatch);
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }
      
      successCount += batch.length;
      if (successCount % 200 === 0 || successCount === records.length) {
        console.log(`Progress: ${successCount}/${records.length} records`);
      }
    }
    
    // Verify count
    const { count } = await supabase
      .from('paid_ads')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Successfully re-migrated ${count} records to Supabase paid_ads table`);
    
    // Double-check the problematic records
    console.log('\nVerifying problematic records...');
    const { data: checkRecords } = await supabase
      .from('paid_ads')
      .select('campaign, impressions, visits, spend')
      .eq('clinic', 'alluraderm.com')
      .eq('traffic_source', 'social ads')
      .gte('month', '2025-05-01')
      .lt('month', '2025-06-01')
      .in('campaign', ['BR_AD_Lead_Schedule - OFF', 'BR_AD_Lead_Schedule - Off'])
      .order('campaign');
    
    console.log('Alluraderm May 2025 social ads records:');
    checkRecords.forEach(r => {
      console.log(`- ${r.campaign}: impressions=${r.impressions}, visits=${r.visits}, spend=${r.spend}`);
    });
    
  } catch (err) {
    console.error('\n❌ Re-migration failed:', err);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n👋 Closed MSSQL connection');
    }
  }
}

// Run the re-migration
remigratePaidAds();