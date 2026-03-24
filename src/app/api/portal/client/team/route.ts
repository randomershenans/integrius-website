import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

async function getVerifiedOrgId(req: NextRequest): Promise<{ orgId: string } | NextResponse> {
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

  return { orgId }
}

export async function GET(req: NextRequest) {
  const result = await getVerifiedOrgId(req)
  if (result instanceof NextResponse) return result
  const { orgId } = result

  // List all users in the same org by filtering auth.users metadata
  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    return NextResponse.json({ error: 'Failed to list team members' }, { status: 500 })
  }

  const members = data.users
    .filter(u => u.user_metadata?.org_id === orgId)
    .map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name ?? null,
      role: u.user_metadata?.role ?? 'member',
      createdAt: u.created_at,
      lastSignIn: u.last_sign_in_at ?? null,
    }))

  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const result = await getVerifiedOrgId(req)
  if (result instanceof NextResponse) return result
  const { orgId } = result

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, role } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'valid email is required' }, { status: 400 })
  }

  const validRoles = ['admin', 'member', 'viewer']
  const assignedRole = typeof role === 'string' && validRoles.includes(role) ? role : 'member'

  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: {
      org_id: orgId,
      role: assignedRole,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(
    {
      id: data.user.id,
      email: data.user.email,
      role: assignedRole,
    },
    { status: 201 }
  )
}
