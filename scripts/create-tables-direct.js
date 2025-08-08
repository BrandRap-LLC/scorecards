const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function executeSql(sql) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`
    },
    body: JSON.stringify({ sql_query: sql })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL execution failed: ${error}`);
  }
  
  return response.json();
}

async function createTables() {
  console.log('📊 Creating tables in Supabase...\n');
  
  try {
    // Create paid_ads table
    const paidAdsSQL = `
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
    
    await executeSql(paidAdsSQL);
    console.log('✅ paid_ads table created');
    
    // Create seo_channels table
    const seoChannelsSQL = `
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
    
    await executeSql(seoChannelsSQL);
    console.log('✅ seo_channels table created');
    
    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_paid_ads_clinic ON paid_ads(clinic);
      CREATE INDEX IF NOT EXISTS idx_paid_ads_month ON paid_ads(month);
      CREATE INDEX IF NOT EXISTS idx_paid_ads_traffic_source ON paid_ads(traffic_source);
      CREATE INDEX IF NOT EXISTS idx_seo_channels_clinic ON seo_channels(clinic);
      CREATE INDEX IF NOT EXISTS idx_seo_channels_month ON seo_channels(month);
      CREATE INDEX IF NOT EXISTS idx_seo_channels_traffic_source ON seo_channels(traffic_source);
    `;
    
    await executeSql(indexSQL);
    console.log('✅ Indexes created');
    
    console.log('\n✅ All tables created successfully!');
    console.log('\nNow you can run: node scripts/migrate-paid-ads-seo.js');
    
  } catch (err) {
    console.error('Error creating tables:', err.message);
    console.log('\nPlease create the tables manually in Supabase SQL Editor.');
  }
}

createTables();