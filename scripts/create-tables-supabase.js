const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createTables() {
  console.log('📊 Creating tables in Supabase...\n');
  
  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: false
    }
  });

  console.log('Note: Since Supabase doesn\'t support direct DDL via the JS client,');
  console.log('you need to create the tables manually in the Supabase dashboard.\n');
  
  console.log('Please run the following SQL in your Supabase SQL Editor:\n');
  
  const createTableSQL = `
-- Create paid_ads table
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

-- Create seo_channels table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_paid_ads_clinic ON paid_ads(clinic);
CREATE INDEX IF NOT EXISTS idx_paid_ads_month ON paid_ads(month);
CREATE INDEX IF NOT EXISTS idx_paid_ads_traffic_source ON paid_ads(traffic_source);

CREATE INDEX IF NOT EXISTS idx_seo_channels_clinic ON seo_channels(clinic);
CREATE INDEX IF NOT EXISTS idx_seo_channels_month ON seo_channels(month);
CREATE INDEX IF NOT EXISTS idx_seo_channels_traffic_source ON seo_channels(traffic_source);
`;

  console.log(createTableSQL);
  
  console.log('\n📋 Instructions:');
  console.log('1. Go to your Supabase dashboard: ' + supabaseUrl);
  console.log('2. Navigate to SQL Editor');
  console.log('3. Paste and run the SQL above');
  console.log('4. Then run: node scripts/migrate-paid-ads-seo.js');
}

createTables();