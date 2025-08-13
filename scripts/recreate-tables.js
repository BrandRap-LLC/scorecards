const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function recreateTables() {
  try {
    console.log('Starting table recreation process...\n');
    
    // Step 1: Drop existing tables
    console.log('Step 1: Dropping existing tables...');
    
    // Drop paid_ads
    const { data: paidAdsData, error: paidAdsError } = await supabase
      .from('paid_ads')
      .delete()
      .neq('clinic', 'impossible_value_to_match_nothing');
    
    if (paidAdsError && !paidAdsError.message.includes('does not exist')) {
      console.error('Error with paid_ads:', paidAdsError.message);
    }
    
    // Drop seo_channels
    const { data: seoData, error: seoError } = await supabase
      .from('seo_channels')
      .delete()
      .neq('clinic', 'impossible_value_to_match_nothing');
    
    if (seoError && !seoError.message.includes('does not exist')) {
      console.error('Error with seo_channels:', seoError.message);
    }
    
    console.log('✓ Tables cleared\n');
    
    // Step 2: Create tables with correct schemas
    console.log('Step 2: Creating tables with correct schemas...');
    
    // Note: Table creation needs to be done via Supabase dashboard or SQL editor
    // as the client library doesn't support DDL operations directly
    
    console.log(`
Please create the following tables in Supabase SQL Editor:

-- Create paid_ads table
CREATE TABLE IF NOT EXISTS paid_ads (
  clinic TEXT,
  month TIMESTAMP,
  traffic_source TEXT,
  campaign TEXT,
  impressions DOUBLE PRECISION,
  visits DOUBLE PRECISION,
  spend DOUBLE PRECISION,
  estimated_ltv_6m DOUBLE PRECISION,
  total_roas DOUBLE PRECISION,
  new_roas DOUBLE PRECISION,
  leads DOUBLE PRECISION,
  new_leads DOUBLE PRECISION,
  returning_leads DOUBLE PRECISION,
  total_conversion DOUBLE PRECISION,
  new_conversion DOUBLE PRECISION,
  returning_conversion DOUBLE PRECISION,
  cac_total DOUBLE PRECISION,
  cac_new DOUBLE PRECISION,
  total_estimated_revenue DOUBLE PRECISION,
  new_estimated_revenue DOUBLE PRECISION,
  total_appointments DOUBLE PRECISION,
  new_appointments DOUBLE PRECISION,
  returning_appointments DOUBLE PRECISION,
  total_conversations DOUBLE PRECISION,
  new_conversations DOUBLE PRECISION,
  returning_conversations DOUBLE PRECISION
);

-- Create seo_channels table
CREATE TABLE IF NOT EXISTS seo_channels (
  clinic TEXT,
  month TIMESTAMP,
  traffic_source TEXT,
  impressions DOUBLE PRECISION,
  visits DOUBLE PRECISION,
  estimated_ltv_6m DOUBLE PRECISION,
  leads DOUBLE PRECISION,
  new_leads DOUBLE PRECISION,
  returning_leads DOUBLE PRECISION,
  total_conversion DOUBLE PRECISION,
  new_conversion DOUBLE PRECISION,
  returning_conversion DOUBLE PRECISION,
  total_estimated_revenue DOUBLE PRECISION,
  new_estimated_revenue DOUBLE PRECISION,
  total_appointments DOUBLE PRECISION,
  new_appointments DOUBLE PRECISION,
  returning_appointments DOUBLE PRECISION,
  total_conversations DOUBLE PRECISION,
  new_conversations DOUBLE PRECISION,
  returning_conversations DOUBLE PRECISION
);
    `);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

recreateTables();