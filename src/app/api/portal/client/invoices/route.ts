import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientSession } from '@/lib/portal-client-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getClientSession(req)
  if (session instanceof NextResponse) return session

  const { data: invoices, error } = await supabaseAdmin
    .from('portal_invoices')
    .select('id, amount, currency, status, period, paid_at, due_at, created_at')
    .eq('org_id', session.orgId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(invoices ?? [])
}
