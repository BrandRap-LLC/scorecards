# MCP Integration for Scorecards Project

## Overview

This project has been configured to work with MCP (Model Context Protocol) servers available in Claude Desktop. The integration provides seamless access to databases, AI models, and development tools.

## Available MCP Servers

### 1. 🗄️ Supabase MCP (Database Operations)
- **Status**: ✅ Configured and tested
- **Purpose**: PostgreSQL database operations
- **Tables**: executive_monthly_reports, executive_weekly_reports, paid_ads, seo_channels, etc.

### 2. 💾 MSSQL MCP (Data Source)
- **Status**: ✅ Configured and tested
- **Purpose**: Extract data from Microsoft SQL Server
- **Tables**: executive_report_new_month, executive_report_new_week, marketing_score_card_daily

### 3. 🤖 Replicate MCP (AI Models)
- **Status**: ✅ Available in Claude Desktop
- **Purpose**: AI model deployment and predictions
- **Use Cases**: Chart generation, data insights, predictions

### 4. 💻 IDE MCP (Development Tools)
- **Status**: ✅ Available in Claude Desktop
- **Purpose**: VS Code integration, diagnostics, code execution
- **Features**: TypeScript diagnostics, Jupyter notebook execution

## Quick Start

### 1. Start MCP Servers

```bash
# Start all configured MCP servers
./scripts/start-mcp-servers.sh start

# Check server status
./scripts/start-mcp-servers.sh status
```

### 2. Use in Your Code

#### TypeScript/React Components

```typescript
import { useMCP } from '@/hooks/useMCP';

function Dashboard() {
  const { status, getExecutiveReports, loading, error } = useMCP();
  
  useEffect(() => {
    async function loadData() {
      const reports = await getExecutiveReports('clinic-1', '2025-01');
      console.log(reports);
    }
    loadData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>MCP Status</h1>
      <pre>{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
```

#### API Routes

```typescript
// app/api/data/route.ts
import { SupabaseMCP } from '@/lib/mcp-integration';

export async function GET() {
  const result = await SupabaseMCP.getExecutiveReports();
  return Response.json(result);
}
```

#### Direct MCP Usage

```typescript
import MCP from '@/lib/mcp-integration';

// Check MCP status
const status = await MCP.Status.checkAll();

// Get executive reports
const reports = await MCP.Supabase.getExecutiveReports('clinic-1');

// Sync data from MSSQL to Supabase
const syncResult = await MCP.DataSync.syncExecutiveMonthly();

// Subscribe to real-time changes
const subscription = MCP.Supabase.subscribeToChanges('executive_monthly_reports', (payload) => {
  console.log('Data changed:', payload);
});
```

## Available Hooks

### `useMCP()`
Main hook for MCP operations:
- `status`: Current status of all MCP servers
- `loading`: Loading state
- `error`: Error state
- `getExecutiveReports()`: Fetch executive reports
- `syncData()`: Trigger data synchronization
- `checkStatus()`: Re-check MCP server status

### `useWeeklyReports(clinic, weeks)`
Fetch weekly reports for a specific clinic:
```typescript
const { data, loading, error } = useWeeklyReports('clinic-1', 12);
```

### `usePaidAdsPerformance(startDate, endDate)`
Get paid advertising performance data:
```typescript
const { data, loading, error } = usePaidAdsPerformance('2025-01-01', '2025-01-31');
```

### `useSEOData()`
Fetch SEO channels and keywords:
```typescript
const { channels, keywords, loading, error } = useSEOData();
```

### `useMCPSubscription(table, onUpdate)`
Subscribe to real-time database changes:
```typescript
useMCPSubscription('executive_monthly_reports', (payload) => {
  console.log('Data updated:', payload);
});
```

## API Endpoints

### `/api/mcp/status`
Check the status of all MCP servers:
```bash
curl http://localhost:3000/api/mcp/status
```

### `/api/mcp/executive-reports`
Fetch executive reports:
```bash
curl "http://localhost:3000/api/mcp/executive-reports?clinic=clinic-1&month=2025-01"
```

