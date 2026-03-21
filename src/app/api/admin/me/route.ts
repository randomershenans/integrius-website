import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;
  return NextResponse.json({ email: session.email });
}
