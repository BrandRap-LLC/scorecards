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

This is a Next.js 15.4.5 application using TypeScript and Tailwind CSS v4 for an executive analytics dashboard tracking clinic operations across multiple companies. The application exclusively uses the `executive_monthly_reports` table in Supabase for all data visualization and analysis.

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js and Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns v4

### Data Flow Architecture

1. **Primary Data Source**: 
   - **Table**: `executive_monthly_reports` (Supabase)
   - **Origin**: Migrated from MSSQL `executive_report_new_month`
   - **Records**: 572 entries for December 2024
   - **Structure**: 21 metrics across 11 clinics and 8 traffic sources

2. **Data Model**:
   ```
   executive_monthly_reports
   ├── Dimensions
   │   ├── clinic (11 unique)
   │   ├── month (December 2024)
   │   └── traffic_source (8 channels)
   └── Metrics
       ├── Marketing: impressions, visits, spend
       ├── Leads: leads, conversion_rate
       ├── Acquisition: cac_total, cac_new
       ├── Appointments: total, new, returning, online
       ├── Engagement: conversations (total, new, returning)
       └── Revenue: ltv, estimated_ltv_6m, avg_ltv, roas
   ```

3. **Note**: Other tables (`companies`, `scorecards_*`) exist but are NOT used in this project

### Application Structure (Planned)

**Routes** (App Router):
- `/dashboard/[company]` - Company-specific dashboard with all metrics
- `/compare` - Multi-company comparison view
- `/analytics` - Deep dive analytics

**API Layer** (`/lib`):
- `api-executive.ts`: Functions for executive_monthly_reports queries
- `supabase.ts`: Supabase client configuration
- `utils.ts`: Formatting utilities (currency, percent, numbers)
- `calculations.ts`: Derived metrics and KPI calculations

**Type System** (`/types`):
- `executive.ts`: Executive monthly report types
- `dashboard.ts`: Dashboard component prop types
- `charts.ts`: Chart data structure types

### Key Metrics from executive_monthly_reports
- **Marketing Performance**: Impressions, Visits, Spend by traffic source
- **Lead Generation**: Total leads, Conversion rates
- **Customer Acquisition**: CAC (total and new), Cost per lead
- **Appointments**: Total, New, Returning, Online bookings
- **Engagement**: Conversations (total, new, returning)
- **Revenue/ROI**: LTV, ROAS, Estimated 6-month LTV

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

### 📊 Executive Monthly Reports Table
**Table**: `executive_monthly_reports`
**Records**: 572
**Fields**: clinic, month, traffic_source, impressions, visits, spend, ltv, roas, leads, conversion_rate, appointments, conversations
**Date Range**: December 2024
**Migration Script**: `scripts/migrate-direct-insert.js`

### 🛠️ Available Migration Scripts
- `scripts/migrate-direct-insert.js` - Main migration script for monthly data
- `scripts/test-mssql-simple.js` - Test MSSQL connection
- `scripts/check-tables.js` - Check Supabase table status
- `scripts/sync-mssql-to-supabase.js` - Weekly data sync script