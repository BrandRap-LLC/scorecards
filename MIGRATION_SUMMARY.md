# MSSQL to Supabase Migration Summary

## 📊 Overview

This document summarizes the migration of executive and CEO reporting data from MSSQL to Supabase for the Scorecards project.

## ✅ Completed Tasks

1. **Analyzed MSSQL Database Structure**
   - Identified 28 tables in total
   - Found 4 executive-related tables
   - Found 2 CEO reporting tables (weekly and monthly)
   - Discovered scorecard-related tables

2. **Created Migration Infrastructure**
   - Set up MCP servers for both MSSQL and Supabase connections
   - Created multiple migration scripts
   - Established table creation SQL scripts

3. **Identified Tables for Migration**

| Source Table (MSSQL) | Target Table (Supabase) | Rows | Status |
|---------------------|------------------------|------|---------|
| executive_report_new_month | executive_monthly_reports | 580 | ✅ Already Migrated |
| executive_report_new_week | executive_weekly_reports | 2,170 | 🔄 Ready to Migrate |
| executive_summary | executive_summary | 599 | 🔄 Ready to Migrate |
| ceo_report_full_week | ceo_weekly_reports | 27,115 | 🔄 Ready to Migrate |
| ceo_report_full_month | ceo_monthly_reports | 6,380 | 🔄 Ready to Migrate |

## 🛠️ Scripts Created

### Migration Scripts
- `/scripts/migrate-all-tables-simple.js` - Main migration script
- `/scripts/create-supabase-tables.js` - Table creation helper
- `/scripts/list-all-mssql-tables.js` - MSSQL table discovery
- `/scripts/recreate-tables-direct.js` - SQL generation script
- `/scripts/verify-tables.js` - Table verification script
- `/scripts/create-tables-sql.sql` - Complete SQL for table creation

### Utility Scripts
- `/scripts/start-mcp-servers.sh` - MCP server management
- `/scripts/check-tables.js` - Supabase table checker

## 📋 Next Steps to Complete Migration

### 1. Create Tables in Supabase (Required First)

The tables need to be created with the exact schema matching MSSQL. Run the SQL provided in `/scripts/create-tables-sql.sql` in your Supabase SQL Editor:

```bash
# View the SQL that needs to be executed
node scripts/recreate-tables-direct.js
```

### 2. Verify Tables Were Created

```bash
node scripts/verify-tables.js
```

### 3. Run Migration

Once tables are created, you have two options:

#### Option A: Use Direct Migration Script
```bash
node scripts/migrate-all-tables-simple.js
```

#### Option B: Use MCP Servers
```bash
# Ensure MCP servers are running
./scripts/start-mcp-servers.sh status

# If not running, start them
./scripts/start-mcp-servers.sh start

# Then use Claude Code to migrate via MCP tools
```

## ⚠️ Important Notes

1. **Schema Matching**: The Supabase tables must have columns that exactly match MSSQL, including:
   - Case-sensitive column names (e.g., `Company_Name`)
   - Special character columns (e.g., `%total_conversion`)
   - Proper data types

2. **Data Validation**: After migration, validate:
   - Row counts match between source and target
   - Sample data integrity
   - No truncation or data loss

3. **Existing Data**: The migration scripts will clear existing data in target tables before inserting new data.

## 🔍 Troubleshooting

### MSSQL Connection Issues
- Direct connection may fail due to authentication
- Use MCP servers as an alternative: `./scripts/start-mcp-servers.sh start`

### Schema Mismatch Errors
- Ensure tables are created with exact column names from MSSQL
- Check for case sensitivity in column names
- Verify special characters in column names are properly quoted

### Migration Performance
- Large tables are migrated in batches (1000 rows default)
- Adjust batch size in migration scripts if needed
- Monitor Supabase rate limits for large migrations

## 📊 Current Status

- **executive_monthly_reports**: ✅ Successfully migrated (580 rows)
- **Other tables**: 🔄 Awaiting table creation in Supabase with correct schema

Once the tables are created with the correct schema, the migration can be completed using the provided scripts.