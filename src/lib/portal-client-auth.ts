import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface ClientSession {
  userId: string
  orgId: string
  role: string
}

/**
 * Verifies the bearer token and resolves the org_id from portal_client_users.
 * Falls back to user_metadata.org_id for users created before the table existed.
 */
export async function getClientSession(
  req: NextRequest
): Promise<ClientSession | NextResponse> {
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })

  // Primary: look up portal_client_users by auth_uid
  const { data: clientUser } = await supabaseAdmin
    .from('portal_client_users')
    .select('org_id, role')
    .eq('auth_uid', user.id)
    .single()

  if (clientUser?.org_id) {
    return { userId: user.id, orgId: clientUser.org_id, role: clientUser.role }
  }

  // Fallback: user_metadata (set by the invite flow)
  const orgId = user.user_metadata?.org_id as string | undefined
  if (orgId) {
    return { userId: user.id, orgId, role: user.user_metadata?.role ?? 'member' }
  }

  return NextResponse.json({ error: 'No organisation associated with this account' }, { status: 403 })
}
