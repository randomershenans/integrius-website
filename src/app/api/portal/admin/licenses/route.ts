import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const { data: licenses, error } = await supabaseAdmin
    .from('portal_licenses')
    .select(`
      id, license_key, product, tier, status, seats,
      max_api_calls, max_data_sources, monthly_value,
      starts_at, expires_at, revoked_at, revoked_reason, created_at,
      portal_organizations ( id, name, email, slug )
    `)
    .order('expires_at', { ascending: true, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(licenses ?? [])
}
