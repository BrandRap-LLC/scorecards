#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeMetricGroups() {
  // Get a sample record to understand the metrics
  const { data } = await supabase
    .from('executive_monthly_reports')
    .select('*')
    .eq('clinic', 'advancedlifeclinic.com')
    .eq('month', '2025-07-01')
    .limit(1);
  
  if (data && data.length > 0) {
    const record = data[0];
    console.log('SAMPLE VALUES TO UNDERSTAND METRICS:');
    console.log('=====================================\n');
    
    // Group metrics by category
    const metricGroups = {
      'SPEND & REVENUE': [
        'spend',
        'total_estimated_revenue',
        'new_estimated_revenue',
        'total_roas',
        'new_roas',
        'roas'
      ],
      'COST METRICS': [
        'cac_total',
        'cac_new'
      ],
      'TRAFFIC': [
        'impressions',
        'visits'
      ],
      'LEADS': [
        'leads',
        'new_leads',
        'returning_leads'
      ],
      'CONVERSION': [
        'conversion_rate',
        'total_conversion',
        'new_conversion'
      ],
      'APPOINTMENTS': [
        'total_appointments',
        'new_appointments',
        'returning_appointments',
        'online_booking'
      ],
      'CONVERSATIONS': [
        'total_conversations',
        'new_conversations',
        'returning_conversations'
      ],
      'LTV METRICS': [
        'ltv',
        'estimated_ltv_6m',
        'avg_ltv',
        'avg_estimated_ltv_6m',
        'avg_appointment_rev'
      ]
    };
    
    Object.entries(metricGroups).forEach(([group, metrics]) => {
      console.log(`\n${group}:`);
      console.log('-'.repeat(40));
      metrics.forEach(metric => {
        const value = record[metric];
        const displayValue = value !== null && value !== undefined ? 
          (typeof value === 'number' ? value.toFixed(2) : value) : 'null';
        console.log(`  ${metric}: ${displayValue}`);
      });
    });
  }
}

analyzeMetricGroups().catch(console.error);