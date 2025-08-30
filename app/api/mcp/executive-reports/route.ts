import { NextRequest, NextResponse } from 'next/server';
import { SupabaseMCP } from '@/lib/mcp-integration';

/**
 * API Route: GET /api/mcp/executive-reports
 * Fetch executive reports using Supabase MCP
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinic = searchParams.get('clinic') || undefined;
    const month = searchParams.get('month') || undefined;
    
    const result = await SupabaseMCP.getExecutiveReports(clinic, month);
    
    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count
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