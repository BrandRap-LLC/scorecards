# Cloudflare Pages Deployment Guide

## Updated Deployment Strategy

Due to dynamic routes (`/company/[domain]`), we'll use **Cloudflare Pages with Functions** for Server-Side Rendering instead of static export.

## Deployment Steps

### Step 1: Prepare the Build

Ensure all TypeScript errors are fixed (already done):
- ✅ Fixed `compare/page.tsx` type errors
- ✅ Fixed `data-quality/page.tsx` type errors  
- ✅ Fixed `goals/page.tsx` type errors
- ✅ Updated Node version to 20.11.0

### Step 2: Cloudflare Pages Configuration

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Create a new project and connect your GitHub repository
3. Use these build settings:

**Build Configuration:**
- **Framework preset**: `Next.js`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `dashboard`
- **Node version**: `20` (will use 20.11.0 from .nvmrc)

**Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://igzswopyyggvelncjmuh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTMxMzAsImV4cCI6MjA2OTU4OTEzMH0.g-EQYp4vKIYkztjotC1xTk1ox5CM5PxyJ7IZxst6o6I
```

### Step 3: Deploy

Click "Save and Deploy" - Cloudflare will build and deploy your Next.js app with SSR support.

## Alternative: Deploy to Vercel (Recommended)

For the easiest deployment with full Next.js support:

### Vercel Deployment

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `dashboard`
   - **Framework Preset**: Next.js (auto-detected)
   - **Node Version**: 20.x
4. Add the same environment variables
5. Deploy

**Advantages of Vercel:**
- Native Next.js support
- Zero configuration needed
- Automatic optimizations
- Better performance for Next.js apps
- Free tier is generous

## Testing Build Locally

```bash
cd dashboard
npm run build
npm run start
```

Visit http://localhost:3000 to test.

## Current Build Status

✅ **Build is working** - All TypeScript errors have been fixed
✅ **Node version updated** - Using Node 20.11.0
✅ **Client components** - Converted server components to client-side
✅ **Environment variables** - Properly configured

## Recommended Approach

**For production deployment, I recommend using Vercel** as it provides:
- Native Next.js support
- Automatic HTTPS
- Global CDN
- Zero-config deployment
- Better performance

Cloudflare Pages can work but requires additional configuration for SSR with Next.js App Router.

## Support Links

- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Supabase Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)