import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; licenseId: string } }
) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { tier, seats, maxDataSources, maxApiCalls, expiresAt } = body as Record<string, unknown>

  const validTiers = ['STARTER', 'GROWTH', 'ENTERPRISE', 'PLATFORM']

  const updates: Record<string, unknown> = {}

  if (tier !== undefined) {
    if (!validTiers.includes(tier as string)) {
      return NextResponse.json({ error: `tier must be one of: ${validTiers.join(', ')}` }, { status: 400 })
    }
    updates.tier = tier
  }

  if (seats !== undefined) {
    const seatsNum = Number(seats)
    if (isNaN(seatsNum) || seatsNum < 1) {
      return NextResponse.json({ error: 'seats must be a positive integer' }, { status: 400 })
    }
    updates.seats = seatsNum
  }

  if (maxDataSources !== undefined) {
    updates.max_data_sources = maxDataSources === null || maxDataSources === '' ? null : Number(maxDataSources)
  }

  if (maxApiCalls !== undefined) {
    updates.max_api_calls = maxApiCalls === null || maxApiCalls === '' ? null : Number(maxApiCalls)
  }

  if (expiresAt !== undefined) {
    updates.expires_at = expiresAt === null || expiresAt === '' ? null : new Date(expiresAt as string).toISOString()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 })
  }

  const { data: license, error } = await supabaseAdmin
    .from('portal_licenses')
    .update(updates)
    .eq('id', params.licenseId)
    .eq('org_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!license) return NextResponse.json({ error: 'License not found' }, { status: 404 })

  return NextResponse.json(license)
}
