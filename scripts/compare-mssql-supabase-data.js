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

async function comparePaidAds(mssqlPool) {
  console.log('\n📊 Comparing paid_ads table...\n');
  
  // Get MSSQL data
  const mssqlResult = await mssqlPool.request().query(`
    SELECT * FROM paid_ads 
    ORDER BY clinic, month, traffic_source, campaign
  `);
  const mssqlRecords = mssqlResult.recordset;
  
  // Get Supabase data - need to get all records
  let allSupabaseRecords = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('paid_ads')
      .select('*')
      .order('clinic')
      .order('month')
      .order('traffic_source')
      .order('campaign')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching Supabase data:', error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    allSupabaseRecords = allSupabaseRecords.concat(data);
    offset += limit;
    
    if (data.length < limit) break;
  }
  
  console.log(`MSSQL records: ${mssqlRecords.length}`);
  console.log(`Supabase records: ${allSupabaseRecords.length}`);
  
  if (mssqlRecords.length !== allSupabaseRecords.length) {
    console.log('❌ Record count mismatch!');
    return false;
  }
  
  // Compare each record
  let mismatches = 0;
  const fields = [
    'clinic', 'traffic_source', 'campaign', 'impressions', 'visits', 'spend',
    'total_appointments', 'new_appointments', 'returning_appointments',
    'avg_appointment_rev', 'appointment_est_revenue', 'new_appointment_est_6m_revenue',
    'total_conversations', 'new_conversations', 'returning_conversations',
    'conversation_rate', 'appointment_rate', 'ctr'
  ];
  
  for (let i = 0; i < mssqlRecords.length; i++) {
    const mssql = mssqlRecords[i];
    const supabase = allSupabaseRecords[i];
    
    // Compare dates separately (handle timezone)
    const mssqlDate = new Date(mssql.month).toISOString().split('T')[0];
    const supabaseDate = new Date(supabase.month).toISOString().split('T')[0];
    
    if (mssqlDate !== supabaseDate) {
      console.log(`\n❌ Date mismatch at row ${i + 1}:`);
      console.log(`  MSSQL: ${mssqlDate}`);
      console.log(`  Supabase: ${supabaseDate}`);
      mismatches++;
    }
    
    // Compare other fields
    for (const field of fields) {
      const mssqlValue = mssql[field];
      const supabaseValue = supabase[field];
      
      // Handle null comparisons
      if (mssqlValue === null && supabaseValue === null) continue;
      
      // Handle float comparisons with small tolerance
      if (typeof mssqlValue === 'number' && typeof supabaseValue === 'number') {
        if (Math.abs(mssqlValue - supabaseValue) > 0.0001) {
          console.log(`\n❌ Value mismatch at row ${i + 1}, field ${field}:`);
          console.log(`  MSSQL: ${mssqlValue}`);
          console.log(`  Supabase: ${supabaseValue}`);
          console.log(`  Record: ${mssql.clinic} | ${mssqlDate} | ${mssql.traffic_source}`);
          mismatches++;
        }
      } else if (mssqlValue !== supabaseValue) {
        console.log(`\n❌ Value mismatch at row ${i + 1}, field ${field}:`);
        console.log(`  MSSQL: ${mssqlValue}`);
        console.log(`  Supabase: ${supabaseValue}`);
        console.log(`  Record: ${mssql.clinic} | ${mssqlDate} | ${mssql.traffic_source}`);
        mismatches++;
      }
    }
  }
  
  if (mismatches === 0) {
    console.log('✅ All records match perfectly!');
    return true;
  } else {
    console.log(`\n❌ Found ${mismatches} mismatches`);
    return false;
  }
}

async function compareSeoChannels(mssqlPool) {
  console.log('\n📊 Comparing seo_channels table...\n');
  
  // Get MSSQL data
  const mssqlResult = await mssqlPool.request().query(`
    SELECT * FROM seo_channels 
    ORDER BY clinic, month, traffic_source
  `);
  const mssqlRecords = mssqlResult.recordset;
  
  // Get all Supabase data
  let allSupabaseRecords = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('seo_channels')
      .select('*')
      .order('clinic')
      .order('month')
      .order('traffic_source')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching Supabase data:', error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    allSupabaseRecords = allSupabaseRecords.concat(data);
    offset += limit;
    
    if (data.length < limit) break;
  }
  
  console.log(`MSSQL records: ${mssqlRecords.length}`);
  console.log(`Supabase records: ${allSupabaseRecords.length}`);
  
  if (mssqlRecords.length !== allSupabaseRecords.length) {
    console.log('❌ Record count mismatch!');
    return false;
  }
  
  // Compare each record
  let mismatches = 0;
  const fields = [
    'clinic', 'traffic_source', 'impressions', 'visits',
    'total_appointments', 'new_appointments', 'returning_appointments',
    'avg_appointment_rev', 'appointment_est_revenue', 'new_appointment_est_6m_revenue',
    'total_conversations', 'new_conversations', 'returning_conversations',
    'conversation_rate', 'appointment_rate', 'ctr'
  ];
  
  for (let i = 0; i < mssqlRecords.length; i++) {
    const mssql = mssqlRecords[i];
    const supabase = allSupabaseRecords[i];
    
    // Compare dates separately (handle timezone)
    const mssqlDate = new Date(mssql.month).toISOString().split('T')[0];
    const supabaseDate = new Date(supabase.month).toISOString().split('T')[0];
    
    if (mssqlDate !== supabaseDate) {
      console.log(`\n❌ Date mismatch at row ${i + 1}:`);
      console.log(`  MSSQL: ${mssqlDate}`);
      console.log(`  Supabase: ${supabaseDate}`);
      mismatches++;
    }
    
    // Compare other fields
    for (const field of fields) {
      const mssqlValue = mssql[field];
      const supabaseValue = supabase[field];
      
      // Handle null comparisons
      if (mssqlValue === null && supabaseValue === null) continue;
      
      // Handle float comparisons with small tolerance
      if (typeof mssqlValue === 'number' && typeof supabaseValue === 'number') {
        if (Math.abs(mssqlValue - supabaseValue) > 0.0001) {
          console.log(`\n❌ Value mismatch at row ${i + 1}, field ${field}:`);
          console.log(`  MSSQL: ${mssqlValue}`);
          console.log(`  Supabase: ${supabaseValue}`);
          console.log(`  Record: ${mssql.clinic} | ${mssqlDate} | ${mssql.traffic_source}`);
          mismatches++;
        }
      } else if (mssqlValue !== supabaseValue) {
        console.log(`\n❌ Value mismatch at row ${i + 1}, field ${field}:`);
        console.log(`  MSSQL: ${mssqlValue}`);
        console.log(`  Supabase: ${supabaseValue}`);
        console.log(`  Record: ${mssql.clinic} | ${mssqlDate} | ${mssql.traffic_source}`);
        mismatches++;
      }
    }
  }
  
  if (mismatches === 0) {
    console.log('✅ All records match perfectly!');
    return true;
  } else {
    console.log(`\n❌ Found ${mismatches} mismatches`);
    return false;
  }
}

