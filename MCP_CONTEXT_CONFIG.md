# MCP Context Configuration - Zilliz Integration

## Overview
This document outlines the integration of Zilliz Context MCP server for semantic code search and context retrieval in the scorecards project.

## Zilliz Context MCP Server Configuration

### Installation

**Method 1: Using Claude CLI (Recommended)**
```bash
# Add the context MCP server using Claude CLI with credentials
claude mcp add claude-context \
  -e OPENAI_API_KEY=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 \
  -e MILVUS_TOKEN=cf8126aedd481149eba5e64fb222e8f179e4dfb89f5c1794dee12a3bd3c716a61c86c9b7fd8d8beda6ce2da23fa4e6903b5e22c6 \
  -- npx @zilliz/claude-context-mcp@latest
```

**Method 2: Manual Installation**
```bash
# Install the Zilliz Context MCP package
npm install -g @zilliz/claude-context-mcp

# Or run directly with npx
npx @zilliz/claude-context-mcp@latest
```

### Claude Desktop Configuration
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "/opt/homebrew/bin/node",
      "args": ["/Users/haris/Desktop/projects/mcp-v2/supabase-mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://igzswopyyggvelncjmuh.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    },
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
        "Trusted_Connection": "no"
      }
    },
    "claude-context": {
      "command": "npx",
      "args": ["@zilliz/claude-context-mcp@latest"],
      "env": {
        "OPENAI_API_KEY": "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",
        "MILVUS_TOKEN": "cf8126aedd481149eba5e64fb222e8f179e4dfb89f5c1794dee12a3bd3c716a61c86c9b7fd8d8beda6ce2da23fa4e6903b5e22c6",
        "COLLECTION_NAME": "scorecards_codebase",
        "EMBEDDING_MODEL": "text-embedding-3-small",
        "CHUNK_SIZE": "1000",
        "OVERLAP_SIZE": "200",
        "MAX_RESULTS": "10"
      }
    }
  }
}
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Existing Supabase and MSSQL variables...

# Zilliz Context Configuration
OPENAI_API_KEY=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
MILVUS_TOKEN=cf8126aedd481149eba5e64fb222e8f179e4dfb89f5c1794dee12a3bd3c716a61c86c9b7fd8d8beda6ce2da23fa4e6903b5e22c6
COLLECTION_NAME=scorecards_codebase
EMBEDDING_MODEL=text-embedding-3-small
CHUNK_SIZE=1000
OVERLAP_SIZE=200
```

## Integration in Application

### Enhanced MCP Framework

The updated MCP integration (`/lib/mcp-integration.ts`) now includes:

```typescript
import MCP from '@/lib/mcp-integration'

// Initialize all MCP servers including context
await MCP.initialize()

// Check all server status including context
const status = await MCP.Status.checkAll()
console.log('Context MCP available:', status.context)
```

### Context Operations

```typescript
// Search for code patterns semantically
const results = await MCP.searchCode('dashboard component implementation', {
  limit: 10,
  threshold: 0.7,
  collection: 'scorecards_codebase'
})

// Index the current project
const indexResult = await MCP.indexCurrentProject({
  extensions: ['.tsx', '.ts', '.js', '.jsx', '.md'],
  excludePatterns: ['node_modules', '.next', 'dist', '.git']
})

// Find related code files
const related = await MCP.findRelatedCode('./components/DashboardLayout.tsx', 5)
```

### Advanced Context Features

```typescript
import { ZillizContextMCP } from '@/lib/mcp-integration'

// Search for specific patterns
const chartPatterns = await ZillizContextMCP.searchPatterns(
  'recharts implementation with responsive design',
  { 
    fileTypes: ['.tsx', '.ts'], 
    limit: 15 
  }
)

// Get documentation for entities
const docs = await ZillizContextMCP.getDocumentation(
  'MetricCard component',
  { 
    includeExamples: true, 
    contextWindow: 500 
  }
)

