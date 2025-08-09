const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPaidAdsDates() {
  console.log('🔍 Checking date ranges in paid_ads table...\n');
  
  // Get date range
  const { data: minDate } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: true })
    .limit(1);
  
  const { data: maxDate } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: false })
    .limit(1);
  
  console.log('Date range in paid_ads:');
  console.log('Earliest:', minDate?.[0]?.month);
  console.log('Latest:', maxDate?.[0]?.month);
  
  // Get all unique months
  const { data: allMonths } = await supabase
    .from('paid_ads')
    .select('month')
    .order('month', { ascending: false });
  
  const uniqueMonths = [...new Set(allMonths.map(r => r.month))];
  console.log('\nAll unique months:', uniqueMonths.length);
  uniqueMonths.forEach(month => {
    console.log('-', month);
  });
  
  // Check data for a specific clinic
  const testClinic = 'advancedlifeclinic.com';
  const { data: clinicData } = await supabase
    .from('paid_ads')
    .select('month, campaign')
    .eq('clinic', testClinic)
    .order('month', { ascending: false })
    .limit(20);
  
  console.log(`\nRecent data for ${testClinic}:`);
  clinicData.forEach(record => {
    console.log(`- ${record.month}: ${record.campaign}`);
  });
  
  // Check if there's data for Aug 2025
  const { data: augData, count } = await supabase
    .from('paid_ads')
    .select('*', { count: 'exact' })
    .gte('month', '2025-08-01')
    .lte('month', '2025-08-31');
  
  console.log(`\nAugust 2025 data: ${count} records`);
  if (count > 0) {
    const clinics = [...new Set(augData.map(r => r.clinic))];
    console.log('Clinics with Aug 2025 data:', clinics.join(', '));
  }
}

checkPaidAdsDates().catch(console.error);