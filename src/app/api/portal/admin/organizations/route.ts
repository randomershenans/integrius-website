import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const { data: orgs, error: orgsError } = await supabaseAdmin
    .from('portal_organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (orgsError) return NextResponse.json({ error: orgsError.message }, { status: 500 })

  // Fetch active licenses for all orgs to compute activeLicenseCount and mrrContribution
  const orgIds = (orgs ?? []).map((o: { id: string }) => o.id)
  let activeLicenses: { org_id: string; monthly_value: string }[] = []
  if (orgIds.length > 0) {
    const { data: licData, error: licError } = await supabaseAdmin
      .from('portal_licenses')
      .select('org_id, monthly_value')
      .eq('status', 'ACTIVE')
      .in('org_id', orgIds)

    if (licError) return NextResponse.json({ error: licError.message }, { status: 500 })
    activeLicenses = licData ?? []
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (orgs ?? []).map((org: any) => {
    const orgLicenses = activeLicenses.filter(l => l.org_id === org.id)
    return {
      id: org.id as string,
      name: org.name as string,
      slug: org.slug as string,
      email: org.email as string,
      phone: org.phone as string | null,
      website: org.website as string | null,
      status: org.status as string,
      healthScore: org.health_score as number,
      createdAt: org.created_at as string,
      activeLicenseCount: orgLicenses.length,
      mrrContribution: orgLicenses.reduce((sum, l) => sum + Number(l.monthly_value), 0),
    }
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, slug, email, phone, website, status, notes, healthScore } = body as Record<string, unknown>

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'slug is required and must be lowercase alphanumeric with hyphens' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'valid email is required' }, { status: 400 })
  }

  const { data: org, error } = await supabaseAdmin
    .from('portal_organizations')
    .insert({
      name: (name as string).trim(),
      slug: (slug as string).trim(),
      email: (email as string).trim().toLowerCase(),
      phone: typeof phone === 'string' ? phone.trim() || null : null,
      website: typeof website === 'string' ? website.trim() || null : null,
      status: (['ACTIVE', 'SUSPENDED', 'CHURNED', 'TRIAL'].includes(status as string) ? status : 'ACTIVE') as string,
      notes: typeof notes === 'string' ? notes.trim() || null : null,
      health_score: typeof healthScore === 'number' ? healthScore : 100,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An organisation with that slug or email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(org, { status: 201 })
}
