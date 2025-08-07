#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  console.log('🔍 Checking executive_monthly_reports table structure...\n');

  try {
    // Get table structure using a dummy query
    const { data, error } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Error:', error.message);
      
      // If table doesn't exist, show the create table SQL
      if (error.message.includes('does not exist')) {
        console.log('\n📝 Table does not exist. Create it with this SQL:\n');
        console.log(`
CREATE TABLE IF NOT EXISTS executive_monthly_reports (
  id SERIAL PRIMARY KEY,
  clinic VARCHAR(255),
  month DATE,
  traffic_source VARCHAR(255),
  impressions INTEGER,
  visits INTEGER,
  spend DECIMAL(10,2),
  ltv DECIMAL(10,2),
  estimated_ltv_6m DECIMAL(10,2),
  avg_ltv DECIMAL(10,2),
  roas DECIMAL(10,2),
  leads INTEGER,
  conversion_rate DECIMAL(5,2),
  cac_total DECIMAL(10,2),
  cac_new DECIMAL(10,2),
  total_appointments INTEGER,
  new_appointments INTEGER,
  returning_appointments INTEGER,
  online_booking INTEGER,
  total_conversations INTEGER,
  new_conversations INTEGER,
  returning_conversations INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  import_source VARCHAR(255)
);

-- Create indexes for better query performance
CREATE INDEX idx_executive_monthly_clinic ON executive_monthly_reports(clinic);
CREATE INDEX idx_executive_monthly_month ON executive_monthly_reports(month);
CREATE INDEX idx_executive_monthly_traffic ON executive_monthly_reports(traffic_source);
        `);
      }
      return;
    }

    // Try to get one record to see the actual structure
    const { data: sample, error: sampleError } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .limit(1);

    if (!sampleError && sample !== null) {
      const columns = sample.length > 0 ? Object.keys(sample[0]) : [];
      
      if (columns.length > 0) {
        console.log('✅ Table exists with columns:');
        columns.forEach(col => console.log(`  - ${col}`));
      } else {
        console.log('✅ Table exists but is empty. Unable to determine columns.');
        console.log('\n📝 Expected columns based on migration script:');
        const expectedColumns = [
          'id', 'clinic', 'month', 'traffic_source', 'impressions', 'visits',
          'spend', 'ltv', 'estimated_ltv_6m', 'avg_ltv', 'roas', 'leads',
          'conversion_rate', 'cac_total', 'cac_new', 'total_appointments',
          'new_appointments', 'returning_appointments', 'online_booking',
          'total_conversations', 'new_conversations', 'returning_conversations',
          'created_at', 'import_source'
        ];
        expectedColumns.forEach(col => console.log(`  - ${col}`));
      }
    }

    // Get row count
    const { count } = await supabase
      .from('executive_monthly_reports')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Total records: ${count || 0}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkColumns().catch(console.error);