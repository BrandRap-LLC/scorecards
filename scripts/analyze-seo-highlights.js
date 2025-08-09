#!/usr/bin/env node

/**
 * Analyze SEO highlights data in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeData() {
  console.log('📊 Analyzing SEO Highlights Data');
  console.log('================================\n');
  
  try {
    // Get total record count
    const { count } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📈 Total Records: ${count}\n`);
    
    // Get unique companies
    const { data: companies } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('company_name');
    
    const uniqueCompanies = [...new Set(companies?.map(c => c.company_name) || [])];
    console.log(`🏢 Companies (${uniqueCompanies.length}):`);
    uniqueCompanies.sort().forEach(company => {
      console.log(`   - ${company}`);
    });
    
    // Analyze by company
    console.log('\n📊 Keywords by Company:');
    for (const company of uniqueCompanies) {
      const { count: companyCount } = await supabase
        .from('seo_highlights_keyword_page_one')
        .select('*', { count: 'exact', head: true })
        .eq('company_name', company);
      
      console.log(`   ${company}: ${companyCount} keywords`);
    }
    
    // Get query groups
    const { data: queryGroups } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('query_group');
    
    // Parse and count query groups
    const groupCounts = {};
    queryGroups?.forEach(row => {
      if (row.query_group) {
        const groups = row.query_group.split(',').map(g => g.trim());
        groups.forEach(group => {
          groupCounts[group] = (groupCounts[group] || 0) + 1;
        });
      }
    });
    
    console.log('\n🏷️  Query Groups:');
    Object.entries(groupCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([group, count]) => {
        console.log(`   ${group}: ${count} keywords`);
      });
    
    // Analyze period types
    const { data: periodData } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period_type');
    
    const periodCounts = {};
    periodData?.forEach(row => {
      periodCounts[row.period_type] = (periodCounts[row.period_type] || 0) + 1;
    });
    
    console.log('\n📅 Period Types:');
    Object.entries(periodCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} records`);
    });
    
    // Analyze highlight reasons
    const { data: reasons } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('highlight_reason');
    
    const reasonCounts = {};
    reasons?.forEach(row => {
      if (row.highlight_reason) {
        // Extract the main reason pattern
        const match = row.highlight_reason.match(/entered top (\d+)/);
        if (match) {
          const key = `Entered top ${match[1]}`;
          reasonCounts[key] = (reasonCounts[key] || 0) + 1;
        }
      }
    });
    
    console.log('\n🎯 Highlight Reasons:');
    Object.entries(reasonCounts)
      .sort((a, b) => {
        // Sort by top number
        const aNum = parseInt(a[0].match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b[0].match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      })
      .forEach(([reason, count]) => {
        console.log(`   ${reason}: ${count} keywords`);
      });
    
    // Get date range
    const { data: dates } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period')
      .order('period');
    
    if (dates && dates.length > 0) {
      const earliestDate = new Date(dates[0].period);
      const latestDate = new Date(dates[dates.length - 1].period);
      
      console.log('\n📆 Date Range:');
      console.log(`   Earliest: ${earliestDate.toLocaleDateString()}`);
      console.log(`   Latest: ${latestDate.toLocaleDateString()}`);
    }
    
    // Analyze ranking improvements
    const { data: rankings } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('current_rank, baseline_avg_rank');
    
    let totalImprovement = 0;
    let countWithImprovement = 0;
    
    rankings?.forEach(row => {
      if (row.current_rank && row.baseline_avg_rank) {
        const improvement = row.baseline_avg_rank - row.current_rank;
        totalImprovement += improvement;
        countWithImprovement++;
      }
    });
    
    const avgImprovement = totalImprovement / countWithImprovement;
    
    console.log('\n📈 Ranking Improvements:');
    console.log(`   Average position improvement: ${avgImprovement.toFixed(1)} positions`);
    
    // Find best improvements
    const { data: bestImprovements } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('company_name, query, current_rank, baseline_avg_rank')
      .order('baseline_avg_rank', { ascending: false })
      .limit(5);
    
    console.log('\n🌟 Top 5 Biggest Improvements:');
    bestImprovements?.forEach((row, index) => {
      const improvement = row.baseline_avg_rank - row.current_rank;
      console.log(`   ${index + 1}. ${row.company_name} - "${row.query}"`);
      console.log(`      From position ${row.baseline_avg_rank.toFixed(1)} to ${row.current_rank.toFixed(1)} (${improvement.toFixed(1)} position improvement)`);
    });
    
    // Find keywords that reached #1
    const { data: topRankings } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('company_name, query, baseline_avg_rank')
      .eq('current_rank', 1)
      .order('baseline_avg_rank', { ascending: false });
    
    if (topRankings && topRankings.length > 0) {
      console.log(`\n🥇 Keywords that reached #1 (${topRankings.length} total):`);
      topRankings.slice(0, 5).forEach(row => {
        console.log(`   - ${row.company_name}: "${row.query}" (was at position ${row.baseline_avg_rank.toFixed(1)})`);
      });
    }
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error analyzing data:', error);
  }
}

// Run the analysis
analyzeData()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });