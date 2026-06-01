import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Server-only admin client — never import this in client components.
// Uses SUPABASE_SECRET_KEY which is not exposed to the browser.
//
// The client is created lazily (on first use) rather than at module load, so
// build-time page-data collection — which imports this module without a request
// in flight — does not throw when the env vars are absent (e.g. Netlify deploy
// previews, which do not receive production secrets). A real request still fails
// closed: the env vars are validated here and throw before any privileged call.
let client: SupabaseClient | null = null
function getSupabaseAdmin(): SupabaseClient {
  if (client) return client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  const supabaseKey = process.env.SUPABASE_SECRET_KEY
  if (!supabaseKey) throw new Error('SUPABASE_SECRET_KEY is not set')
  client = createClient(supabaseUrl, supabaseKey)
  return client
}

// Backwards-compatible export: callers keep using `supabaseAdmin.from(...)`,
// but the underlying client is only instantiated on first property access
// (request time), never at module load. Methods are bound to the real client so
// `this` stays correct.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const real = getSupabaseAdmin() as unknown as Record<string | symbol, unknown>
    const value = real[prop]
    return typeof value === 'function' ? value.bind(real) : value
  },
})
