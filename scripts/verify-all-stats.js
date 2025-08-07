#!/usr/bin/env node

/**
 * Comprehensive verification of all stats across all tabs and grids
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function verifyAllStats() {
  console.log(`${colors.bright}${colors.blue}🔍 Comprehensive Stats Verification${colors.reset}`);
  console.log('=' .repeat(80) + '\n');
  
  try {
    // Get all unique companies
    const { data: companies } = await supabase
      .from('executive_monthly_reports')
      .select('clinic')
      .order('clinic');
    
    const uniqueCompanies = [...new Set(companies.map(c => c.clinic))];
    console.log(`Found ${colors.cyan}${uniqueCompanies.length}${colors.reset} companies to verify\n`);
    
    // Test month
    const testMonth = '2025-08-01';
    
    for (const company of uniqueCompanies) {
      console.log(`${colors.bright}${colors.magenta}📊 ${company}${colors.reset}`);
      console.log('-'.repeat(60));
      
      // Get all data for this company/month
      const { data: allRecords } = await supabase
        .from('executive_monthly_reports')
        .select('*')
        .eq('clinic', company)
        .eq('month', testMonth)
        .order('traffic_source');
      
      if (!allRecords || allRecords.length === 0) {
        console.log(`${colors.yellow}No data for ${testMonth}${colors.reset}\n`);
        continue;
      }
      
      console.log(`Traffic sources found: ${allRecords.length}`);
      
      // 1. Verify Overview Tab (All Traffic Sources Combined)
      console.log(`\n${colors.cyan}1. Overview Tab Verification:${colors.reset}`);
      const overviewTotals = calculateTotals(allRecords);
      displayTotals('All Traffic Sources', overviewTotals);
      
      // 2. Verify Google Ads Channel
      console.log(`\n${colors.cyan}2. Google Ads Channel:${colors.reset}`);
      const googleAdsRecords = allRecords.filter(r => r.traffic_source === 'google ads');
      if (googleAdsRecords.length > 0) {
        const googleAdsTotals = calculateTotals(googleAdsRecords);
        displayTotals('Google Ads Only', googleAdsTotals);
      } else {
        console.log('No Google Ads data');
      }
      
      // 3. Verify Social Ads Channel
      console.log(`\n${colors.cyan}3. Social Ads Channel:${colors.reset}`);
      const socialAdsRecords = allRecords.filter(r => r.traffic_source === 'social ads');
      if (socialAdsRecords.length > 0) {
        const socialAdsTotals = calculateTotals(socialAdsRecords);
        displayTotals('Social Ads Only', socialAdsTotals);
      } else {
        console.log('No Social Ads data');
      }
      
      // 4. Verify SEO Channel (Local SEO + Organic SEO)
      console.log(`\n${colors.cyan}4. SEO Channel (Local + Organic):${colors.reset}`);
      const seoRecords = allRecords.filter(r => 
        r.traffic_source === 'local seo' || r.traffic_source === 'organic seo'
      );
      if (seoRecords.length > 0) {
        const seoTotals = calculateTotals(seoRecords);
        displayTotals('SEO Combined', seoTotals);
        
        // Show breakdown
        const localSeo = allRecords.filter(r => r.traffic_source === 'local seo');
        const organicSeo = allRecords.filter(r => r.traffic_source === 'organic seo');
        if (localSeo.length > 0) {
          console.log(`  - Local SEO: ${localSeo[0].visits} visits, ${localSeo[0].leads} leads`);
        }
        if (organicSeo.length > 0) {
          console.log(`  - Organic SEO: ${organicSeo[0].visits} visits, ${organicSeo[0].leads} leads`);
        }
      } else {
        console.log('No SEO data');
      }
      
      // 5. Verify Channel Totals Equal Overview Total
      console.log(`\n${colors.cyan}5. Verification Check:${colors.reset}`);
      const channelSum = {
        impressions: 0,
        visits: 0,
        leads: 0,
        spend: 0,
        revenue: 0
      };
      
      // Add up all individual channels
      const channels = ['google ads', 'social ads', 'local seo', 'organic seo', 'organic social', 'others', 'print', 'reactivation'];
      channels.forEach(channel => {
        const channelRecords = allRecords.filter(r => r.traffic_source === channel);
        if (channelRecords.length > 0) {
          const totals = calculateTotals(channelRecords);
          channelSum.impressions += totals.impressions;
          channelSum.visits += totals.visits;
          channelSum.leads += totals.leads;
          channelSum.spend += totals.spend;
          channelSum.revenue += totals.revenue;
        }
      });
      
      // Compare
      const match = 
        channelSum.impressions === overviewTotals.impressions &&
        channelSum.visits === overviewTotals.visits &&
        channelSum.leads === overviewTotals.leads &&
        Math.abs(channelSum.spend - overviewTotals.spend) < 0.01 &&
        Math.abs(channelSum.revenue - overviewTotals.revenue) < 0.01;
      
      if (match) {
        console.log(`${colors.green}✓ Channel totals match overview totals${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ Channel totals DO NOT match overview totals${colors.reset}`);
        console.log('Channel Sum:', channelSum);
        console.log('Overview:', overviewTotals);
      }
      
      console.log('\n' + '='.repeat(80) + '\n');
    }
    
    // Test specific calculations for weighted averages
    console.log(`${colors.bright}${colors.blue}📐 Testing Weighted Average Calculations${colors.reset}`);
    console.log('-'.repeat(60));
    
    const testCompany = 'advancedlifeclinic.com';
    const { data: testRecords } = await supabase
      .from('executive_monthly_reports')
      .select('*')
      .eq('clinic', testCompany)
      .eq('month', testMonth);
    
    // Calculate weighted conversion rate
    let totalLeadsWeight = 0;
    let weightedConversionSum = 0;
    
    testRecords.forEach(record => {
      if (record.leads > 0 && record.total_conversion !== null) {
        totalLeadsWeight += record.leads;
        weightedConversionSum += record.total_conversion * record.leads;
      }
    });
    
    const calculatedConversion = totalLeadsWeight > 0 ? weightedConversionSum / totalLeadsWeight : 0;
    console.log(`\nWeighted Conversion Rate Calculation:`);
    console.log(`Total Leads: ${totalLeadsWeight}`);
    console.log(`Weighted Sum: ${weightedConversionSum.toFixed(2)}`);
    console.log(`Calculated Rate: ${calculatedConversion.toFixed(1)}%`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
  }
}

function calculateTotals(records) {
  const totals = {
    impressions: 0,
    visits: 0,
    leads: 0,
    new_leads: 0,
    appointments: 0,
    conversations: 0,
    spend: 0,
    revenue: 0,
    conversion_rate: 0,
    roas: 0,
    cac_total: 0
  };
  
  // Sum up basic metrics
  records.forEach(record => {
    totals.impressions += record.impressions || 0;
    totals.visits += record.visits || 0;
    totals.leads += record.leads || 0;
    totals.new_leads += record.new_leads || 0;
    totals.appointments += record.total_appointments || 0;
    totals.conversations += record.total_conversations || 0;
    totals.spend += record.spend || 0;
    totals.revenue += record.total_estimated_revenue || 0;
  });
  
  // Calculate weighted conversion rate
  let totalLeadsWeight = 0;
  let weightedConversionSum = 0;
  
  records.forEach(record => {
    if (record.leads > 0 && record.total_conversion !== null) {
      totalLeadsWeight += record.leads;
      weightedConversionSum += record.total_conversion * record.leads;
    }
  });
  
  totals.conversion_rate = totalLeadsWeight > 0 ? weightedConversionSum / totalLeadsWeight : 0;
  
  // Calculate derived metrics
  if (totals.spend > 0) {
    totals.roas = totals.revenue / totals.spend;
    if (totals.leads > 0) {
      totals.cac_total = totals.spend / totals.leads;
    }
  }
  
  return totals;
}

function displayTotals(label, totals) {
  console.log(`  ${label}:`);
  console.log(`    Impressions: ${totals.impressions.toLocaleString()}`);
  console.log(`    Visits: ${totals.visits.toLocaleString()}`);
  console.log(`    Leads: ${totals.leads}`);
  console.log(`    Conversion: ${totals.conversion_rate.toFixed(1)}%`);
  console.log(`    Appointments: ${totals.appointments}`);
  console.log(`    Spend: $${totals.spend.toFixed(2)}`);
  console.log(`    Revenue: $${totals.revenue.toFixed(2)}`);
  console.log(`    ROAS: ${totals.roas.toFixed(2)}`);
  console.log(`    CAC: $${totals.cac_total.toFixed(2)}`);
}

verifyAllStats();