# MCP Servers Configuration for Scorecards Project

## Overview
This document provides configuration and usage information for all MCP (Model Context Protocol) servers available in Claude Desktop that can be used with the scorecards project.

## Available MCP Servers

### 1. IDE MCP Server ✅ (Active)
**Purpose**: VS Code integration for diagnostics and code execution
**Status**: Currently active and available

**Available Functions**:
- `mcp__ide__getDiagnostics`: Get language diagnostics from VS Code
- `mcp__ide__executeCode`: Execute Python code in Jupyter kernel

**Usage Example**:
```python
# Get diagnostics for a specific file
mcp__ide__getDiagnostics(uri="file:///path/to/file.ts")

# Execute Python code in Jupyter
mcp__ide__executeCode(code="print('Hello from Jupyter')")
```

### 2. Replicate MCP Server ✅ (Active)
**Purpose**: AI model deployment and management via Replicate API
**Status**: Currently active and available

**Available Functions**:
- `mcp__replicate__list_api_endpoints`: List/search Replicate API endpoints
- `mcp__replicate__get_api_endpoint_schema`: Get endpoint schema
- `mcp__replicate__invoke_api_endpoint`: Invoke Replicate API endpoints

**Capabilities**:
- List collections and models
- Run predictions and trainings
- Manage deployments
- Access hardware configurations

**Usage Example**:
```python
# List available models
mcp__replicate__list_api_endpoints(search_query="models")

# Get schema for a specific endpoint
mcp__replicate__get_api_endpoint_schema(endpoint="list_models")

# Run a prediction
mcp__replicate__invoke_api_endpoint(
    endpoint_name="create_prediction",
    args={
        "model": "stability-ai/sdxl",
        "input": {"prompt": "a beautiful landscape"}
    }
)
```

### 3. Supabase MCP Server ✅ (Configured)
**Purpose**: PostgreSQL database operations for Supabase
**Status**: Configured and tested in this project
**Location**: `/Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server`

**Connection Details**:
- **Database**: `cpr-report`
- **Host**: `db.igzswopyyggvelncjmuh.supabase.co`
- **Port**: 5432
- **Connection String**: `postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres`

**Available Tables**:
- `executive_monthly_reports` (580 records)
- `executive_weekly_reports` (2,169 records)
- `paid_ads` (907 records)
- `seo_channels` (232 records)
- `seo_highlights_keyword_page_one` (159 records)
- `ceo_metrics` (6,380 records)
- `ceo_metrics_weekly` (26,796 records)

**Capabilities**:
- CRUD operations on all tables
- SQL query execution
- Real-time subscriptions
- Row Level Security (RLS) management
- Index management

### 4. MSSQL MCP Server ✅ (Configured)
**Purpose**: Microsoft SQL Server operations
**Status**: Configured and tested in this project
**Location**: `/Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server`

**Connection Details**:
- **Host**: `54.245.209.65`
- **Port**: 1433
- **Database**: `aggregated_reporting`
- **User**: `supabase`

**Available Tables**:
- `[aggregated_reporting].[dbo].[ceo_report_full_week]`
- `[aggregated_reporting].[dbo].[executive_report_new_month]`
- `[aggregated_reporting].[dbo].[executive_report_new_week]`
- `[aggregated_reporting].[dbo].[marketing_score_card_daily]`

**Capabilities**:
- List tables in database
- Read data from tables
- Execute SQL queries with safety controls
- Data extraction for ETL pipelines

## Project-Specific MCP Integration

### Data Pipeline Architecture
```
MSSQL Server → MCP Extract → Transform → Supabase MCP → Load
     ↓                ↓            ↓              ↓          ↓
[Source Data] → [Extract] → [Process] → [Validate] → [Store]
```

### Available Scripts

#### 1. Start MCP Servers
```bash
# Start all configured MCP servers
./scripts/start-mcp-servers.sh start

# Check server status
./scripts/start-mcp-servers.sh status

# Stop servers
./scripts/start-mcp-servers.sh stop
```

#### 2. Sync Data Using MCP
```python
# Python script for MCP-based data synchronization
python scripts/sync-using-mcp.py
```

## MCP Usage in Development Workflow

### 1. Database Operations
```javascript
// Example: Query executive reports from Supabase
const getExecutiveReports = async (clinic, month) => {
  // MCP will handle the database connection and query execution
  const query = `
    SELECT * FROM executive_monthly_reports 
    WHERE clinic = '${clinic}' 
    AND month = '${month}'
  `;
  // Execute via Supabase MCP
};
```

