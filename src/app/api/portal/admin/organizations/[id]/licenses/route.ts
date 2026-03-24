import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { generateLicenseKey } from '@/lib/license-keys'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const { data: org, error: orgError } = await supabaseAdmin
    .from('portal_organizations')
    .select('id')
    .eq('id', params.id)
    .single()

  if (orgError || !org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

  const { data: licenses, error } = await supabaseAdmin
    .from('portal_licenses')
    .select('*')
    .eq('org_id', params.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(licenses ?? [])
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const { data: org, error: orgError } = await supabaseAdmin
    .from('portal_organizations')
    .select('id')
    .eq('id', params.id)
    .single()

  if (orgError || !org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { product, tier, seats, maxApiCalls, maxDataSources, expiresAt, monthlyValue, status } = body as Record<string, unknown>

  const validProducts = ['CORE', 'OPTIC', 'SEARCH', 'SDK']
  const validTiers = ['PILOT', 'ENTERPRISE', 'PLATFORM_LITE', 'PLATFORM']

  if (!product || !validProducts.includes(product as string)) {
    return NextResponse.json({ error: `product must be one of: ${validProducts.join(', ')}` }, { status: 400 })
  }
  if (!tier || !validTiers.includes(tier as string)) {
    return NextResponse.json({ error: `tier must be one of: ${validTiers.join(', ')}` }, { status: 400 })
  }
  if (monthlyValue === undefined || isNaN(Number(monthlyValue)) || Number(monthlyValue) < 0) {
    return NextResponse.json({ error: 'monthlyValue must be a non-negative number' }, { status: 400 })
  }

  const licenseKey = generateLicenseKey(product as string, tier as string)

  const { data: license, error } = await supabaseAdmin
    .from('portal_licenses')
    .insert({
      org_id: params.id,
      license_key: licenseKey,
      product: product as string,
      tier: tier as string,
      status: (['ACTIVE', 'EXPIRED', 'REVOKED', 'SUSPENDED'].includes(status as string) ? status : 'ACTIVE') as string,
      seats: typeof seats === 'number' && seats > 0 ? seats : 1,
      max_api_calls: typeof maxApiCalls === 'number' ? maxApiCalls : null,
      max_data_sources: typeof maxDataSources === 'number' ? maxDataSources : null,
      expires_at: expiresAt ? new Date(expiresAt as string).toISOString() : null,
      monthly_value: Number(monthlyValue),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(license, { status: 201 })
}
