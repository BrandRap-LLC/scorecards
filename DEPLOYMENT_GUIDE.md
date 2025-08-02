# Deployment Guide - Clinic Performance Report

## ✅ READY FOR DEPLOYMENT

The application has been updated and is now ready for deployment on Cloudflare Pages.

## Quick Deploy to Cloudflare Pages

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create application" → "Connect to Git"
3. Select your GitHub repository
4. Configure build settings:

#### Build Configuration
- **Framework preset**: `Next.js (Static HTML Export)`
- **Build command**: `npm run build`
- **Build output directory**: `out`
- **Root directory (Path to project)**: `dashboard`
- **Node version**: `20.11.0`

#### Environment Variables
Add these in the Cloudflare Pages dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://igzswopyyggvelncjmuh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTMxMzAsImV4cCI6MjA2OTU4OTEzMH0.g-EQYp4vKIYkztjotC1xTk1ox5CM5PxyJ7IZxst6o6I
```

### Step 3: Deploy
Click "Save and Deploy" - Cloudflare will automatically build and deploy your site.

## Alternative: Deploy to Vercel (Even Easier)

### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ceo-report&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&root=dashboard)

### Option B: Manual Deploy
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `dashboard`
4. Add environment variables
5. Deploy

## What Was Changed for Deployment

### 1. Converted to Static Export
- Added `next.config.mjs` with `output: 'export'`
- Converted Server Components to Client Components
- Added loading states for data fetching

### 2. Updated Components
- `/app/data-quality/page.tsx` - Now uses client-side data fetching
- `/app/goals/page.tsx` - Now uses client-side data fetching

### 3. Configuration Files
- `next.config.mjs` - Configured for static export
- `.nvmrc` - Specifies Node.js version 20.11.0

## Testing Locally

### Build and Test Static Export
```bash
cd dashboard
npm run build
npx serve out
```

Visit http://localhost:3000 to test the static build.

## Post-Deployment

### Custom Domain (Optional)
1. In Cloudflare Pages, go to "Custom domains"
2. Add your domain (e.g., `reports.yourclinic.com`)
3. Follow DNS configuration instructions

### Monitoring
- Check Cloudflare Pages Analytics for traffic
- Monitor Web Analytics for performance
- Set up alerts for build failures

## Troubleshooting

### Build Fails
- Check Node version matches `.nvmrc` (20.11.0)
- Verify environment variables are set
- Check build logs for specific errors

### Data Not Loading
- Verify Supabase URL and anon key are correct
- Check browser console for CORS errors
- Ensure Supabase allows requests from your domain

### Pages Not Found
- Verify `trailingSlash: true` in next.config.mjs
- Check that all routes work locally first

## Success Metrics
✅ All pages load without errors
✅ Data fetches from Supabase successfully
✅ Charts and visualizations render correctly
✅ Filtering and interactions work as expected
✅ Export functionality operates properly

## Support
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Next.js Static Export: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- Supabase Docs: https://supabase.com/docs