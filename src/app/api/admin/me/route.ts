import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin(req);
    if (session instanceof NextResponse) return session;
    return NextResponse.json({ email: session.email });
  } catch (error) {
    console.error('GET /api/admin/me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
