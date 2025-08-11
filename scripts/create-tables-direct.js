const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating missing tables using direct approach...\n');

  try {
    // Since we can't execute raw SQL directly through Supabase JS client,
    // we'll need to use the Supabase Dashboard or SQL Editor.
    // Let's at least verify which tables already exist
    
    console.log('Checking existing tables...');
    
    // Check for executive_summary
    const { data: execSummary, error: execError } = await supabase
      .from('executive_summary')
      .select('*')
      .limit(1);
    
    if (execError?.code === '42P01') {
      console.log('❌ executive_summary table does not exist');
    } else if (!execError) {
      console.log('✅ executive_summary table already exists');
    }
    
    // Check for ceo_weekly_reports
    const { data: weeklyReports, error: weeklyError } = await supabase
      .from('ceo_weekly_reports')
      .select('*')
      .limit(1);
    
    if (weeklyError?.code === '42P01') {
      console.log('❌ ceo_weekly_reports table does not exist');
    } else if (!weeklyError) {
      console.log('✅ ceo_weekly_reports table already exists');
    }
    
    // Check for ceo_monthly_reports
    const { data: monthlyReports, error: monthlyError } = await supabase
      .from('ceo_monthly_reports')
      .select('*')
      .limit(1);
    
    if (monthlyError?.code === '42P01') {
      console.log('❌ ceo_monthly_reports table does not exist');
    } else if (!monthlyError) {
      console.log('✅ ceo_monthly_reports table already exists');
    }
    
    console.log('\nTo create the missing tables, please run the following SQL commands in the Supabase SQL Editor:');
    console.log('\n--- SQL Commands to Execute ---\n');
    
    console.log(`-- 1. Create executive_summary table
CREATE TABLE IF NOT EXISTS executive_summary (
  clinic text,
  month text,
  traffic_source text,
  appointments numeric,
  appointments_new numeric,
  appointments_returning numeric,
  estimated_ltv_6m numeric,
  estimated_revenue numeric,
  conversations numeric,
  conversations_new numeric,
  conversations_returning numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create ceo_weekly_reports table
CREATE TABLE IF NOT EXISTS ceo_weekly_reports (
  week numeric,
  company text,
  clinic text,
  impressions numeric,
  visits numeric,
  leads numeric,
  appointments numeric,
  spend numeric,
  ltv numeric,
  roas numeric,
  conversion_rate numeric,
  cost_per_lead numeric,
  cost_per_appointment numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Create ceo_monthly_reports table
CREATE TABLE IF NOT EXISTS ceo_monthly_reports (
  month text,
  company text,
  clinic text,
  impressions numeric,
  visits numeric,
  leads numeric,
  appointments numeric,
  spend numeric,
  ltv numeric,
  roas numeric,
  conversion_rate numeric,
  cost_per_lead numeric,
  cost_per_appointment numeric,
  created_at timestamp with time zone DEFAULT now()
);`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables().catch(console.error);