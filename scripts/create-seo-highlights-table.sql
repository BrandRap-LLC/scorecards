-- Create SEO Highlights table in Supabase
-- Run this in the Supabase SQL editor first

CREATE TABLE IF NOT EXISTS seo_highlights_keyword_page_one (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  query_group TEXT,
  query TEXT,
  period TIMESTAMP,
  period_type VARCHAR(50),
  current_rank NUMERIC(10,2),
  baseline_avg_rank NUMERIC(10,2),
  highlight_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_seo_highlights_company ON seo_highlights_keyword_page_one(company_name);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_period ON seo_highlights_keyword_page_one(period);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_period_type ON seo_highlights_keyword_page_one(period_type);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_rank ON seo_highlights_keyword_page_one(current_rank);
CREATE INDEX IF NOT EXISTS idx_seo_highlights_query ON seo_highlights_keyword_page_one(query);

-- Grant permissions
GRANT ALL ON seo_highlights_keyword_page_one TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE seo_highlights_keyword_page_one_id_seq TO postgres, anon, authenticated, service_role;