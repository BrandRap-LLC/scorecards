# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm lint
```

## Architecture Overview

This is a Next.js 15.4.5 application using TypeScript and Tailwind CSS v4 for a weekly performance metrics dashboard tracking clinic operations across multiple companies.

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js and Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns v4

### Data Flow Architecture

1. **Source Data**: MSSQL table `executive_report_new_week` contains weekly metrics
2. **Supabase Integration**: 
   - Data synced to Supabase PostgreSQL tables
   - Views created for optimized querying (`latest_scorecards`, `scorecards_12week_history`)
   - Week-over-week calculations stored in `scorecards_weekly` table

3. **Key Database Tables**:
   - `companies`: Company definitions with display names
   - `scorecards_metrics`: Metric definitions, categories, and formatting rules
   - `scorecards_weekly`: Core data table with weekly values and WoW calculations
   - `latest_scorecards`: View for current week's data
   - `scorecards_12week_history`: View for 12-week historical grid

### Application Structure

**Routes** (App Router):
- `/` - Homepage with current week metrics by company
- `/grid` - 12-week historical grid view
- `/data-quality` - Data sync monitoring

**API Layer** (`/lib`):
- `api-weekly.ts`: Core API functions for weekly scorecard data
- `supabase.ts`: Supabase client configuration
- `utils.ts`: Formatting utilities (currency, percent, numbers)

**Type System** (`/types`):
- `scorecards.ts`: Weekly metrics, grid data, and MSSQL source types
- `database.ts`: Database schema types

### Key Metric Categories
- **Revenue**: Net Sales, Gross Sales, Service Revenue, Product Revenue
- **Customer**: New Customers, Returning Customers, Retention Rate
- **Operations**: Appointments, Show Rate, Utilization, Average Ticket
- **Marketing**: Leads, Conversion Rate, Cost per Lead, ROI

### Data Format Types
- `currency`: USD formatting without decimals
- `number`: Formatted with thousands separator
- `percent`: Stored as decimal (0.85 = 85%), displayed as percentage
- `rating`: Numeric ratings

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Week Handling Logic

- Week numbers: 1-53 based on ISO week standard
- MTD (Month-to-date) flag for incomplete weeks
- WoW (Week-over-week) calculations stored in database
- 12-week rolling history for grid view
- Current week highlighted in grid with special styling

### Deployment

Configured for Vercel deployment via `vercel.json`:
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`

### Path Aliases

TypeScript configured with `@/*` alias pointing to root directory for clean imports.