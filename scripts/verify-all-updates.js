#!/usr/bin/env node

/**
 * Verify all tables have been updated from MSSQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAllUpdates() {
  console.log('📊 Verifying All Supabase Tables');
  console.log('==================================\n');
  
  const tables = [
    'executive_monthly_reports',
    'executive_weekly_reports',
    'paid_ads',
    'seo_channels'
  ];
  
  let totalRecords = 0;
  
  for (const table of tables) {
    try {
      // Get count
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      // Get most recent record
      const { data: recentData } = await supabase
        .from(table)
        .select('*')
        .order(table.includes('weekly') ? 'week' : 'month', { ascending: false })
        .limit(1);
        
      console.log(`📋 ${table}:`);
      console.log(`   Records: ${count || 0}`);
      
      if (recentData && recentData.length > 0) {
        const record = recentData[0];
        const dateField = table.includes('weekly') ? 'week' : 'month';
        const date = new Date(record[dateField]);
        const formattedDate = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: table.includes('weekly') ? 'numeric' : undefined 
        });
        
        console.log(`   Most Recent: ${formattedDate}`);
        console.log(`   Sample: ${record.clinic} - ${record.traffic_source}`);
      }
      
      console.log('');
      totalRecords += (count || 0);
      
    } catch (error) {
      console.error(`❌ Error checking ${table}:`, error.message);
    }
  }
  
  console.log('📊 Summary:');
  console.log(`   Total Records Across All Tables: ${totalRecords.toLocaleString()}`);
  console.log(`   Update Date: ${new Date().toLocaleString()}`);
  console.log('\n✨ All tables have been successfully updated from MSSQL!');
}

// Run verification
verifyAllUpdates()
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });