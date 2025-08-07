import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function dropColumns() {
  console.log('Starting column removal from executive_monthly_reports table...\n');

  const columnsToRemove = [
    'avg_appointment_rev',
    'avg_estimated_ltv_6m',
    'avg_ltv',
    'ltv'
  ];

  for (const column of columnsToRemove) {
    try {
      console.log(`Dropping column: ${column}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `ALTER TABLE executive_monthly_reports DROP COLUMN IF EXISTS ${column};`
      });

      if (error) {
        // If RPC doesn't exist, try direct query
        console.log(`RPC failed, trying direct query...`);
        const result = await supabase
          .from('executive_monthly_reports')
          .select('*')
          .limit(0);
        
        // Since we can't directly execute ALTER TABLE through Supabase client,
        // we'll need to use a raw SQL approach
        throw new Error('Direct ALTER TABLE not supported through Supabase client. Please use psql or Supabase dashboard.');
      }

      console.log(`✅ Successfully dropped column: ${column}`);
    } catch (err) {
      console.error(`❌ Failed to drop column ${column}:`, err.message);
    }
  }

  console.log('\nColumn removal process completed.');
}

// Execute the function
dropColumns().catch(console.error);