const mssql = require('mssql');
const { createClient } = require('@supabase/supabase-js');

// MSSQL Configuration
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
  requestTimeout: 60000
};

// Supabase Configuration
const supabase = createClient(
  'https://igzswopyyggvelncjmuh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAxMzEzMCwiZXhwIjoyMDY5NTg5MTMwfQ.UX5kR9UnLARsZRJzXXtmsvtV0xyw_KIjivxFxf5FMKw'
);

async function populateWeeklyReports() {
  let mssqlPool;
  
  try {
    console.log('📊 Starting weekly reports population...\n');
    
    // Connect to MSSQL
    console.log('🔄 Connecting to MSSQL...');
    mssqlPool = await mssql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Fetch all weekly data from MSSQL
    console.log('📥 Fetching weekly data from MSSQL...');
    const mssqlResult = await mssqlPool.request().query(`
        SELECT 
          clinic,
          week,
          traffic_source,
          impressions,
          visits,
          spend,
          estimated_ltv_6m,
          total_roas,
          new_roas,
          leads,
          new_leads,
          returning_leads,
          [%total_conversion] as total_conversion,
          [%new_conversion] as new_conversion,
          [%returning_conversion] as returning_conversion,
          cac_total,
          cac_new,
          total_estimated_revenue,
          new_estimated_revenue,
          total_appointments,
          new_appointments,
          returning_appointments,
          online_booking,
          total_conversations,
          new_conversations,
          returning_conversations
        FROM executive_report_new_week
        ORDER BY week, clinic, traffic_source
      `);
    
    console.log(`✅ Found ${mssqlResult.recordset.length} weekly records\n`);
    
    // Insert records in batches
    const batchSize = 100;
    let insertedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < mssqlResult.recordset.length; i += batchSize) {
      const batch = mssqlResult.recordset.slice(i, i + batchSize);
      
      console.log(`📝 Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)...`);
      
      // Map MSSQL columns to Supabase columns
      const mappedBatch = batch.map(record => ({
        clinic: record.clinic,
        week: new Date(record.week).toISOString().split('T')[0],
        traffic_source: record.traffic_source,
        impressions: record.impressions,
        visits: record.visits,
        spend: record.spend,
        estimated_ltv_6m: record.estimated_ltv_6m,
        roas: record.total_roas, // Map total_roas to roas
        new_roas: record.new_roas,
        leads: record.leads,
        new_leads: record.new_leads,
        returning_leads: record.returning_leads,
        total_conversion: record.total_conversion,
        new_conversion: record.new_conversion,
        returning_conversion: record.returning_conversion,
        cac_total: record.cac_total,
        cac_new: record.cac_new,
        total_estimated_revenue: record.total_estimated_revenue,
        new_estimated_revenue: record.new_estimated_revenue,
        appointments: record.total_appointments, // Map total_appointments to appointments
        new_appointments: record.new_appointments,
        returning_appointments: record.returning_appointments,
        online_booking: record.online_booking,
        conversations: record.total_conversations, // Map total_conversations to conversations
        new_conversations: record.new_conversations,
        returning_conversations: record.returning_conversations
      }));
      
      // Insert batch
      const { data, error } = await supabase
        .from('executive_weekly_reports')
        .insert(mappedBatch);
      
      if (error) {
        console.error(`❌ Error inserting batch:`, error);
        errorCount += batch.length;
      } else {
        insertedCount += batch.length;
      }
      
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed\n`);
    }
    
    console.log(`✅ Successfully inserted ${insertedCount} weekly records`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} records failed to insert`);
    }
    
    // Verify the inserts
    console.log('\n📊 Verifying inserts...');
    const { count } = await supabase
      .from('executive_weekly_reports')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ ${count} records now in executive_weekly_reports\n`);
    
    // Show a sample of inserted data
    const { data: sampleData } = await supabase
      .from('executive_weekly_reports')
      .select('clinic, week, traffic_source, impressions, visits, roas, appointments')
      .order('week', { ascending: false })
      .limit(5);
    
    console.log('📋 Sample of inserted records:');
    console.log(JSON.stringify(sampleData, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n🔒 MSSQL connection closed');
    }
  }
}

// Run the population
populateWeeklyReports();