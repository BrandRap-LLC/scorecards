const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use the same environment variables as your production deployment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igzswopyyggvelncjmuh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTMxMzAsImV4cCI6MjA2OTU4OTEzMH0.g-EQYp4vKIYkztjotC1xTk1ox5CM5PxyJ7IZxst6o6I';

// For table creation, we need the service role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required to create tables.');
  console.log('\n📋 Please run this script with the service role key:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" node scripts/fix-seo-highlights-production.js');
  console.log('\nAlternatively, you can manually create the table using the Supabase SQL editor.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSEOHighlightsProduction() {
  console.log('🔧 Fixing SEO Highlights in Production...\n');
  
  try {
    // 1. Create the table
    console.log('1. Creating seo_highlights_keyword_page_one table...');
    
    const createTableSQL = `
-- Create the SEO highlights table
CREATE TABLE IF NOT EXISTS seo_highlights_keyword_page_one (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  query_group VARCHAR(255),
  query VARCHAR(500) NOT NULL,
  period DATE NOT NULL,
  period_type VARCHAR(50) NOT NULL,
  current_rank NUMERIC(10,2) NOT NULL,
  baseline_avg_rank NUMERIC(10,2) NOT NULL,
  highlight_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_highlights_company ON seo_highlights_keyword_page_one(company_name);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_period ON seo_highlights_keyword_page_one(period);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_period_type ON seo_highlights_keyword_page_one(period_type);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_rank ON seo_highlights_keyword_page_one(current_rank);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_query ON seo_highlights_keyword_page_one(query);

-- Grant permissions
GRANT ALL ON seo_highlights_keyword_page_one TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE seo_highlights_keyword_page_one_id_seq TO postgres, anon, authenticated, service_role;
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    }).single();
    
    if (createError) {
      // Try direct execution if RPC doesn't work
      console.log('   Note: Direct table creation may require manual execution in Supabase SQL editor.');
      console.log('\n📋 Copy and paste this SQL into your Supabase SQL editor:\n');
      console.log(createTableSQL);
    } else {
      console.log('✅ Table created successfully!');
    }
    
    // 2. Check if table exists now
    console.log('\n2. Verifying table exists...');
    const { error: checkError } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Table still not accessible. Please create it manually in Supabase SQL editor.');
      return;
    }
    
    console.log('✅ Table verified!');
    
    // 3. Add sample data for testing (optional)
    console.log('\n3. Adding sample test data...');
    
    const sampleData = [
      {
        company_name: 'advancedlifeclinic.com',
        query_group: 'Botox, Cosmetic Procedures',
        query: 'botox near me',
        period: '2025-01-01',
        period_type: 'monthly',
        current_rank: 1,
        baseline_avg_rank: 5.2,
        highlight_reason: 'Achieved #1 ranking'
      },
      {
        company_name: 'advancedlifeclinic.com',
        query_group: 'Dermal Fillers',
        query: 'lip fillers specialist',
        period: '2025-01-01',
        period_type: 'monthly',
        current_rank: 2,
        baseline_avg_rank: 8.7,
        highlight_reason: 'Top 3 ranking achieved'
      },
      {
        company_name: 'alluraderm.com',
        query_group: 'Medical Spa',
        query: 'medical spa treatments',
        period: '2025-01-01',
        period_type: 'monthly',
        current_rank: 3,
        baseline_avg_rank: 12.4,
        highlight_reason: 'Significant improvement'
      }
    ];
    
    const { error: insertError } = await supabase
      .from('seo_highlights_keyword_page_one')
      .insert(sampleData);
    
    if (insertError) {
      console.log('⚠️  Could not add sample data:', insertError.message);
      console.log('   This is okay - you can migrate real data later.');
    } else {
      console.log('✅ Sample data added for testing!');
    }
    
    console.log('\n✅ SEO Highlights table is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. If you have production data in MSSQL, run: node scripts/migrate-seo-highlights-simple.js');
    console.log('2. Test your deployed site - SEO highlights should now appear!');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

fixSEOHighlightsProduction();