async function compareAggregates(mssqlPool) {
  console.log('\n📊 Comparing aggregate statistics...\n');
  
  // Compare paid_ads aggregates
  console.log('PAID_ADS AGGREGATES:');
  
  // Sum of numeric fields
  const paidAdsFields = ['impressions', 'visits', 'spend', 'total_appointments', 
    'new_appointments', 'returning_appointments', 'total_conversations'];
  
  for (const field of paidAdsFields) {
    const mssqlSum = await mssqlPool.request().query(
      `SELECT SUM(CAST(${field} as FLOAT)) as total FROM paid_ads WHERE ${field} IS NOT NULL`
    );
    
    const { data: supabaseSum } = await supabase
      .from('paid_ads')
      .select(field)
      .not(field, 'is', null);
    
    const supabaseTotal = supabaseSum.reduce((sum, row) => sum + (row[field] || 0), 0);
    const mssqlTotal = mssqlSum.recordset[0].total || 0;
    
    if (Math.abs(mssqlTotal - supabaseTotal) > 0.01) {
      console.log(`❌ ${field}: MSSQL=${mssqlTotal.toFixed(2)}, Supabase=${supabaseTotal.toFixed(2)}`);
    } else {
      console.log(`✅ ${field}: ${mssqlTotal.toFixed(2)}`);
    }
  }
  
  // Compare seo_channels aggregates
  console.log('\nSEO_CHANNELS AGGREGATES:');
  
  const seoFields = ['impressions', 'visits', 'total_appointments', 
    'new_appointments', 'returning_appointments', 'total_conversations'];
  
  for (const field of seoFields) {
    const mssqlSum = await mssqlPool.request().query(
      `SELECT SUM(CAST(${field} as FLOAT)) as total FROM seo_channels WHERE ${field} IS NOT NULL`
    );
    
    const { data: supabaseSum } = await supabase
      .from('seo_channels')
      .select(field)
      .not(field, 'is', null);
    
    const supabaseTotal = supabaseSum.reduce((sum, row) => sum + (row[field] || 0), 0);
    const mssqlTotal = mssqlSum.recordset[0].total || 0;
    
    if (Math.abs(mssqlTotal - supabaseTotal) > 0.01) {
      console.log(`❌ ${field}: MSSQL=${mssqlTotal.toFixed(2)}, Supabase=${supabaseTotal.toFixed(2)}`);
    } else {
      console.log(`✅ ${field}: ${mssqlTotal.toFixed(2)}`);
    }
  }
}

async function main() {
  console.log('🔍 Starting comprehensive data comparison between MSSQL and Supabase\n');
  
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    console.log('Connecting to MSSQL...');
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL');
    
    // Compare tables
    const paidAdsMatch = await comparePaidAds(mssqlPool);
    const seoChannelsMatch = await compareSeoChannels(mssqlPool);
    
    // Compare aggregates
    await compareAggregates(mssqlPool);
    
    // Final summary
    console.log('\n\n🎯 FINAL SUMMARY:');
    console.log('================');
    
    if (paidAdsMatch && seoChannelsMatch) {
      console.log('✅ ALL DATA MATCHES PERFECTLY!');
      console.log('✅ Migration verified successfully');
    } else {
      console.log('❌ Data discrepancies found');
      console.log(`   paid_ads: ${paidAdsMatch ? '✅ Match' : '❌ Mismatch'}`);
      console.log(`   seo_channels: ${seoChannelsMatch ? '✅ Match' : '❌ Mismatch'}`);
    }
    
  } catch (err) {
    console.error('\n❌ Comparison failed:', err);
    process.exit(1);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
      console.log('\n👋 Closed MSSQL connection');
    }
  }
}

// Run the comparison
main();