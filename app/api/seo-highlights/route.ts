import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Use anon key which is available on client side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey
    })
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
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
      console.error('Supabase error:', error)
      // If table doesn't exist, return a more helpful error
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Table not found', 
          details: 'The seo_highlights_keyword_page_one table does not exist in the database',
          code: error.code,
          solution: 'Please create the table using the SQL script in SEO_HIGHLIGHTS_PRODUCTION_FIX.md'
        }, { status: 500 })
      }
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        code: error.code 
      }, { status: 500 })
    }
    
    // Always return an array, even if empty
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}