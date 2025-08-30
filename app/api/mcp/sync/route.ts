import { NextRequest, NextResponse } from 'next/server';
import { MCPDataSync } from '@/lib/mcp-integration';

/**
 * API Route: POST /api/mcp/sync
 * Trigger data synchronization between MSSQL and Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target = 'executive' } = body;
    
    let result;
    
    switch (target) {
      case 'executive':
        result = await MCPDataSync.syncExecutiveMonthly();
        break;
      
      case 'all':
        result = await MCPDataSync.syncAll();
        break;
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown sync target: ${target}`
          },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}