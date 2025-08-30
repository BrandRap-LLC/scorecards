import { NextResponse } from 'next/server';
import { MCPStatus } from '@/lib/mcp-integration';

/**
 * API Route: GET /api/mcp/status
 * Check the status of all MCP servers
 */
export async function GET() {
  try {
    const status = await MCPStatus.checkAll();
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}