import { createClient } from '@supabase/supabase-js'

// Public client — safe to use in browser and server components

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')

const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!supabasePublishableKey) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set')

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
