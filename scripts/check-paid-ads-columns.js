#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPaidAdsColumns() {
  console.log('🔍 Checking paid_ads table structure in Supabase...\n');
  
  try {
    // Try to select one row to see the columns
    const { data, error } = await supabase
      .from('paid_ads')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Table exists with columns:');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
    } else {
      console.log('📋 Table exists but is empty');
      
      // Try to get schema info differently
      const { data: schemaData, error: schemaError } = await supabase
        .from('paid_ads')
        .select()
        .limit(0);
        
      if (!schemaError) {
        console.log('✅ Table exists (confirmed)');
      }
    }
    
    // Count records
    const { count } = await supabase
      .from('paid_ads')
      .select('*', { count: 'exact', head: true });
      
    console.log(`\n📊 Total records: ${count || 0}`);
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkPaidAdsColumns();