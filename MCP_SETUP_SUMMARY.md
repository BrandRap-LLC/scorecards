# MCP Setup Summary for Scorecards Project

## ✅ Setup Complete

Both MCP servers have been successfully configured and are ready to use in your scorecards project.

## 📋 What Was Accomplished

### 1. Supabase MCP Server ✅
- **Status**: Working and tested
- **Location**: `/Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server`
- **Connection**: Successfully connected to `cpr-report` database
- **Tools Available**: Table management, CRUD operations, SQL queries, real-time features

### 2. MSSQL MCP Server ✅
- **Status**: Working and tested
- **Location**: `/Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server`
- **Connection**: Successfully connected to `aggregated_reporting` database
- **Tools Available**: List tables, read data, execute queries
- **Target Table**: `[aggregated_reporting].[dbo].[ceo_report_full_week]`

### 3. Documentation Created ✅
- **`MCP_USAGE_GUIDE.md`**: Comprehensive usage guide with examples
- **`MCP_QUICK_REFERENCE.md`**: Quick reference card for common commands
- **`scripts/start-mcp-servers.sh`**: Automated startup script
- **Updated config files**: `supabase-mcp-config.md` and `mssql-mcp-config.md`

## 🚀 How to Use

### Quick Start
```bash
# Start both MCP servers
./scripts/start-mcp-servers.sh start

# Check status
./scripts/start-mcp-servers.sh status

# Stop servers
./scripts/start-mcp-servers.sh stop
```

### Manual Start Commands
```bash
# Supabase MCP Server
cd /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server
/opt/homebrew/bin/node dist/index.js "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# MSSQL MCP Server
cd /Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server
source venv/bin/activate
MSSQL_DRIVER="FreeTDS" MSSQL_HOST="54.245.209.65" MSSQL_USER="supabase" MSSQL_PASSWORD="R#8kZ2w\$tE1Q" MSSQL_DATABASE="aggregated_reporting" TrustServerCertificate="yes" Trusted_Connection="no" ODBCINI="/Users/haris/.odbcinst.ini" python -m mssql_mcp_server.server
```

## 📊 Available Capabilities

### Supabase MCP Server
- **Database Operations**: Create, read, update, delete records
- **Table Management**: Create, drop, rename tables
- **Index Management**: Create and manage database indexes
- **Security**: Manage Row Level Security (RLS) policies
- **Real-time**: Subscribe to database changes
- **SQL Queries**: Execute custom SQL statements

### MSSQL MCP Server
- **List Tables**: Get all tables in the database
- **Read Data**: Read data from specific tables
- **Execute Queries**: Run SQL queries with safety controls
- **Target Table**: Access `[aggregated_reporting].[dbo].[ceo_report_full_week]`

## 🔄 Data Integration Patterns

### Extract from MSSQL → Load to Supabase
```sql
-- 1. Extract from MSSQL
SELECT * FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
WHERE [Week_Ending] = '2024-01-07';

-- 2. Transform and insert into Supabase
INSERT INTO weekly_metrics (company_id, metric_name, metric_value, week_ending)
SELECT Company_ID, Metric_Name, Metric_Value, Week_Ending
FROM mssql_extracted_data;
```

### Real-time Data Processing
```sql
-- Set up real-time subscriptions in Supabase
SELECT * FROM weekly_metrics 
WHERE company_id = 'company_001'
ORDER BY created_at DESC;
```

## 📁 File Structure

```
scorecards/
├── MCP_USAGE_GUIDE.md           # Comprehensive documentation
├── MCP_QUICK_REFERENCE.md       # Quick reference card
├── MCP_SETUP_SUMMARY.md         # This file
├── supabase-mcp-config.md       # Supabase configuration
├── mssql-mcp-config.md          # MSSQL configuration
└── scripts/
    └── start-mcp-servers.sh     # Automated startup script
```

## 🔧 Configuration Details

### Supabase Connection
- **Project ID**: `igzswopyyggvelncjmuh`
- **Database**: `cpr-report`
- **URL**: `https://igzswopyyggvelncjmuh.supabase.co`
- **Connection String**: `postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres`

### MSSQL Connection
- **Host**: `54.245.209.65:1433`
- **Database**: `aggregated_reporting`
- **User**: `supabase`
- **Password**: `R#8kZ2w$tE1Q`
- **Target Table**: `[aggregated_reporting].[dbo].[ceo_report_full_week]`

## 🛠️ Troubleshooting

### Common Issues
1. **Supabase timeout**: Check network connectivity
2. **MSSQL ODBC error**: Install FreeTDS: `brew install freetds`
3. **Python version**: Ensure Python 3.11+ for MSSQL server

### Test Connections
```bash
# Test Supabase
psql "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# Test MSSQL
sqlcmd -S 54.245.209.65 -U supabase -P "R#8kZ2w$tE1Q" -d aggregated_reporting
```

## 📚 Documentation Files

1. **`MCP_USAGE_GUIDE.md`**: Complete guide with examples, security best practices, and troubleshooting
2. **`MCP_QUICK_REFERENCE.md`**: Quick reference for common commands and queries
3. **`supabase-mcp-config.md`**: Supabase MCP server configuration
4. **`mssql-mcp-config.md`**: MSSQL MCP server configuration

## 🎯 Next Steps

1. **Start the servers** using the provided script
2. **Test connections** using the test commands
3. **Explore the databases** using the MCP tools
4. **Build data pipelines** between MSSQL and Supabase
5. **Integrate with your application** for real-time data processing

## 📞 Support

- **Full Documentation**: `MCP_USAGE_GUIDE.md`
- **Quick Reference**: `MCP_QUICK_REFERENCE.md`
- **Configuration Files**: `supabase-mcp-config.md`, `mssql-mcp-config.md`
- **Startup Script**: `scripts/start-mcp-servers.sh`

---

**Setup Completed**: January 2025  
**Status**: ✅ Ready to Use  
**Maintainer**: Development Team 