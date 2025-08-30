# Dashboard Implementation Plan

## Phase 1: Core Infrastructure & Types

### 1. Type Definitions (/types)
- [x] `executive.ts` - Executive monthly/weekly report types
- [x] `dashboard.ts` - Dashboard component prop types  
- [x] `charts.ts` - Chart data structure types

### 2. API Layer Updates (/lib)
- [x] `api-executive.ts` - Executive report queries
- [x] `calculations.ts` - KPI calculations and derived metrics
- [x] Updated utilities for the new dashboard needs

### 3. Core Components (/components)
- [x] `DashboardLayout.tsx` - Main layout with sidebar navigation
- [x] `MetricCard.tsx` - KPI cards with trend indicators
- [x] `DataTable.tsx` - Full-featured data grid with sorting/filtering
- [x] `ChartContainer.tsx` - Recharts wrapper components
- [x] `FilterPanel.tsx` - Company/date/traffic source filters
- [x] `TrendIndicator.tsx` - Up/down/neutral trend arrows

## Phase 2: Route Structure (/app)

### Dashboard Routes
- [x] `/dashboard` - Executive overview with key metrics
- [x] `/dashboard/[company]` - Company-specific detailed view
- [x] `/analytics` - Time series analysis and trends
- [x] `/campaigns` - Paid advertising campaign performance  
- [x] `/seo` - SEO and organic performance
- [x] `/compare` - Multi-company comparison tools
- [x] `/data` - Raw data tables and export functionality

### Page Components
- [x] Executive Dashboard - Key metrics cards + summary charts
- [x] Company Detail - Full metrics breakdown for single company
- [x] Analytics - Time series charts and trend analysis
- [x] Campaign Performance - Paid ads data with ROI focus
- [x] SEO Performance - Organic traffic and keyword rankings
- [x] Comparison - Side-by-side company metrics
- [x] Data Tables - Raw data with export capabilities

## Phase 3: Data Integration

### Supabase Tables Used
- [x] `executive_monthly_reports` (585 records) - Primary monthly metrics
- [x] `executive_weekly_reports` (2,391 records) - Weekly metrics
- [x] `paid_ads` (816 records) - Campaign performance  
- [x] `seo_channels` (232 records) - SEO traffic sources
- [x] `seo_highlights_keyword_page_one` (162 records) - Top keywords

### Key Metrics Tracked
**Marketing Performance**: Impressions, Visits, Spend by source
**Lead Generation**: Total leads, Conversion rates (new/returning)
**Customer Acquisition**: CAC total/new, Cost per lead
**Appointments**: Total, New, Returning, Online bookings
**Engagement**: Conversations (total, new, returning)
**Revenue/ROI**: LTV, ROAS, Estimated 6-month LTV

## Phase 4: Features

### Interactive Features
- [x] Company filtering (all companies or individual)
- [x] Date range selection (monthly/weekly views)
- [x] Traffic source filtering (Paid, SEO, Direct, etc.)
- [x] Sort/filter data tables
- [x] Export to CSV functionality
- [x] Responsive mobile design

### Visualizations (Recharts)
- [x] Line charts for trends over time
- [x] Bar charts for comparative metrics
- [x] Area charts for traffic source breakdown
- [x] Pie charts for revenue attribution
- [x] Combined charts for multi-metric views

## Implementation Priority
1. ✅ Type definitions and API layer
2. ✅ Core reusable components  
3. ✅ Dashboard layout and navigation
4. ✅ Executive overview page
5. 🔄 Company detail pages
6. ⏳ Analytics and comparison views
7. ⏳ Campaign and SEO specialized views
8. ⏳ Data export and mobile optimization

## Design System
- **Colors**: Blue primary (#2563eb), Gray scale for data
- **Typography**: Geist Sans for UI, Geist Mono for data
- **Spacing**: Consistent 4px grid system
- **Cards**: White backgrounds with subtle shadows
- **Tables**: Striped rows, sticky headers, responsive horizontal scroll