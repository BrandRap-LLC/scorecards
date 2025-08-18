import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWeeklyData() {
  console.log('📊 Checking Weekly Data Distribution');
  console.log('====================================\n');

  // Get distinct weeks ordered
  const { data: weeks, error: weeksError } = await supabase
    .from('executive_weekly_reports')
    .select('week')
    .order('week', { ascending: false });
  
  if (weeksError) {
    console.error('Error fetching weeks:', weeksError);
    return;
  }

  // Get unique weeks
  const uniqueWeeks = [...new Set(weeks.map(w => w.week))];
  console.log(`Total unique weeks: ${uniqueWeeks.length}`);
  console.log(`Latest 5 weeks:`);
  uniqueWeeks.slice(0, 5).forEach(week => {
    const date = new Date(week);
    const weekNum = getWeekNumber(date);
    console.log(`  - ${week} (Week ${weekNum})`);
  });

  // Check week 32 completeness
  const { data: week32Data, error: week32Error } = await supabase
    .from('executive_weekly_reports')
    .select('clinic', { count: 'exact' })
    .eq('week', '2025-08-11');
  
  if (!week32Error) {
    const uniqueClinics = [...new Set(week32Data.map(d => d.clinic))];
    console.log(`\n✅ Week 32 (2025-08-11) Status:`);
    console.log(`   - Total records: ${week32Data.length}`);
    console.log(`   - Unique clinics: ${uniqueClinics.length}`);
    console.log(`   - Clinics: ${uniqueClinics.sort().join(', ')}`);
  }

  // Double-check week 33
  const { data: week33Check, error: week33Error } = await supabase
    .from('executive_weekly_reports')
    .select('*')
    .gte('week', '2025-08-17')
    .lte('week', '2025-08-23');
  
  console.log(`\n⚠️  Week 33 (2025-08-17 to 2025-08-23) Check:`);
  if (!week33Error && week33Check) {
    console.log(`   - Records found: ${week33Check.length}`);
    if (week33Check.length > 0) {
      console.log(`   - THIS DATA SHOULD NOT BE DISPLAYED (incomplete week)`);
    } else {
      console.log(`   - Confirmed: No week 33 data in database`);
    }
  }
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Run the check
checkWeeklyData().catch(console.error);