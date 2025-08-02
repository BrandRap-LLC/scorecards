import { createClient } from '@supabase/supabase-js'

// Default values for build time - will be replaced with actual values at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igzswopyyggvelncjmuh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnenN3b3B5eWdndmVsbmNqbXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTMxMzAsImV4cCI6MjA2OTU4OTEzMH0.g-EQYp4vKIYkztjotC1xTk1ox5CM5PxyJ7IZxst6o6I'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Only throw error in browser if values are missing
if (isBrowser && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)