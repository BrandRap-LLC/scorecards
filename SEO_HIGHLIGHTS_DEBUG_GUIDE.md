# SEO Highlights Production Debug Guide

## Current Status

✅ **Table exists** in Supabase: `seo_highlights_keyword_page_one`
✅ **Data exists**: 159 records across multiple companies
✅ **Local API works**: Returns data correctly
❌ **Production issue**: SEO highlights not showing on Vercel deployment

## Debugging Steps

### 1. Test the Production API

Run this from your terminal to test the API endpoint:
```bash
# Replace with your actual Vercel URL
node scripts/test-seo-highlights-api.js https://scorecards.vercel.app
```

### 2. Test in Browser

1. Deploy the latest changes:
   ```bash
   git add -A
   git commit -m "Add SEO highlights debugging and error handling"
   git push origin main
   ```

2. After deployment, visit:
   ```
   https://your-app.vercel.app/test-seo-highlights.html
   ```
   
   This test page will:
   - Test the API endpoint directly
   - Test direct Supabase connection
   - Show any CORS or network errors

### 3. Check Browser Console

On your production site:
1. Open a company's SEO tab (e.g., `/marketing/advancedlifeclinic.com`)
2. Open browser DevTools (F12)
3. Check the Console tab for errors
4. Check the Network tab for failed requests

### 4. Common Issues and Solutions

#### Issue: CORS Error
**Symptom**: Browser console shows CORS policy errors
**Solution**: This shouldn't happen with Next.js API routes, but if it does, check Vercel configuration

#### Issue: 404 Not Found
**Symptom**: API endpoint returns 404
**Solution**: 
- Ensure the API route is deployed: `/app/api/seo-highlights/route.ts`
- Check Vercel build logs for compilation errors

#### Issue: 500 Server Error
**Symptom**: API returns 500 error
**Solution**: 
- Check Vercel Function logs
- Most likely environment variables are missing

#### Issue: Empty Response
**Symptom**: API returns empty array `[]`
**Solution**: 
- Data exists but might be filtered incorrectly
- Check exact company name spelling

### 5. Check Environment Variables

In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Check Vercel Logs

1. Go to Vercel Dashboard
2. Navigate to "Functions" tab
3. Look for `api/seo-highlights` function
4. Check execution logs for errors

## What Changed

1. **Enhanced error handling** in API route to show specific table errors
2. **Added error state** to SEOHighlights component
3. **Added console logging** for debugging
4. **Created test tools** to isolate the issue

## Quick Checklist

- [ ] Environment variables are set in Vercel
- [ ] Latest code is deployed (check deployment time)
- [ ] API route exists at `/api/seo-highlights`
- [ ] No TypeScript compilation errors
- [ ] No CORS errors in browser console
- [ ] Function logs show successful execution

## Expected Behavior

When working correctly:
1. SEO tab loads
2. Brief loading skeleton appears
3. SEO highlights appear at the top showing keyword rankings
4. Console shows: "SEO Highlights loaded: X items for [clinic]"

## If All Else Fails

1. Check if the issue is specific to certain companies
2. Try a different browser or incognito mode
3. Clear browser cache and cookies
4. Check if other API endpoints work (paid ads, etc.)
5. Redeploy from Vercel dashboard

The issue is likely one of:
- Environment variables not set
- Build/deployment issue
- Client-side JavaScript error
- Network/firewall blocking requests
