import { NextRequest, NextResponse } from 'next/server';
import { fetchPaidAdsData } from '@/lib/api-paid-seo';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clinic = searchParams.get('clinic') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const data = await fetchPaidAdsData(clinic, startDate, endDate);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in paid-ads API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paid ads data' },
      { status: 500 }
    );
  }
}