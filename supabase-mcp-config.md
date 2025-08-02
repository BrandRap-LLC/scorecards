# Supabase MCP Configuration

## Connection Details
- **Project ID**: igzswopyyggvelncjmuh
- **Database Name**: cpr-report
- **Project URL**: https://igzswopyyggvelncjmuh.supabase.co
- **Database Password**: CPRREPORT1!
- **Anon Public Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTMxMzAsImV4cCI6MjA2OTU4OTEzMH0.g-EQYp4vKIYkztjotC1xTk1ox5CM5PxyJ7IZxst6o6I
- **Service Role Secret**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAxMzEzMCwiZXhwIjoyMDY5NTg5MTMwfQ.UX5kR9UnLARsZRJzXXtmsvtV0xyw_KIjivxFxf5FMKw

## MCP Server Installation
- **Location**: /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server
- **Node.js Path**: /opt/homebrew/bin/node
- **Built File**: /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server/dist/index.js

## Connection String
```
postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres
```

## Full MCP Command
```
/opt/homebrew/bin/node /Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server/dist/index.js postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres
```

## For Cursor IDE Setup
1. Open Cursor Settings > Features > MCP
2. Click "+ Add New MCP Server"
3. Fill in:
   - Name: "Supabase CPR Report"
   - Type: command (stdio transport)
   - Command: (use the full command above)
4. Click "Add Server" and refresh

## For Windsurf/Cascade Setup
Edit `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "supabase-cpr": {
      "command": "/opt/homebrew/bin/node",
      "args": [
        "/Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server/dist/index.js",
        "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"
      ]
    }
  }
}
```

## Available Tools
- Table management (create, drop, rename)
- Record operations (CRUD)
- Index and constraint management
- Function and trigger creation
- Security policies
- Real-time features
- Direct SQL queries