#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listAllMetrics() {
  // Get a sample record to see ALL columns
  const { data } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', 'advancedlifeclinic.com')
    .eq('month', '2025-07-01')
    .limit(1);
  
  if (data && data.length > 0) {
    const record = data[0];
    console.log('ALL DATABASE METRICS (exactly as stored):');
    console.log('==========================================\n');
    
    // Exclude metadata columns
    const excludeColumns = ['id', 'clinic', 'month', 'traffic_source', 'created_at', 'import_source'];
    
    const metrics = [];
    Object.keys(record).forEach(key => {
      if (!excludeColumns.includes(key)) {
        metrics.push(key);
      }
    });
    
    metrics.sort().forEach((metric, index) => {
      console.log(`${index + 1}. ${metric}`);
    });
    
    console.log('\nTOTAL METRICS TO DISPLAY:', metrics.length);
  }
}

listAllMetrics().catch(console.error);