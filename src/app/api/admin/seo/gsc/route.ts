import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { isGscConfigured, fetchTopQueries } from '@/lib/gsc';

// Live Google Search Console top queries (last 28 days), proxied for the
// admin dashboard. Returns { configured: false } gracefully when GSC env
// vars are missing.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!isGscConfigured()) {
    return NextResponse.json({ configured: false, rows: [] });
  }

  try {
    const rows = await fetchTopQueries(28, 50);
    return NextResponse.json({ configured: true, rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GSC query failed';
    return NextResponse.json({ configured: true, rows: [], error: message }, { status: 502 });
  }
}
