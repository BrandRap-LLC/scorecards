# Cloudflare Pages Deployment Plan

## Current Status: ⚠️ NOT READY

The application currently uses Next.js App Router with Server Components that fetch data directly from Supabase. This needs to be modified for Cloudflare Pages compatibility.

## Issues to Address

### 1. Server Components with Direct Database Access
**Problem**: The following pages use async Server Components with direct Supabase queries:
- `/data-quality/page.tsx` - Fetches data directly in the component
- `/goals/page.tsx` - Fetches data directly in the component

**Solution**: Convert to Client Components or use API routes

### 2. Environment Variables
**Problem**: Environment variables need to be configured in Cloudflare Pages
**Required Variables**:
```
NEXT_PUBLIC_SUPABASE_URL=https://igzswopyyggvelncjmuh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## Deployment Plan

### Phase 1: Code Modifications (Required)

#### Option A: Full Static Export (Recommended for Cloudflare Pages)
1. Convert Server Components to Client Components
2. Move data fetching to client-side using useEffect
3. Add loading states for all data fetching
4. Update next.config.ts for static export

#### Option B: Use Edge Runtime (Alternative)
1. Keep Server Components but use Edge Runtime
2. Configure for Cloudflare Workers compatibility
3. More complex but maintains SSR benefits

### Phase 2: Configuration Updates

1. **Update next.config.ts**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // For static export
  images: {
    unoptimized: true  // Required for static export
  },
  // Disable features not supported in static export
  experimental: {
    appDir: true
  }
};

export default nextConfig;
```

2. **Update package.json**:
```json
{
  "scripts": {
    "build": "next build",
    "export": "next build && next export",
    "cf-build": "npm run build"
  }
}
```

### Phase 3: Convert Server Components

#### For /data-quality/page.tsx:
```typescript
'use client'
import { useState, useEffect } from 'react'
// ... rest of the component with client-side fetching
```

#### For /goals/page.tsx:
```typescript
'use client'
import { useState, useEffect } from 'react'
// ... rest of the component with client-side fetching
```

### Phase 4: Cloudflare Pages Setup

1. **Connect GitHub Repository**
   - Go to Cloudflare Pages dashboard
   - Click "Create application"
   - Connect GitHub account
   - Select the repository

2. **Build Configuration**:
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `npm run build`
   - Build output directory: `out`
   - Root directory: `dashboard`

3. **Environment Variables**:
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy Settings**:
   - Production branch: `main`
   - Preview deployments: Enable for all branches

### Phase 5: Testing

1. Test local static build:
```bash
npm run build
npx serve out
```

2. Verify all pages load correctly
3. Check data fetching works
4. Test all interactive features

## Alternative: Use Vercel (Easier Option)

If you want to keep Server Components and SSR:
- **Vercel** natively supports all Next.js features
- No code changes required
- Simply connect repo and deploy

## Estimated Timeline

- **Option A (Static Export)**: 2-3 hours of code changes
- **Option B (Edge Runtime)**: 4-6 hours of configuration
- **Alternative (Vercel)**: 15 minutes, no code changes

## Recommendation

For fastest deployment with minimal changes:
1. **Use Vercel** instead of Cloudflare Pages
2. Keep all existing Server Components
3. No code modifications needed

For Cloudflare Pages specifically:
1. Convert to static export (Option A)
2. This requires converting 2 server components to client components
3. Add proper loading states
4. Test thoroughly before deployment

## Next Steps

1. Choose deployment strategy (Static Export vs Vercel)
2. If Cloudflare Pages: Convert server components
3. Test local build
4. Configure Cloudflare Pages
5. Deploy