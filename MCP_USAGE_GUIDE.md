# MCP Usage Guide for Scorecards Project

This guide explains how to use the Model Context Protocol (MCP) servers for Supabase and MSSQL in the scorecards project.

## Overview

The project uses two MCP servers to interact with different databases:
- **Supabase MCP Server**: PostgreSQL database for the main application
- **MSSQL MCP Server**: Microsoft SQL Server for legacy data access

## Server Locations

```
/Users/haris/Desktop/projects/mcp-v2/
├── supabase-mcp-server/     # Supabase MCP Server
└── mssql-mcp-server/       # MSSQL MCP Server
```

## 1. Supabase MCP Server

### Connection Details
- **Project ID**: `igzswopyyggvelncjmuh`
- **Database Name**: `cpr-report`
- **Project URL**: `https://igzswopyyggvelncjmuh.supabase.co`
- **Connection String**: `postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres`

### Available Tools
- **Table Management**: Create, drop, rename tables
- **Record Operations**: CRUD operations on records
- **Index Management**: Create and manage database indexes
- **Function Creation**: Create PostgreSQL functions
- **Security Policies**: Manage Row Level Security (RLS)
- **Real-time Features**: Subscribe to database changes
- **Direct SQL Queries**: Execute custom SQL statements

### Usage Examples

#### List All Tables
```sql
-- Query to list all tables in the database
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

#### Create a New Table
```sql
-- Example: Create a metrics table
CREATE TABLE IF NOT EXISTS weekly_metrics (
    id SERIAL PRIMARY KEY,
    company_id VARCHAR(50),
    metric_name VARCHAR(100),
    metric_value DECIMAL(10,2),
    week_ending DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Insert Data
```sql
-- Example: Insert metric data
INSERT INTO weekly_metrics (company_id, metric_name, metric_value, week_ending)
VALUES 
    ('company_001', 'revenue', 150000.00, '2024-01-07'),
    ('company_001', 'customers', 1250, '2024-01-07');
```

#### Query Data
```sql
-- Example: Get weekly metrics for a company
SELECT metric_name, metric_value, week_ending
FROM weekly_metrics 
WHERE company_id = 'company_001'
ORDER BY week_ending DESC, metric_name;
```

## 2. MSSQL MCP Server

### Connection Details
- **Host**: `54.245.209.65`
- **Port**: `1433`
- **Database**: `aggregated_reporting`
- **Username**: `supabase`
- **Password**: `R#8kZ2w$tE1Q`
- **Target Table**: `[aggregated_reporting].[dbo].[ceo_report_full_week]`

### Available Tools
- **list_tables**: List all tables in the database
- **read_table**: Read data from a specific table
- **execute_query**: Execute SQL queries with safety controls

### Usage Examples

#### List All Tables
```sql
-- Query to list all tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';
```

#### Read Target Table
```sql
-- Read from the main CEO report table
SELECT TOP 100 * FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
ORDER BY [Week_Ending] DESC;
```

#### Query Specific Data
```sql
-- Example: Get recent weekly data
SELECT 
    [Company_ID],
    [Metric_Name],
    [Metric_Value],
    [Week_Ending]
FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
WHERE [Week_Ending] >= DATEADD(week, -4, GETDATE())
ORDER BY [Week_Ending] DESC, [Company_ID];
```

## 3. Integration Patterns

### Data Synchronization
Use both MCPs to sync data between MSSQL and Supabase:

1. **Extract from MSSQL**:
```sql
-- Extract data from MSSQL
SELECT * FROM [aggregated_reporting].[dbo].[ceo_report_full_week]
WHERE [Week_Ending] = '2024-01-07';
```

2. **Transform and Load to Supabase**:
```sql
-- Insert into Supabase
INSERT INTO weekly_metrics (company_id, metric_name, metric_value, week_ending)
SELECT 
    Company_ID,
    Metric_Name,
    Metric_Value,
    Week_Ending
FROM mssql_extracted_data;
```

### Real-time Data Processing
```sql
-- Set up real-time subscriptions in Supabase
-- This allows the application to react to data changes
SELECT * FROM weekly_metrics 
WHERE company_id = 'company_001'
ORDER BY created_at DESC;
```

## 4. Error Handling

### Common Issues and Solutions

#### Supabase Connection Issues
- **Error**: Connection timeout
- **Solution**: Check network connectivity and firewall settings
- **Error**: Authentication failed
- **Solution**: Verify connection string and credentials

#### MSSQL Connection Issues
- **Error**: ODBC driver not found
- **Solution**: Install FreeTDS driver: `brew install freetds`
- **Error**: Trust server certificate
- **Solution**: Set `TrustServerCertificate=yes` in connection string

## 5. Security Best Practices

### Database Access
- Use dedicated read-only users for MCP servers
- Implement Row Level Security (RLS) in Supabase
- Restrict MSSQL permissions to necessary tables only
- Enable SQL Server auditing for monitoring

### Credential Management
- Store credentials in environment variables
- Never commit credentials to version control
- Rotate passwords regularly
- Use connection pooling for better performance

## 6. Performance Optimization

### Query Optimization
```sql
-- Use indexes for better performance
CREATE INDEX idx_weekly_metrics_company_week 
ON weekly_metrics(company_id, week_ending);

-- Use LIMIT for large datasets
SELECT * FROM weekly_metrics 
WHERE company_id = 'company_001'
ORDER BY week_ending DESC 
LIMIT 100;
```

### Connection Management
- Use connection pooling
- Close connections properly
- Implement retry logic for failed connections
- Monitor query execution times

## 7. Monitoring and Logging

### Enable Logging
```bash
# Set log level for debugging
export MCP_LOG_LEVEL=DEBUG
```

### Monitor Queries
- Track query execution times
- Monitor connection pool usage
- Set up alerts for failed connections
- Log all database operations

## 8. Troubleshooting

### Connection Testing
```bash
# Test Supabase connection
psql "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# Test MSSQL connection
sqlcmd -S 54.245.209.65 -U supabase -P "R#8kZ2w$tE1Q" -d aggregated_reporting
```

### Common Commands
```bash
# Restart Supabase MCP server
cd /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server
/opt/homebrew/bin/node dist/index.js "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# Restart MSSQL MCP server
cd /Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server
source venv/bin/activate
MSSQL_DRIVER="FreeTDS" MSSQL_HOST="54.245.209.65" MSSQL_USER="supabase" MSSQL_PASSWORD="R#8kZ2w\$tE1Q" MSSQL_DATABASE="aggregated_reporting" TrustServerCertificate="yes" Trusted_Connection="no" ODBCINI="/Users/haris/.odbcinst.ini" python -m mssql_mcp_server.server
```

## 9. Configuration Files

### Supabase Config (`supabase-mcp-config.md`)
Contains connection details and setup instructions for the Supabase MCP server.

### MSSQL Config (`mssql-mcp-config.md`)
Contains connection details and setup instructions for the MSSQL MCP server.

## 10. Support and Maintenance

### Regular Maintenance
- Update MCP server versions regularly
- Monitor database performance
- Review and update security policies
- Backup configuration files

### Getting Help
- Check server logs for error messages
- Verify network connectivity
- Test connections manually
- Review this documentation for common solutions

---

**Last Updated**: January 2025
**Version**: 1.0
**Maintainer**: Development Team 