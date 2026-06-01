import { createClient } from '@supabase/supabase-js'

// Server-only admin client — never import this in client components
// Uses SUPABASE_SECRET_KEY which is not exposed to the browser

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')

const supabaseKey = process.env.SUPABASE_SECRET_KEY
if (!supabaseKey) throw new Error('SUPABASE_SECRET_KEY is not set')

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
