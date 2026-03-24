import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Verify Supabase session from Authorization header
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  // org_id must come from verified token metadata — never from request body
  const orgId = user.user_metadata?.org_id as string | undefined
  if (!orgId) {
    return NextResponse.json({ error: 'No organisation associated with this account' }, { status: 403 })
  }

  const { data: licenses, error: licError } = await supabaseAdmin
    .from('portal_licenses')
    .select('id, license_key, product, tier, status, seats, max_api_calls, max_data_sources, starts_at, expires_at, monthly_value')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (licError) return NextResponse.json({ error: licError.message }, { status: 500 })

  return NextResponse.json(licenses ?? [])
}
