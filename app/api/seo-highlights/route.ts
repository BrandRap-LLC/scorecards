import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')
  
  if (!clinic) {
    return NextResponse.json({ error: 'Clinic parameter is required' }, { status: 400 })
  }
  
  try {
    // Get the most recent period for this clinic
    const { data: recentPeriod, error: periodError } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('period')
      .eq('company_name', clinic)
      .order('period', { ascending: false })
      .limit(1)
      .single()
    
    if (periodError || !recentPeriod) {
      return NextResponse.json([])
    }
    
    // Get all highlights for the most recent period
    const { data, error } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*')
      .eq('company_name', clinic)
      .eq('period', recentPeriod.period)
      .order('current_rank', { ascending: true })
    
    if (error) {
      console.error('Error fetching SEO highlights:', error)
      return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}