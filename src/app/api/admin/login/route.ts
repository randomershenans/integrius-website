import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signAdminToken, setAdminCookie } from '@/lib/auth';
import { auditLog } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json() as { email: string; password: string };
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const admin = await prisma.cms_admin_users.findUnique({ where: { email } });
  if (!admin) {
    auditLog({ action: 'admin.login_failed', actor: email, ip, success: false });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) {
    auditLog({ action: 'admin.login_failed', actor: email, ip, success: false });
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  await prisma.cms_admin_users.update({
    where: { id: admin.id },
    data: { last_login_at: new Date() },
  });

  const token  = await signAdminToken({ adminId: admin.id, email: admin.email });
  const cookie = setAdminCookie(token);

  auditLog({ action: 'admin.login', actor: email, ip, success: true });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie);
  return res;
}
