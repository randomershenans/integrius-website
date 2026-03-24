import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
  }

  const orgId = user.user_metadata?.org_id as string | undefined
  if (!orgId) {
    return NextResponse.json({ error: 'No organisation associated with this account' }, { status: 403 })
  }

  const { data: invoices, error: invError } = await supabaseAdmin
    .from('portal_invoices')
    .select('id, amount, currency, status, period, paid_at, due_at, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (invError) return NextResponse.json({ error: invError.message }, { status: 500 })

  return NextResponse.json(invoices ?? [])
}
