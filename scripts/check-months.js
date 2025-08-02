#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMonths() {
  const { data, error } = await supabase
    .from('executive_monthly_reports')
    .select('month')
    .order('month');
  
  if (!error && data) {
    const months = [...new Set(data.map(d => d.month))].sort();
    console.log('Months in executive_monthly_reports:');
    months.forEach(m => console.log('  - ' + m));
    console.log('\nTotal records:', data.length);
    console.log('Unique months:', months.length);
  } else {
    console.error('Error:', error);
  }
}

checkMonths();