import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; licenseId: string } }
) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  let body: unknown
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const { revokedReason } = (body as Record<string, unknown>)

  const { data: license, error: findError } = await supabaseAdmin
    .from('portal_licenses')
    .select('*')
    .eq('id', params.licenseId)
    .eq('org_id', params.id)
    .single()

  if (findError || !license) {
    return NextResponse.json({ error: 'License not found' }, { status: 404 })
  }
  if (license.status === 'REVOKED') {
    return NextResponse.json({ error: 'License is already revoked' }, { status: 409 })
  }

  const { data: updated, error } = await supabaseAdmin
    .from('portal_licenses')
    .update({
      status: 'REVOKED',
      revoked_at: new Date().toISOString(),
      revoked_reason: typeof revokedReason === 'string' ? revokedReason.trim() || null : null,
    })
    .eq('id', params.licenseId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(updated)
}
