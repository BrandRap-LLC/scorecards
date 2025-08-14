#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWeeklyTableSchema() {
  console.log('🔍 Checking executive_weekly_reports table schema...\n');
  
  try {
    // Get a sample record to see what columns exist
    const { data, error } = await supabase
      .from('executive_weekly_reports')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Available columns in executive_weekly_reports:');
      console.log('=' .repeat(50));
      
      const sampleRecord = data[0];
      const columns = Object.keys(sampleRecord).sort();
      
      columns.forEach(column => {
        const value = sampleRecord[column];
        const type = value === null ? 'null' : typeof value;
        console.log(`  - ${column} (${type})`);
      });
      
      console.log('\n📊 Sample record:');
      console.log(JSON.stringify(sampleRecord, null, 2));
    } else {
      console.log('No data found in executive_weekly_reports table');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkWeeklyTableSchema();