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

async function investigateMismatch() {
  let mssqlPool;
  
  try {
    // Connect to MSSQL
    mssqlPool = await sql.connect(mssqlConfig);
    console.log('✅ Connected to MSSQL\n');
    
    // Query specific problematic records from MSSQL
    console.log('📊 MSSQL Records for alluraderm.com, May 2025, social ads:');
    const mssqlResult = await mssqlPool.request().query(`
      SELECT clinic, month, traffic_source, campaign, impressions, visits, spend, ctr
      FROM paid_ads 
      WHERE clinic = 'alluraderm.com' 
      AND MONTH(month) = 5 
      AND YEAR(month) = 2025
      AND traffic_source = 'social ads'
      ORDER BY campaign
    `);
    
    console.log('Found', mssqlResult.recordset.length, 'records in MSSQL:');
    mssqlResult.recordset.forEach(r => {
      console.log(`- Campaign: "${r.campaign}" | Impressions: ${r.impressions} | Visits: ${r.visits} | Spend: ${r.spend} | CTR: ${r.ctr}`);
    });
    
    // Query same records from Supabase
    console.log('\n📊 Supabase Records for alluraderm.com, May 2025, social ads:');
    const { data: supabaseRecords } = await supabase
      .from('paid_ads')
      .select('clinic, month, traffic_source, campaign, impressions, visits, spend, ctr')
      .eq('clinic', 'alluraderm.com')
      .eq('traffic_source', 'social ads')
      .gte('month', '2025-05-01')
      .lt('month', '2025-06-01')
      .order('campaign');
    
    console.log('Found', supabaseRecords.length, 'records in Supabase:');
    supabaseRecords.forEach(r => {
      console.log(`- Campaign: "${r.campaign}" | Impressions: ${r.impressions} | Visits: ${r.visits} | Spend: ${r.spend} | CTR: ${r.ctr}`);
    });
    
    // Look for duplicate campaigns
    console.log('\n📊 Checking for potential duplicates or case sensitivity issues:');
    
    const campaigns = mssqlResult.recordset.map(r => r.campaign);
    const uniqueCampaigns = [...new Set(campaigns)];
    
    console.log(`\nTotal campaigns: ${campaigns.length}`);
    console.log(`Unique campaigns: ${uniqueCampaigns.length}`);
    
    if (campaigns.length !== uniqueCampaigns.length) {
      console.log('\n⚠️  Found duplicate campaigns!');
    }
    
    // Check case variations
    console.log('\n📊 Checking case variations:');
    uniqueCampaigns.forEach(campaign => {
      const variations = campaigns.filter(c => c.toLowerCase() === campaign.toLowerCase());
      if (variations.length > 1) {
        console.log(`Found case variations for: ${variations.join(' | ')}`);
      }
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (mssqlPool) {
      await mssqlPool.close();
    }
  }
}

investigateMismatch();