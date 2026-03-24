import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const { data: org, error: orgError } = await supabaseAdmin
    .from('portal_organizations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (orgError || !org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

  const [{ data: licenses, error: licError }, { data: invoices, error: invError }] = await Promise.all([
    supabaseAdmin
      .from('portal_licenses')
      .select('*')
      .eq('org_id', params.id)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('portal_invoices')
      .select('*')
      .eq('org_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  if (licError) return NextResponse.json({ error: licError.message }, { status: 500 })
  if (invError) return NextResponse.json({ error: invError.message }, { status: 500 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapLicense = (l: any) => ({
    id: l.id,
    licenseKey: l.license_key,
    product: l.product,
    tier: l.tier,
    status: l.status,
    seats: l.seats,
    monthlyValue: l.monthly_value,
    maxDataSources: l.max_data_sources,
    maxApiCalls: l.max_api_calls,
    startsAt: l.starts_at,
    expiresAt: l.expires_at,
    revokedAt: l.revoked_at,
    revokedReason: l.revoked_reason,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInvoice = (i: any) => ({
    id: i.id,
    amount: i.amount,
    currency: i.currency,
    status: i.status,
    period: i.period,
    dueAt: i.due_at,
    paidAt: i.paid_at,
  })

  return NextResponse.json({
    id: org.id,
    name: org.name,
    slug: org.slug,
    email: org.email,
    phone: org.phone,
    website: org.website,
    status: org.status,
    healthScore: org.health_score,
    notes: org.notes,
    createdAt: org.created_at,
    licenses: (licenses ?? []).map(mapLicense),
    invoices: (invoices ?? []).map(mapInvoice),
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, slug, email, phone, website, status, notes, healthScore } = body as Record<string, unknown>

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 })
  }
  if (slug !== undefined && (typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug))) {
    return NextResponse.json({ error: 'slug must be lowercase alphanumeric with hyphens' }, { status: 400 })
  }
  if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
    return NextResponse.json({ error: 'valid email is required' }, { status: 400 })
  }
  if (status !== undefined && !['ACTIVE', 'SUSPENDED', 'CHURNED', 'TRIAL'].includes(status as string)) {
    return NextResponse.json({ error: 'invalid status value' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {
    ...(name !== undefined && { name: (name as string).trim() }),
    ...(slug !== undefined && { slug: (slug as string).trim() }),
    ...(email !== undefined && { email: (email as string).trim().toLowerCase() }),
    ...(phone !== undefined && { phone: typeof phone === 'string' ? phone.trim() || null : null }),
    ...(website !== undefined && { website: typeof website === 'string' ? website.trim() || null : null }),
    ...(status !== undefined && { status: status as string }),
    ...(notes !== undefined && { notes: typeof notes === 'string' ? notes.trim() || null : null }),
    ...(healthScore !== undefined && typeof healthScore === 'number' && { health_score: healthScore }),
  }

  const { data: updated, error } = await supabaseAdmin
    .from('portal_organizations')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })
    }
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An organisation with that slug or email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const { data: updated, error } = await supabaseAdmin
    .from('portal_organizations')
    .update({ status: 'CHURNED' })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
