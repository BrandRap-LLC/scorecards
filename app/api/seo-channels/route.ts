import { NextRequest, NextResponse } from 'next/server';
import { fetchSeoChannelsData } from '@/lib/api-paid-seo';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinic = searchParams.get('clinic') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const data = await fetchSeoChannelsData(clinic, startDate, endDate);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in seo-channels API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO channels data' },
      { status: 500 }
    );
  }
}