#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWeeklyDataValues() {
  console.log('🔍 Checking executive_weekly_reports data values...\n');
  
  try {
    // Get some sample records
    const { data, error } = await supabase
      .from('executive_weekly_reports')
      .select('*')
      .limit(10)
      .order('week', { ascending: false });
    
    if (error) {
      console.error('Error fetching data:', error);
      return;
    }
    
    // Check which fields have non-zero/non-null values
    const fieldStats = {};
    const fieldsToCheck = [
      'online_booking',
      'new_leads',
      'returning_leads',
      'new_appointments',
      'total_appointments',
      'returning_appointments',
      'appointments',
      'conversations',
      'new_conversations',
      'returning_conversations',
      'leads',
      'total_conversion',
      'new_conversion',
      'returning_conversion'
    ];
    
    // Initialize stats
    fieldsToCheck.forEach(field => {
      fieldStats[field] = {
        nonZero: 0,
        zero: 0,
        null: 0,
        total: 0,
        maxValue: 0,
        hasData: false
      };
    });
    
    // Get more data for better analysis
    const { data: allData, error: allError } = await supabase
      .from('executive_weekly_reports')
      .select(fieldsToCheck.join(','))
      .limit(1000);
    
    if (allData) {
      allData.forEach(record => {
        fieldsToCheck.forEach(field => {
          const value = record[field];
          fieldStats[field].total++;
          
          if (value === null) {
            fieldStats[field].null++;
          } else if (value === 0) {
            fieldStats[field].zero++;
          } else {
            fieldStats[field].nonZero++;
            fieldStats[field].hasData = true;
            fieldStats[field].maxValue = Math.max(fieldStats[field].maxValue, value);
          }
        });
      });
    }
    
    console.log('📊 Field Analysis (from 1000 records):');
    console.log('=' .repeat(80));
    console.log('Field Name'.padEnd(25) + 'Non-Zero'.padEnd(12) + 'Zero'.padEnd(12) + 'Null'.padEnd(12) + 'Max Value'.padEnd(15) + 'Has Data?');
    console.log('-'.repeat(80));
    
    fieldsToCheck.forEach(field => {
      const stats = fieldStats[field];
      console.log(
        field.padEnd(25) +
        stats.nonZero.toString().padEnd(12) +
        stats.zero.toString().padEnd(12) +
        stats.null.toString().padEnd(12) +
        stats.maxValue.toFixed(0).padEnd(15) +
        (stats.hasData ? '✅ Yes' : '❌ No')
      );
    });
    
    // Check a specific clinic to see the pattern
    console.log('\n📍 Sample data for advancedlifeclinic.com (last 5 weeks):');
    const { data: clinicData } = await supabase
      .from('executive_weekly_reports')
      .select('week, traffic_source, leads, new_leads, returning_leads, total_appointments, new_appointments, returning_appointments, online_booking')
      .eq('clinic', 'advancedlifeclinic.com')
      .order('week', { ascending: false })
      .limit(20);
    
    if (clinicData) {
      console.log('\nWeek        | Source      | Leads | New L | Ret L | Tot Apt | New Apt | Ret Apt | Online');
      console.log('-'.repeat(95));
      clinicData.forEach(row => {
        console.log(
          `${row.week} | ${(row.traffic_source || '').padEnd(11)} | ${(row.leads || 0).toString().padStart(5)} | ${(row.new_leads || 0).toString().padStart(5)} | ${(row.returning_leads || 0).toString().padStart(5)} | ${(row.total_appointments || 0).toString().padStart(7)} | ${(row.new_appointments || 0).toString().padStart(7)} | ${(row.returning_appointments || 0).toString().padStart(7)} | ${(row.online_booking || 0).toString().padStart(6)}`
        );
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkWeeklyDataValues();