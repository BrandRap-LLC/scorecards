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

This is a Next.js 15.4.5 application using TypeScript and Tailwind CSS v4 for an executive analytics dashboard tracking clinic operations across multiple companies.

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js and Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns v4

### Data Flow Architecture

1. **Primary Data Sources** (Active Tables Used in Project):
   
   **Executive Reports**:
   - `executive_monthly_reports` - Monthly executive metrics (580 rows)
   - `executive_weekly_reports` - Weekly executive metrics (2,169 rows)
   
   **Marketing Analytics**:
   - `paid_ads` - Paid advertising data by campaign (907 rows)
   - `seo_channels` - SEO channel performance data (232 rows)
   - `seo_highlights_keyword_page_one` - Top ranking keywords (159 rows)
   
   **CEO Metrics** (Legacy tables - may need schema updates):
   - `ceo_metrics` - Monthly KPI tracking (6,380 rows)
   - `ceo_metrics_weekly` - Weekly KPI tracking (26,796 rows)

2. **Data Model** (Executive Reports):
   ```
   executive_monthly_reports / executive_weekly_reports
   ├── Dimensions
   │   ├── clinic (11 unique)
   │   ├── month/week (time period)
   │   └── traffic_source (8 channels)
   └── Metrics
       ├── Marketing: impressions, visits, spend
       ├── Leads: leads, conversion_rate, %new_conversion, %returning_conversion
       ├── Acquisition: cac_total, cac_new
       ├── Appointments: total, new, returning, online
       ├── Engagement: conversations (total, new, returning)
       └── Revenue: ltv, estimated_ltv_6m, avg_ltv, roas
   ```

3. **MSSQL Source Tables** (for sync operations):
   - `executive_report_new_month` → `executive_monthly_reports`
   - `executive_report_new_week` → `executive_weekly_reports`
   - `marketing_score_card_daily` → `paid_ads` (potential source)
   - SEO data sources (TBD)

### Application Structure (Planned)

**Routes** (App Router):
- `/dashboard/[company]` - Company-specific dashboard with all metrics
- `/compare` - Multi-company comparison view
- `/analytics` - Deep dive analytics

**API Layer** (`/lib`):
- `api-executive.ts`: Functions for executive_monthly_reports queries
- `api-weekly.ts`: Functions for weekly reports and CEO metrics
- `api-paid-seo.ts`: Functions for paid ads and SEO channel queries
- `supabase.ts`: Supabase client configuration
- `utils.ts`: Formatting utilities (currency, percent, numbers)
- `calculations.ts`: Derived metrics and KPI calculations

**Type System** (`/types`):
- `executive.ts`: Executive monthly report types
- `dashboard.ts`: Dashboard component prop types
- `charts.ts`: Chart data structure types

### Key Metrics Tracked
- **Marketing Performance**: Impressions, Visits, Spend by traffic source
- **Lead Generation**: Total leads, Conversion rates (including %new and %returning)
- **Customer Acquisition**: CAC (total and new), Cost per lead
- **Appointments**: Total, New, Returning, Online bookings
- **Engagement**: Conversations (total, new, returning)
- **Revenue/ROI**: LTV, ROAS, Estimated 6-month LTV
- **Paid Ads**: Campaign-level performance, CTR, spend efficiency
- **SEO**: Keyword rankings, page one visibility, organic traffic

### Data Format Types
- `currency`: USD formatting without decimals
- `number`: Formatted with thousands separator
- `percent`: Stored as decimal (0.85 = 85%), displayed as percentage
- `rating`: Numeric ratings

### Environment Variables

Required in `.env.local`:
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MSSQL Configuration (for data sync)
MSSQL_SERVER=server_address
MSSQL_PORT=1433
MSSQL_DATABASE=database_name
MSSQL_USERNAME=username
MSSQL_PASSWORD=password
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

## Project Documentation and Migration Notes

### 📚 Documentation Created
- MCP_USAGE_GUIDE.md - Comprehensive Guide
  - Complete setup and usage instructions
  - Detailed examples for both Supabase and MSSQL
  - Security best practices
  - Performance optimization tips
  - Troubleshooting guide
  - Integration patterns

- MCP_QUICK_REFERENCE.md - Quick Reference Card
  - Fast access to common commands
  - Connection details
  - Common SQL queries
  - Troubleshooting shortcuts
  - File locations

- scripts/start-mcp-servers.sh - Automated Startup Script
  - Start/stop/status/restart commands
  - Error handling and validation
  - Colored output for easy reading
  - PID management for process control

- MCP_SETUP_SUMMARY.md - Setup Overview
  - Summary of what was accomplished
  - Quick start instructions
  - Available capabilities
  - Next steps

### ✅ MCP Server Status
- Supabase MCP Server: ✅ Connected and tested
- MSSQL MCP Server: ✅ Connected and tested (with Python 3.11)

### 🚀 Server Management
- Start the servers: `./scripts/start-mcp-servers.sh start`
- Check status: `./scripts/start-mcp-servers.sh status`
- Stop servers: `./scripts/start-mcp-servers.sh stop`

### 📊 Available Capabilities
- Supabase: Full database operations, table management, real-time features
- MSSQL: List tables, read data, execute queries on CEO report table

### ✅ Completed Migration
- Successfully migrated `executive_report_new_month` from MSSQL to Supabase
- Created new table `executive_monthly_reports` without affecting existing data
- 572 records migrated containing monthly executive metrics

### 📊 Active Supabase Tables
**Executive Reports**:
- `executive_monthly_reports`: 580 records (Dec 2024 - Aug 2025)
- `executive_weekly_reports`: 2,169 records (weekly data)

**Marketing Analytics**:
- `paid_ads`: 907 records (campaign-level paid advertising data)
- `seo_channels`: 232 records (SEO channel performance)
- `seo_highlights_keyword_page_one`: 159 records (top ranking keywords)

**CEO Metrics**:
- `ceo_metrics`: 6,380 records (monthly KPIs)
- `ceo_metrics_weekly`: 26,796 records (weekly KPIs)

### 🛠️ Data Sync Script
- `scripts/sync-mssql-to-supabase.js` - Main sync script for all 5 tables
  - Syncs all tables: `node scripts/sync-mssql-to-supabase.js`
  - Sync specific table: `node scripts/sync-mssql-to-supabase.js --table=executiveMonthly`
  - Dry run mode: `node scripts/sync-mssql-to-supabase.js --dry-run`
- See `DATA_SYNC_GUIDE.md` for complete sync instructions
```