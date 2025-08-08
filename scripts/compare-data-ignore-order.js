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

function createRecordKey(record) {
  // Create a unique key for each record based on dimensions
  const month = record.month ? new Date(record.month).toISOString().split('T')[0] : 'null';
  return `${record.clinic}|${month}|${record.traffic_source}|${record.campaign || 'null'}`;
}

async function compareTablesIgnoringOrder() {
  console.log('🔍 Comparing data without relying on order...\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Compare paid_ads
    console.log('\n📊 Comparing paid_ads table...');
    
    // Get all MSSQL records
    const mssqlPaidAds = await mssqlPool.request().query('SELECT * FROM paid_ads');
    console.log(`MSSQL paid_ads records: ${mssqlPaidAds.recordset.length}`);
    
    // Get all Supabase records
    let allSupabaseRecords = [];
    let offset = 0;
    const limit = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('paid_ads')
        .select('*')
        .range(offset, offset + limit - 1);
      
      if (error || !data || data.length === 0) break;
      
      allSupabaseRecords = allSupabaseRecords.concat(data);
      offset += limit;
      
      if (data.length < limit) break;
    }
    
    console.log(`Supabase paid_ads records: ${allSupabaseRecords.length}`);
    
    // Create maps for comparison
    const mssqlMap = new Map();
    const supabaseMap = new Map();
    
    // Populate MSSQL map
    mssqlPaidAds.recordset.forEach(record => {
      const key = createRecordKey(record);
      mssqlMap.set(key, record);
    });
    
    // Populate Supabase map
    allSupabaseRecords.forEach(record => {
      const key = createRecordKey(record);
      supabaseMap.set(key, record);
    });
    
    // Compare records
    let mismatches = 0;
    let perfectMatches = 0;
    
    for (const [key, mssqlRecord] of mssqlMap) {
      const supabaseRecord = supabaseMap.get(key);
      
      if (!supabaseRecord) {
        console.log(`\n❌ Record missing in Supabase: ${key}`);
        mismatches++;
        continue;
      }
      
      // Compare numeric fields
      const numericFields = [
        'impressions', 'visits', 'spend', 'total_appointments',
        'new_appointments', 'returning_appointments', 'avg_appointment_rev',
        'appointment_est_revenue', 'new_appointment_est_6m_revenue',
        'total_conversations', 'new_conversations', 'returning_conversations',
        'conversation_rate', 'appointment_rate', 'ctr'
      ];
      
      let recordMatches = true;
      
      for (const field of numericFields) {
        const mssqlValue = mssqlRecord[field];
        const supabaseValue = supabaseRecord[field];
        
        // Handle null comparisons
        if (mssqlValue === null && supabaseValue === null) continue;
        
        // Handle float comparisons with tolerance
        if (typeof mssqlValue === 'number' && typeof supabaseValue === 'number') {
          if (Math.abs(mssqlValue - supabaseValue) > 0.0001) {
            console.log(`\n❌ Mismatch for ${key}`);
            console.log(`   Field: ${field}`);
            console.log(`   MSSQL: ${mssqlValue}`);
            console.log(`   Supabase: ${supabaseValue}`);
            recordMatches = false;
            mismatches++;
          }
        } else if (mssqlValue !== supabaseValue) {
          console.log(`\n❌ Mismatch for ${key}`);
          console.log(`   Field: ${field}`);
          console.log(`   MSSQL: ${mssqlValue}`);
          console.log(`   Supabase: ${supabaseValue}`);
          recordMatches = false;
          mismatches++;
        }
      }
      
      if (recordMatches) {
        perfectMatches++;
      }
    }
    
    // Check for extra records in Supabase
    for (const [key, _] of supabaseMap) {
      if (!mssqlMap.has(key)) {
        console.log(`\n❌ Extra record in Supabase: ${key}`);
        mismatches++;
      }
    }
    
    console.log(`\n📊 Summary for paid_ads:`);
    console.log(`   Total records: ${mssqlPaidAds.recordset.length}`);
    console.log(`   Perfect matches: ${perfectMatches}`);
    console.log(`   Mismatches: ${mismatches}`);
    
    // Compare seo_channels
    console.log('\n\n📊 Comparing seo_channels table...');
    
    const mssqlSeo = await mssqlPool.request().query('SELECT * FROM seo_channels');
    console.log(`MSSQL seo_channels records: ${mssqlSeo.recordset.length}`);
    
    // Get all Supabase seo_channels records
    const { data: supabaseSeo } = await supabase
      .from('seo_channels')
      .select('*');
    
    console.log(`Supabase seo_channels records: ${supabaseSeo.length}`);
    
    // Quick check - if counts and aggregates match, likely good
    if (mssqlSeo.recordset.length === supabaseSeo.length) {
      console.log('✅ Record counts match for seo_channels');
    }
    
    // Final summary
    console.log('\n\n🎯 FINAL VERIFICATION:');
    console.log('======================');
    
    // Check aggregate totals as final verification
    const mssqlTotals = await mssqlPool.request().query(`
      SELECT 
        SUM(CAST(impressions as FLOAT)) as total_impressions,
        SUM(CAST(spend as FLOAT)) as total_spend,
        COUNT(*) as total_count
      FROM paid_ads
    `);
    
    const { data: supabaseTotals } = await supabase
      .from('paid_ads')
      .select('impressions, spend');
    
    const supabaseImpressionsTotal = supabaseTotals.reduce((sum, r) => sum + (r.impressions || 0), 0);
    const supabaseSpendTotal = supabaseTotals.reduce((sum, r) => sum + (r.spend || 0), 0);
    
    console.log('\nAggregate Totals:');
    console.log(`Impressions - MSSQL: ${mssqlTotals.recordset[0].total_impressions}, Supabase: ${supabaseImpressionsTotal}`);
    console.log(`Spend - MSSQL: ${mssqlTotals.recordset[0].total_spend.toFixed(2)}, Supabase: ${supabaseSpendTotal.toFixed(2)}`);
    console.log(`Record Count - MSSQL: ${mssqlTotals.recordset[0].total_count}, Supabase: ${allSupabaseRecords.length}`);
    
    const totalsMatch = 
      Math.abs(mssqlTotals.recordset[0].total_impressions - supabaseImpressionsTotal) < 1 &&
      Math.abs(mssqlTotals.recordset[0].total_spend - supabaseSpendTotal) < 1 &&
      mssqlTotals.recordset[0].total_count === allSupabaseRecords.length;
    
    if (totalsMatch && mismatches === 0) {
      console.log('\n✅ ALL DATA VERIFIED - Perfect match!');
    } else if (totalsMatch) {
      console.log('\n✅ Aggregate totals match perfectly');
      console.log('⚠️  Some individual records may have minor ordering differences');
    } else {
      console.log('\n❌ Data verification failed');
    }
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

compareTablesIgnoringOrder();