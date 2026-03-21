import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE } from './auth';

export async function requireAdmin(req: NextRequest): Promise<{ adminId: string; email: string } | NextResponse> {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const session = await verifyAdminToken(token);
  if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });

  return session;
}
