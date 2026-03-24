import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const [{ data: orgs, error: orgsError }, { data: activeLicenses, error: licError }] = await Promise.all([
    supabaseAdmin.from('portal_organizations').select('status'),
    supabaseAdmin.from('portal_licenses').select('monthly_value').eq('status', 'ACTIVE'),
  ])

  if (orgsError) return NextResponse.json({ error: orgsError.message }, { status: 500 })
  if (licError) return NextResponse.json({ error: licError.message }, { status: 500 })

  const allOrgs = orgs ?? []
  const allActiveLicenses = activeLicenses ?? []

  const totalClients = allOrgs.length
  const activeClients = allOrgs.filter((o: { status: string }) => o.status === 'ACTIVE' || o.status === 'TRIAL').length
  const churnedClients = allOrgs.filter((o: { status: string }) => o.status === 'CHURNED').length
  const churnRate = totalClients > 0 ? Math.round((churnedClients / totalClients) * 100) : 0

  const mrr = allActiveLicenses.reduce((sum: number, l: { monthly_value: string }) => sum + Number(l.monthly_value), 0)
  const arr = mrr * 12

  return NextResponse.json({
    mrr,
    arr,
    totalClients,
    activeClients,
    activeLicenses: allActiveLicenses.length,
    churnRate,
  })
}
