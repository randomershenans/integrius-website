import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { isPostHogConfigured, fetchTopPagesByViews } from '@/lib/posthog-server';

// Live PostHog top pages by views (last 28 days), proxied for the admin
// dashboard. Returns { configured: false } gracefully when PostHog env vars
// are missing.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!isPostHogConfigured()) {
    return NextResponse.json({ configured: false, rows: [] });
  }

  try {
    const rows = await fetchTopPagesByViews(28, 25);
    return NextResponse.json({ configured: true, rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'PostHog query failed';
    return NextResponse.json({ configured: true, rows: [], error: message }, { status: 502 });
  }
}
