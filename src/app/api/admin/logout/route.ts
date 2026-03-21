import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: ADMIN_COOKIE, value: '', maxAge: 0, path: '/' });
  return res;
}
