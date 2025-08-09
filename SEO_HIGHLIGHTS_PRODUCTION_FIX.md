# SEO Highlights Production Fix Guide

## 🚨 Issue
SEO highlights are working locally but not showing on the Vercel deployment.

## 🔍 Root Cause
The `seo_highlights_keyword_page_one` table most likely doesn't exist in your production Supabase database.

## 🔧 Quick Fix

### Option 1: Manual Table Creation (Easiest)
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to the SQL Editor
3. Run this SQL:

```sql
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
```

### Option 2: Run Diagnostic Script
First, diagnose the issue:
```bash
node scripts/diagnose-seo-highlights-production.js
```

This will tell you exactly what's wrong.

### Option 3: Automated Fix (Requires Service Key)
If you have your Supabase service role key:
```bash
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" node scripts/fix-seo-highlights-production.js
```

## 📊 Migrate Data

After creating the table, you need to populate it with data:

### If you have MSSQL data source:
```bash
node scripts/migrate-seo-highlights-simple.js
```

### If you don't have production data yet:
The fix script adds sample data for testing. You can verify it's working before migrating real data.

## ✅ Verify the Fix

1. **Check your deployed site** - SEO highlights should now appear at the top of each company's SEO tab

2. **Test the API directly**:
   ```bash
   curl "https://your-app.vercel.app/api/seo-highlights?clinic=advancedlifeclinic.com"
   ```

3. **Check browser console** on the deployed site for any remaining errors

## 🔍 Troubleshooting

### Still not working?
1. **Check environment variables in Vercel**:
   - Go to your Vercel project settings
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly

2. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs → API
   - Look for failed requests to `seo_highlights_keyword_page_one`

3. **Clear Vercel cache**:
   - Trigger a redeployment in Vercel
   - Or push a small change to force rebuild

### Common Issues:
- **404 errors**: Table doesn't exist
- **Empty results**: Table exists but has no data
- **Permission errors**: Grants weren't applied correctly

## 📝 Prevention

To avoid this in the future:
1. Keep track of all database tables in a migration script
2. Document new tables in your deployment guide
3. Test production deployments immediately after adding new features

## 🎯 Expected Result

Once fixed, you should see:
- SEO keyword rankings displayed at the top of each company's SEO tab
- Keywords that achieved top rankings (especially #1 positions)
- Visual indicators for ranking improvements
- Category filters to view highlights by type

The highlights will show:
- Current ranking position
- Previous baseline ranking
- Improvement amount
- Keyword categories
- Special badges for #1 rankings
