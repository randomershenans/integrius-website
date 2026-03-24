import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getClientSession } from '@/lib/portal-client-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getClientSession(req)
  if (session instanceof NextResponse) return session

  const { data: members, error } = await supabaseAdmin
    .from('portal_client_users')
    .select('id, auth_uid, email, full_name, role, created_at')
    .eq('org_id', session.orgId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(members ?? [])
}

export async function POST(req: NextRequest) {
  const session = await getClientSession(req)
  if (session instanceof NextResponse) return session

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Only org admins can invite team members' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, role, full_name } = body as Record<string, unknown>

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'valid email is required' }, { status: 400 })
  }

  const validRoles = ['admin', 'member', 'viewer']
  const assignedRole = typeof role === 'string' && validRoles.includes(role) ? role : 'member'

  // Invite via Supabase Auth
  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { org_id: session.orgId, role: assignedRole },
  })

  if (inviteError) return NextResponse.json({ error: inviteError.message }, { status: 400 })

  // Also insert into portal_client_users so auth_uid lookup works immediately
  await supabaseAdmin.from('portal_client_users').insert({
    auth_uid: invited.user.id,
    org_id: session.orgId,
    email,
    full_name: typeof full_name === 'string' ? full_name : null,
    role: assignedRole,
  })

  return NextResponse.json({ id: invited.user.id, email, role: assignedRole }, { status: 201 })
}
