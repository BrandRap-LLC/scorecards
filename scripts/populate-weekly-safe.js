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
    console.log('📊 Starting weekly reports population (safe mode)...\n');
    
    // Connect to MSSQL
    console.log('🔄 Connecting to MSSQL...');
    mssqlPool = await mssql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // First, let's check what columns we need by testing with one record
    console.log('🔍 Testing table structure with single record...');
    const testResult = await mssqlPool.request().query(`
      SELECT TOP 1 * FROM executive_report_new_week
    `);
    
    if (testResult.recordset.length > 0) {
      // Try inserting a test record with basic fields first
      const testRecord = {
        clinic: testResult.recordset[0].clinic,
        week: new Date(testResult.recordset[0].week).toISOString().split('T')[0],
        traffic_source: testResult.recordset[0].traffic_source,
        impressions: testResult.recordset[0].impressions,
        visits: testResult.recordset[0].visits,
        spend: testResult.recordset[0].spend,
        leads: testResult.recordset[0].leads,
        appointments: testResult.recordset[0].total_appointments,
        conversations: testResult.recordset[0].total_conversations
      };
      
      const { data: testData, error: testError } = await supabase
        .from('executive_weekly_reports')
        .insert(testRecord);
      
      if (testError) {
        console.log('Test insert failed with basic fields:', testError.message);
        return;
      }
      
      console.log('✅ Test insert successful with basic fields\n');
      
      // Delete test record
      await supabase
        .from('executive_weekly_reports')
        .delete()
        .eq('clinic', testRecord.clinic)
        .eq('week', testRecord.week)
        .eq('traffic_source', testRecord.traffic_source);
    }
    
    // Now fetch all data
    console.log('📥 Fetching all weekly data from MSSQL...');
    const mssqlResult = await mssqlPool.request().query(`
      SELECT * FROM executive_report_new_week
      ORDER BY week, clinic, traffic_source
    `);
    
    console.log(`✅ Found ${mssqlResult.recordset.length} weekly records\n`);
    
    // Insert records in batches with only the fields that exist
    const batchSize = 100;
    let insertedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < mssqlResult.recordset.length; i += batchSize) {
      const batch = mssqlResult.recordset.slice(i, i + batchSize);
      
      console.log(`📝 Processing batch ${Math.floor(i/batchSize) + 1} (${batch.length} records)...`);
      
      // Map only the fields we know exist
      const mappedBatch = batch.map(record => {
        const mapped = {
          clinic: record.clinic,
          week: new Date(record.week).toISOString().split('T')[0],
          traffic_source: record.traffic_source,
          impressions: record.impressions || 0,
          visits: record.visits || 0,
          spend: record.spend || 0,
          leads: record.leads || 0,
          appointments: record.total_appointments || 0,
          conversations: record.total_conversations || 0
        };
        
        // Try to include additional fields if they exist
        if (record.estimated_ltv_6m !== undefined) mapped.estimated_ltv_6m = record.estimated_ltv_6m;
        if (record.total_roas !== undefined) mapped.roas = record.total_roas;
        if (record.new_leads !== undefined) mapped.new_leads = record.new_leads;
        if (record.returning_leads !== undefined) mapped.returning_leads = record.returning_leads;
        if (record['%total_conversion'] !== undefined) mapped.total_conversion = record['%total_conversion'];
        if (record['%new_conversion'] !== undefined) mapped.new_conversion = record['%new_conversion'];
        if (record['%returning_conversion'] !== undefined) mapped.returning_conversion = record['%returning_conversion'];
        if (record.cac_total !== undefined) mapped.cac_total = record.cac_total;
        if (record.cac_new !== undefined) mapped.cac_new = record.cac_new;
        if (record.total_estimated_revenue !== undefined) mapped.total_estimated_revenue = record.total_estimated_revenue;
        if (record.new_estimated_revenue !== undefined) mapped.new_estimated_revenue = record.new_estimated_revenue;
        if (record.new_appointments !== undefined) mapped.new_appointments = record.new_appointments;
        if (record.returning_appointments !== undefined) mapped.returning_appointments = record.returning_appointments;
        if (record.online_booking !== undefined) mapped.online_booking = record.online_booking;
        if (record.new_roas !== undefined) mapped.new_roas = record.new_roas;
        
        return mapped;
      });
      
      // Insert batch
      const { data, error } = await supabase
        .from('executive_weekly_reports')
        .insert(mappedBatch);
      
      if (error) {
        console.error(`❌ Error inserting batch:`, error.message);
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
      .select('*')
      .order('week', { ascending: false })
      .limit(3);
    
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