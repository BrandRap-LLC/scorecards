# MCP Quick Reference Card

## 🚀 Quick Start Commands

### Start Supabase MCP Server
```bash
cd /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server
/opt/homebrew/bin/node dist/index.js "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"
```

### Start MSSQL MCP Server
```bash
cd /Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server
source venv/bin/activate
MSSQL_DRIVER="FreeTDS" MSSQL_HOST="54.245.209.65" MSSQL_USER="supabase" MSSQL_PASSWORD="R#8kZ2w\$tE1Q" MSSQL_DATABASE="aggregated_reporting" TrustServerCertificate="yes" Trusted_Connection="no" ODBCINI="/Users/haris/.odbcinst.ini" python -m mssql_mcp_server.server
```

## 📊 Common Database Queries

### Supabase Queries

#### List All Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

#### Get Recent Data
```sql
SELECT * FROM weekly_metrics 
WHERE company_id = 'company_001'
ORDER BY week_ending DESC 
LIMIT 100;
```

#### Insert New Data
```sql
INSERT INTO weekly_metrics (company_id, metric_name, metric_value, week_ending)
VALUES ('company_001', 'revenue', 150000.00, '2024-01-07');
```

### MSSQL Queries

#### List All Tables
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';
```

#### Get CEO Report Data
```sql
SELECT TOP 100 * FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
ORDER BY [Week_Ending] DESC;
```

#### Get Recent Weekly Data
```sql
SELECT [Company_ID], [Metric_Name], [Metric_Value], [Week_Ending]
FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
WHERE [Week_Ending] >= DATEADD(week, -4, GETDATE())
ORDER BY [Week_Ending] DESC;
```

## 🔧 Connection Details

### Supabase
- **URL**: `https://igzswopyyggvelncjmuh.supabase.co`
- **Database**: `cpr-report`
- **Connection**: `postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres`

### MSSQL
- **Host**: `54.245.209.65:1433`
- **Database**: `aggregated_reporting`
- **User**: `supabase`
- **Password**: `R#8kZ2w$tE1Q`
- **Target Table**: `[aggregated_reporting].[dbo].[ceo_report_full_week]`

## 🛠️ Troubleshooting

### Test Connections
```bash
# Test Supabase
psql "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# Test MSSQL
sqlcmd -S 54.245.209.65 -U supabase -P "R#8kZ2w$tE1Q" -d aggregated_reporting
```

### Common Issues
- **Supabase timeout**: Check network connectivity
- **MSSQL ODBC error**: Install FreeTDS: `brew install freetds`
- **Python version**: Ensure Python 3.11+ for MSSQL server

## 📁 File Locations

```
/Users/haris/Desktop/projects/mcp-v2/
├── supabase-mcp-server/     # Supabase MCP Server
├── mssql-mcp-server/       # MSSQL MCP Server
└── scorecards/             # Your project
    ├── MCP_USAGE_GUIDE.md  # Full documentation
    ├── MCP_QUICK_REFERENCE.md  # This file
    ├── supabase-mcp-config.md   # Supabase config
    └── mssql-mcp-config.md     # MSSQL config
```

## 🔄 Data Sync Pattern

### Extract from MSSQL → Load to Supabase
```sql
-- 1. Extract from MSSQL
SELECT * FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
WHERE [Week_Ending] = '2024-01-07';

-- 2. Insert into Supabase
INSERT INTO weekly_metrics (company_id, metric_name, metric_value, week_ending)
SELECT Company_ID, Metric_Name, Metric_Value, Week_Ending
FROM mssql_extracted_data;
```

## 📞 Support

- **Full Documentation**: `MCP_USAGE_GUIDE.md`
- **Configuration Files**: `supabase-mcp-config.md`, `mssql-mcp-config.md`
- **Server Logs**: Check terminal output for error messages
- **Connection Testing**: Use the test commands above

---

**Last Updated**: January 2025  
**Version**: 1.0 