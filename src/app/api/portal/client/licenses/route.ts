import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientSession } from '@/lib/portal-client-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getClientSession(req)
  if (session instanceof NextResponse) return session

  const { data: licenses, error } = await supabaseAdmin
    .from('portal_licenses')
    .select('id, license_key, product, tier, status, seats, max_api_calls, max_data_sources, starts_at, expires_at')
    .eq('org_id', session.orgId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(licenses ?? [])
}
