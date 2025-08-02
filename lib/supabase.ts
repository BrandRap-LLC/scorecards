import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables. Please check your .env.local file.'
  if (isBrowser) {
    console.error(errorMsg)
  }
  throw new Error(errorMsg)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)