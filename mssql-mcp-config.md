# MSSQL MCP Configuration

## Connection Details
- **MSSQL Host**: 54.245.209.65
- **MSSQL Port**: 1433
- **MSSQL Username**: supabase
- **MSSQL Password**: R#8kZ2w$tE1Q
- **MSSQL Database**: aggregated_reporting
- **Target Table**: [aggregated_reporting].[dbo].[ceo_report_full_week]
- **Trust Server Certificate**: yes
- **Trusted Connection**: no

## MCP Server Installation
- **Location**: /Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server
- **Python Path**: /Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server/venv/bin/python3
- **Note**: Requires Python 3.11+ (currently using Python 3.9.6)

## Environment Variables
```bash
export MSSQL_DRIVER="FreeTDS"
export MSSQL_HOST="54.245.209.65"
export MSSQL_USER="supabase"
export MSSQL_PASSWORD="R#8kZ2w\$tE1Q"
export MSSQL_DATABASE="aggregated_reporting"
export TrustServerCertificate="yes"
export Trusted_Connection="no"
export ODBCINI="/Users/haris/.odbcinst.ini"
```

## MCP Command
```bash
MSSQL_DRIVER="FreeTDS" \
MSSQL_HOST="54.245.209.65" \
MSSQL_USER="supabase" \
MSSQL_PASSWORD="R#8kZ2w\$tE1Q" \
MSSQL_DATABASE="aggregated_reporting" \
TrustServerCertificate="yes" \
Trusted_Connection="no" \
ODBCINI="/Users/haris/.odbcinst.ini" \
/Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server/venv/bin/python3 -m mssql_mcp_server
```

## For Cursor IDE Setup
```json
{
  "mcpServers": {
    "mssql": {
      "command": "/Users/haris/Desktop/projects/mcp-v2/mssql-mcp-server/venv/bin/python3",
      "args": ["-m", "mssql_mcp_server"],
      "env": {
        "MSSQL_DRIVER": "FreeTDS",
        "MSSQL_HOST": "54.245.209.65",
        "MSSQL_USER": "supabase",
        "MSSQL_PASSWORD": "R#8kZ2w$tE1Q",
        "MSSQL_DATABASE": "aggregated_reporting",
        "TrustServerCertificate": "yes",
        "Trusted_Connection": "no",
        "ODBCINI": "/Users/haris/.odbcinst.ini"
      }
    }
  }
}
```

## Available Tools
- **list_tables** - List all tables in the database
- **read_table** - Read data from a specific table
- **execute_query** - Execute SQL queries (with safety controls)

## Security Notes
- Create a dedicated read-only user for the MCP server
- Restrict permissions to only necessary tables
- Never use administrative credentials
- Enable SQL Server auditing for monitoring