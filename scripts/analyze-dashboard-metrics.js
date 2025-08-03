#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeMetrics() {
  // Get sample data and schema
  const { data: sample } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .limit(1)
    .single();
    
  // Get distinct clinics
  const { data: clinics } = await supabase
    .from('executive_monthly_reports')
    .select('clinic')
    .limit(1000);
    
  const uniqueClinics = [...new Set(clinics.map(c => c.clinic))];
  
  // Get date range
  const { data: dateRange } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);
    
  const { data: latestDate } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);
  
  console.log('📊 Data Analysis for Dashboard Planning');
  console.log('========================================\n');
  
  console.log('Available Metrics:');
  console.log('------------------');
  const columns = Object.keys(sample);
  const metrics = columns.filter(c => !['id', 'clinic', 'month', 'traffic_source', 'created_at', 'import_source'].includes(c));
  
  console.log('\n1. Traffic & Engagement:');
  console.log('   ', metrics.filter(m => m.includes('impression') || m.includes('visit')).join(', '));
  
  console.log('\n2. Financial Metrics:');
  console.log('   Revenue:', metrics.filter(m => m.includes('revenue')).join(', '));
  console.log('   ROI:', metrics.filter(m => m.includes('roas') || m.includes('ltv')).join(', '));
  console.log('   Costs:', metrics.filter(m => m.includes('spend') || m.includes('cac')).join(', '));
  
  console.log('\n3. Lead & Conversion Metrics:');
  console.log('   Leads:', metrics.filter(m => m.includes('lead')).join(', '));
  console.log('   Conversions:', metrics.filter(m => m.includes('conversion')).join(', '));
  
  console.log('\n4. Appointment Metrics:');
  console.log('   ', metrics.filter(m => m.includes('appointment')).join(', '));
  
  console.log('\n5. Customer Engagement:');
  console.log('   ', metrics.filter(m => m.includes('conversation') || m.includes('booking')).join(', '));
  
  console.log('\n\nData Coverage:');
  console.log('--------------');
  console.log('Total Clinics:', uniqueClinics.length);
  console.log('Sample Clinics:', uniqueClinics.slice(0, 5).join(', '), '...');
  console.log('Date Range:', dateRange[0]?.month, 'to', latestDate[0]?.month);
  
  // Get traffic sources
  const { data: sources } = await supabase
    .from('executive_monthly_reports')
    .select('traffic_source')
    .limit(1000);
    
  const uniqueSources = [...new Set(sources.map(s => s.traffic_source))];
  console.log('Traffic Sources:', uniqueSources.join(', '));
  
  // Analyze new vs returning breakdown
  console.log('\n\nNew vs Returning Breakdown Available:');
  console.log('--------------------------------------');
  console.log('✅ Leads: new_leads, returning_leads');
  console.log('✅ ROAS: total_roas, new_roas');
  console.log('✅ Conversion: total_conversion, new_conversion');
  console.log('✅ Revenue: total_estimated_revenue, new_estimated_revenue');
  console.log('✅ Appointments: new_appointments, returning_appointments');
  console.log('✅ Conversations: new_conversations, returning_conversations');
  console.log('✅ CAC: cac_total, cac_new');
}

analyzeMetrics().catch(console.error);