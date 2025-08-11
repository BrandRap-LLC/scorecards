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
  console.log('Creating missing tables...\n');

  // Create executive_summary table
  console.log('Creating executive_summary table...');
  const { error: execSummaryError } = await supabase.rpc('exec', {
    query: `
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
    `
  });

  if (execSummaryError) {
    console.error('Error creating executive_summary:', execSummaryError);
  } else {
    console.log('✅ executive_summary table created successfully');
  }

  // Create ceo_weekly_reports table
  console.log('\nCreating ceo_weekly_reports table...');
  const { error: weeklyError } = await supabase.rpc('exec', {
    query: `
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
    `
  });

  if (weeklyError) {
    console.error('Error creating ceo_weekly_reports:', weeklyError);
  } else {
    console.log('✅ ceo_weekly_reports table created successfully');
  }

  // Create ceo_monthly_reports table
  console.log('\nCreating ceo_monthly_reports table...');
  const { error: monthlyError } = await supabase.rpc('exec', {
    query: `
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
      );
    `
  });

  if (monthlyError) {
    console.error('Error creating ceo_monthly_reports:', monthlyError);
  } else {
    console.log('✅ ceo_monthly_reports table created successfully');
  }

  // Verify tables were created
  console.log('\nVerifying tables...');
  const { data: tables, error: verifyError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .in('table_name', ['executive_summary', 'ceo_weekly_reports', 'ceo_monthly_reports'])
    .eq('table_schema', 'public');

  if (verifyError) {
    console.error('Error verifying tables:', verifyError);
  } else {
    console.log('\nCreated tables:');
    tables?.forEach(table => {
      console.log(`  ✅ ${table.table_name}`);
    });
  }
}

createTables().catch(console.error);