### `/api/mcp/sync`
Trigger data synchronization:
```bash
curl -X POST http://localhost:3000/api/mcp/sync \
  -H "Content-Type: application/json" \
  -d '{"target": "executive"}'
```

## File Structure

```
scorecards/
├── lib/
│   └── mcp-integration.ts       # Core MCP integration library
├── hooks/
│   └── useMCP.ts                # React hooks for MCP
├── app/api/mcp/
│   ├── status/route.ts          # Status check endpoint
│   ├── executive-reports/route.ts # Executive reports endpoint
│   └── sync/route.ts            # Data sync endpoint
├── scripts/
│   ├── start-mcp-servers.sh     # Server startup script
│   └── sync-using-mcp.py        # Python sync script
└── MCP documentation files
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://igzswopyyggvelncjmuh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MSSQL
MSSQL_SERVER=54.245.209.65
MSSQL_PORT=1433
MSSQL_DATABASE=aggregated_reporting
MSSQL_USERNAME=supabase
MSSQL_PASSWORD=R#8kZ2w$tE1Q

# Replicate (optional)
REPLICATE_API_TOKEN=your_replicate_token
```

## Data Flow

```
MSSQL Server → Extract (MCP) → Transform → Load (MCP) → Supabase
     ↓              ↓              ↓           ↓           ↓
[Source Data] → [Extract] → [Process] → [Validate] → [Store]
                                                        ↓
                                                  [Your App]
```

## Example: Complete Data Pipeline

```typescript
// Example: Full data pipeline implementation
import MCP from '@/lib/mcp-integration';

async function runDataPipeline() {
  try {
    // 1. Check MCP status
    const status = await MCP.Status.checkAll();
    if (!status.mssql || !status.supabase) {
      throw new Error('Required MCP servers not available');
    }
    
    // 2. Extract from MSSQL
    const sourceData = await MCP.MSSQL.extractExecutiveMonthly('2025-01');
    
    // 3. Transform data
    const transformedData = sourceData.data.map(record => ({
      ...record,
      processed_at: new Date().toISOString()
    }));
    
    // 4. Load to Supabase
    const result = await MCP.DataSync.syncExecutiveMonthly({
      sourceTable: 'executive_report_new_month',
      targetTable: 'executive_monthly_reports',
      transform: (data) => transformedData
    });
    
    // 5. Verify sync
    if (result.success) {
      console.log(`Synced ${result.recordsProcessed} records`);
    }
    
    return result;
  } catch (error) {
    console.error('Pipeline failed:', error);
    throw error;
  }
}
```

## Troubleshooting

### MCP Server Not Running
```bash
# Check status
./scripts/start-mcp-servers.sh status

# Restart servers
./scripts/start-mcp-servers.sh restart
```

### Database Connection Issues
```bash
# Test Supabase connection
psql "postgresql://postgres:CPRREPORT1!@db.igzswopyyggvelncjmuh.supabase.co:5432/postgres"

# Test MSSQL connection
sqlcmd -S 54.245.209.65 -U supabase -P "R#8kZ2w$tE1Q" -d aggregated_reporting
```

### TypeScript Errors
```typescript
// Ensure proper imports
import MCP from '@/lib/mcp-integration';
import { useMCP } from '@/hooks/useMCP';

// Check tsconfig.json for path aliases
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Best Practices

1. **Always check MCP status** before performing operations
2. **Use hooks in React components** for automatic state management
3. **Implement error handling** for all MCP operations
4. **Use environment variables** for sensitive configuration
5. **Batch operations** when possible for better performance
6. **Set up monitoring** for production deployments

## Support

For detailed documentation:
- [MCP Usage Guide](./MCP_USAGE_GUIDE.md)
- [MCP Quick Reference](./MCP_QUICK_REFERENCE.md)
- [MCP Servers Config](./MCP_SERVERS_CONFIG.md)

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Production Ready