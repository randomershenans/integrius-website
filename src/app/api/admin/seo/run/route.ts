import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { runSeoBrain } from '@/lib/seo-brain';

// "Run SEO brain now": admin-authed manual trigger. Reuses the exact same
// run function as the daily cron, no cron secret involved. Returns the full
// run report (opportunities, quick wins, articles written, PR url) so the
// dashboard can render it inline.

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // article generation is multiple Claude calls

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  try {
    const report = await runSeoBrain();
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SEO brain run failed';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
