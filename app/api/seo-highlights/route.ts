import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { searchParams } = new URL(request.url)
  const clinic = searchParams.get('clinic')
  
  if (!clinic) {
    return NextResponse.json({ error: 'Clinic parameter is required' }, { status: 400 })
  }
  
  try {
    // Get all highlights for this clinic
    const { data, error } = await supabase
      .from('seo_highlights_keyword_page_one')
      .select('*')
      .eq('company_name', clinic)
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