// Find related code implementations
const relatedComponents = await ZillizContextMCP.getRelatedCode(
  './components/MetricCard.tsx',
  { limit: 8, threshold: 0.75 }
)
```

## Project Indexing Strategy

### Recommended File Structure for Indexing

```
/scorecards
├── app/                    # Next.js app router pages (HIGH PRIORITY)
│   ├── dashboard/
│   ├── analytics/
│   ├── campaigns/
│   └── seo/
├── components/             # React components (HIGH PRIORITY)
│   ├── DashboardLayout.tsx
│   ├── MetricCard.tsx
│   ├── DataTable.tsx
│   └── ChartContainer.tsx
├── lib/                    # Utilities and API functions (MEDIUM PRIORITY)
│   ├── api-executive.ts
│   ├── mcp-integration.ts
│   └── supabase.ts
├── types/                  # TypeScript definitions (HIGH PRIORITY)
│   ├── dashboard.ts
│   ├── executive.ts
│   └── charts.ts
├── hooks/                  # Custom React hooks (MEDIUM PRIORITY)
└── scripts/               # Build and sync scripts (LOW PRIORITY)
```

### Index Configuration

```typescript
const projectIndexConfig = {
  // High priority files for semantic search
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.md', '.json'],
  
  // Exclude patterns to avoid noise
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    '.git',
    'coverage',
    '*.test.*',
    '*.spec.*',
    'package-lock.json'
  ],
  
  // Optimal chunk settings for code
  chunkSize: 1000,
  overlapSize: 200
}
```

## Usage Scenarios

### 1. Component Discovery
```typescript
// Find all dashboard-related components
const dashboardComponents = await MCP.searchCode(
  'dashboard layout navigation components',
  { limit: 15, threshold: 0.6 }
)
```

### 2. API Pattern Search
```typescript
// Find similar API implementations
const apiPatterns = await ZillizContextMCP.searchPatterns(
  'Supabase database query with error handling',
  { fileTypes: ['.ts'], limit: 10 }
)
```

### 3. Related Code Discovery
```typescript
// Find all files related to data visualization
const chartRelated = await ZillizContextMCP.getRelatedCode(
  './components/ChartContainer.tsx',
  { limit: 12, threshold: 0.7 }
)
```

### 4. Documentation Retrieval
```typescript
// Get all documentation for data table functionality
const tablesDocs = await ZillizContextMCP.getDocumentation(
  'DataTable component with filtering',
  { includeExamples: true, contextWindow: 800 }
)
```

## Performance Optimization

### Indexing Best Practices

1. **Incremental Indexing**: Only reindex changed files
2. **Smart Chunking**: Optimize chunk size based on file types
3. **Priority Indexing**: Index high-priority files first
4. **Batch Operations**: Index multiple files in batches

### Search Optimization

1. **Threshold Tuning**: Adjust similarity thresholds based on use case
2. **Result Limits**: Use appropriate limits to balance quality vs speed
3. **Caching**: Cache frequent search results
4. **Context Windows**: Optimize context window sizes for different queries

## Monitoring and Analytics

### Context Search Metrics

Track these metrics for optimal performance:

- **Search Response Time**: Average time for context queries
- **Index Coverage**: Percentage of codebase indexed
- **Search Accuracy**: Relevance of returned results  
- **Cache Hit Rate**: Efficiency of result caching

### Health Checks

```typescript
// Check context server health
const contextHealth = await MCP.Status.checkContext()

// Monitor index status
const indexStats = await ZillizContextMCP.getIndexStats()
```

## Integration with Development Workflow

### 1. Code Review Enhancement
```typescript
// Find similar implementations during code review
const similarCode = await MCP.searchCode('data validation patterns')
```

### 2. Refactoring Support
```typescript
// Find all usages of deprecated patterns
const deprecatedUsage = await ZillizContextMCP.searchPatterns(
  'old component pattern that needs refactoring'
)
```

### 3. Documentation Generation
```typescript
// Extract documentation for API endpoints
const apiDocs = await ZillizContextMCP.getDocumentation('API route handlers')
```

## Security and Privacy

### Data Protection
- **Code Encryption**: All indexed code is encrypted in vector storage
- **Access Control**: Team-based access to indexed collections
- **Audit Logging**: All search queries are logged for compliance
- **Token Management**: Secure API token storage and rotation

### Privacy Considerations
- **Local Processing**: Sensitive code can be processed locally
- **Selective Indexing**: Choose which files/directories to index
- **Data Retention**: Configure automatic cleanup of old indexes

## Troubleshooting

### Common Issues

1. **Indexing Failures**
   ```bash
   # Check Zilliz connectivity
   curl -H "Authorization: Bearer $ZILLIZ_TOKEN" $ZILLIZ_ENDPOINT/v1/health
   
   # Verify collection exists
   node -e "console.log(await MCP.Context.listCollections())"
   ```

2. **Search Quality Issues**
   - Lower threshold for broader results
   - Increase chunk size for better context
   - Review embedding model selection

3. **Performance Issues**
   - Monitor vector database response times
   - Optimize query parameters
   - Consider index optimization

### Debug Commands

```bash
# Test context integration
node -e "
const MCP = require('./lib/mcp-integration.ts').default;
MCP.initialize().then(() => {
  return MCP.searchCode('dashboard components');
}).then(console.log);
"

# Check index status
npx @zilliz/claude-context-mcp status --collection=scorecards_codebase
```

## Next Steps

1. **Install and Configure**: Set up Zilliz Context MCP server
2. **Index Project**: Run initial project indexing
3. **Test Integration**: Verify semantic search functionality
4. **Optimize Settings**: Tune thresholds and parameters
5. **Monitor Performance**: Set up metrics and alerting

---

**Status**: Ready for implementation  
**Priority**: High - Enhances development productivity  
**Dependencies**: Zilliz Cloud account, embedding model access