#!/usr/bin/env node

/**
 * Update executive_monthly_reports with new_leads and returning_leads data
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Lead breakdown data provided by user
const leadData = [
  // December 2024 data
  { clinic: 'advancedlifeclinic.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'advancedlifeclinic.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 473 },
  { clinic: 'advancedlifeclinic.com', month: '2024-12-01', traffic_source: 'others', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 38, returning_leads: 12 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 96, returning_leads: 518 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 37, returning_leads: 8 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'others', new_leads: 127, returning_leads: 914 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'alluraderm.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 52, returning_leads: 5 },
  { clinic: 'bismarckbotox.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 156 },
  { clinic: 'drridha.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'drridha.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 12, returning_leads: 1 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 4, returning_leads: 228 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 3, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'others', new_leads: 2, returning_leads: 0 },
  { clinic: 'genesis-medspa.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 7, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 9, returning_leads: 222 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 15, returning_leads: 7 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'others', new_leads: 10, returning_leads: 1 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 },
  { clinic: 'greenspringaesthetics.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 145 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'kovakcosmeticcenter.com', month: '2024-12-01', traffic_source: 'others', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 0, returning_leads: 606 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'mirabilemd.com', month: '2024-12-01', traffic_source: 'others', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 3, returning_leads: 3 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 7, returning_leads: 232 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 7, returning_leads: 3 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'others', new_leads: 4, returning_leads: 0 },
  { clinic: 'myskintastic.com', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'google ads', new_leads: 16, returning_leads: 4 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'local seo', new_leads: 13, returning_leads: 471 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 12, returning_leads: 1 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'others', new_leads: 6, returning_leads: 146 },
  { clinic: 'skincareinstitute.net', month: '2024-12-01', traffic_source: 'social ads', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'google ads', new_leads: 11, returning_leads: 3 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'local seo', new_leads: 2, returning_leads: 440 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'organic seo', new_leads: 33, returning_leads: 12 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'organic social', new_leads: 0, returning_leads: 0 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'others', new_leads: 212, returning_leads: 1295 },
  { clinic: 'skinjectables.com', month: '2024-12-01', traffic_source: 'reactivation', new_leads: 0, returning_leads: 0 }
];

// Note: The data you provided includes January-July 2025 data, but our current table only has December 2024
// If you want to add the future months, we'll need to insert new records

async function updateLeadBreakdown() {
  console.log('📊 Updating Lead Breakdown Data');
  console.log('================================\n');
  
  try {
    // First, check if columns exist (they should after running the SQL)
    const { data: testRecord } = await supabase
      .from('executive_monthly_reports')
      .select('id, new_leads, returning_leads')
      .limit(1)
      .single();
    
    if (testRecord && !('new_leads' in testRecord)) {
      console.log('❌ Columns new_leads and returning_leads do not exist yet.');
      console.log('Please run this SQL in Supabase first:');
      console.log('\nALTER TABLE executive_monthly_reports');
      console.log('ADD COLUMN IF NOT EXISTS new_leads INTEGER DEFAULT 0,');
      console.log('ADD COLUMN IF NOT EXISTS returning_leads INTEGER DEFAULT 0;\n');
      return;
    }
    
    console.log('✅ Columns exist, proceeding with updates...\n');
    
    let updated = 0;
    let failed = 0;
    const errors = [];
    
    // Process each lead data record
    for (const record of leadData) {
      // Update the record in Supabase
      const { data, error } = await supabase
        .from('executive_monthly_reports')
        .update({
          new_leads: record.new_leads,
          returning_leads: record.returning_leads
        })
        .eq('clinic', record.clinic)
        .eq('month', record.month)
        .eq('traffic_source', record.traffic_source);
      
      if (error) {
        console.error(`❌ Failed to update ${record.clinic} - ${record.traffic_source}: ${error.message}`);
        failed++;
        errors.push({ record, error: error.message });
      } else {
        updated++;
        process.stdout.write(`\r✅ Updated: ${updated} records`);
      }
    }
    
    console.log('\n\n📊 Update Summary:');
    console.log('==================');
    console.log(`✅ Successfully updated: ${updated} records`);
    if (failed > 0) {
      console.log(`❌ Failed: ${failed} records`);
      console.log('\nFailed records:');
      errors.forEach(e => {
        console.log(`  - ${e.record.clinic} / ${e.record.traffic_source}: ${e.error}`);
      });
    }
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const { data: sample } = await supabase
      .from('executive_monthly_reports')
      .select('clinic, traffic_source, leads, new_leads, returning_leads')
      .in('clinic', ['advancedlifeclinic.com', 'alluraderm.com'])
      .limit(5);
    
    if (sample) {
      console.log('\nSample updated records:');
      sample.forEach(r => {
        console.log(`  ${r.clinic} - ${r.traffic_source}:`);
        console.log(`    Total: ${r.leads}, New: ${r.new_leads}, Returning: ${r.returning_leads}`);
      });
    }
    
    // Check totals
    const { data: totals } = await supabase
      .from('executive_monthly_reports')
      .select('new_leads, returning_leads');
    
    if (totals) {
      const totalNew = totals.reduce((sum, r) => sum + (r.new_leads || 0), 0);
      const totalReturning = totals.reduce((sum, r) => sum + (r.returning_leads || 0), 0);
      console.log('\n📈 Overall Totals:');
      console.log(`  New Leads: ${totalNew}`);
      console.log(`  Returning Leads: ${totalReturning}`);
      console.log(`  Total: ${totalNew + totalReturning}`);
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
}

// Note about future months data
console.log('📝 Note: Your data includes January-July 2025 records.');
console.log('   The current table only has December 2024 data.');
console.log('   This script will update the December 2024 records.');
console.log('   To add future months, we would need to insert new records.\n');

updateLeadBreakdown().catch(console.error);