### 2. Data Synchronization
```javascript
// Example: Sync data from MSSQL to Supabase
const syncExecutiveData = async () => {
  // 1. Extract from MSSQL via MCP
  const mssqlData = await extractFromMSSQL('executive_report_new_month');
  
  // 2. Transform data
  const transformedData = transformExecutiveData(mssqlData);
  
  // 3. Load to Supabase via MCP
  await loadToSupabase('executive_monthly_reports', transformedData);
};
```

### 3. AI Model Integration
```javascript
// Example: Generate charts using AI
const generateChart = async (data) => {
  // Use Replicate MCP to generate visualizations
  const result = await mcp__replicate__invoke_api_endpoint(
    'create_prediction',
    {
      model: 'chart-generator',
      input: { data, type: 'bar-chart' }
    }
  );
  return result.output;
};
```

### 4. Code Quality Checks
```javascript
// Example: Get TypeScript diagnostics
const checkCodeQuality = async () => {
  // Use IDE MCP to get diagnostics
  const diagnostics = await mcp__ide__getDiagnostics();
  return diagnostics.filter(d => d.severity === 'error');
};
```

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://igzswopyyggvelncjmuh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MSSQL Configuration
MSSQL_SERVER=54.245.209.65
MSSQL_PORT=1433
MSSQL_DATABASE=aggregated_reporting
MSSQL_USERNAME=supabase
MSSQL_PASSWORD=R#8kZ2w$tE1Q

# Replicate API (if using AI features)
REPLICATE_API_TOKEN=your_replicate_token
```

## MCP Server Management

### Starting Individual Servers

#### Supabase MCP
```bash
cd /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server
/opt/homebrew/bin/node dist/index.js "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"
```

#### MSSQL MCP
```bash
cd /Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server
source venv/bin/activate
MSSQL_DRIVER="FreeTDS" \
MSSQL_HOST="54.245.209.65" \
MSSQL_USER="supabase" \
MSSQL_PASSWORD="R#8kZ2w\$tE1Q" \
MSSQL_DATABASE="aggregated_reporting" \
python -m mssql_mcp_server.server
```

### Server Health Checks

```bash
# Check Supabase connection
psql "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres" -c "SELECT 1"

# Check MSSQL connection
sqlcmd -S 54.245.209.65 -U supabase -P "R#8kZ2w$tE1Q" -d aggregated_reporting -Q "SELECT 1"
```

## Best Practices

### 1. Security
- Never expose MCP credentials in client-side code
- Use environment variables for all sensitive configuration
- Implement proper authentication before exposing MCP endpoints

### 2. Performance
- Use connection pooling for database MCPs
- Implement caching for frequently accessed data
- Batch operations when possible

### 3. Error Handling
- Always implement proper error handling for MCP calls
- Log MCP errors for debugging
- Provide fallback mechanisms for critical operations

### 4. Development Workflow
- Test MCP connections before starting development
- Use MCP status checks in CI/CD pipelines
- Document any custom MCP configurations

## Troubleshooting

### Common Issues and Solutions

1. **MCP Server Not Responding**
   - Check if server is running: `./scripts/start-mcp-servers.sh status`
   - Restart server: `./scripts/start-mcp-servers.sh restart`
   - Check logs for errors

2. **Database Connection Failed**
   - Verify credentials in environment variables
   - Check network connectivity to database hosts
   - Ensure database servers are accessible from your IP

3. **Replicate API Errors**
   - Verify API token is valid
   - Check API rate limits
   - Ensure model exists and is accessible

4. **IDE MCP Not Working**
   - Ensure VS Code is running
   - Check if file paths are correct
   - Verify Jupyter kernel is active for Python execution

## Additional Resources

- [MCP Usage Guide](./MCP_USAGE_GUIDE.md) - Comprehensive usage documentation
- [MCP Quick Reference](./MCP_QUICK_REFERENCE.md) - Quick command reference
- [Data Sync Guide](./DATA_SYNC_GUIDE.md) - Data synchronization patterns
- [Supabase Documentation](https://supabase.com/docs)
- [Replicate Documentation](https://replicate.com/docs)

## Support and Maintenance

For issues or questions about MCP configuration:
1. Check the troubleshooting section above
2. Review server logs for detailed error messages
3. Consult the comprehensive MCP_USAGE_GUIDE.md
4. Contact the development team for additional support

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Production Ready