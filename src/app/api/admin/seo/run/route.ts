import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { runSeoBrain } from '@/lib/seo-brain';

// "Run SEO brain now" — admin-authed manual trigger. Reuses the exact same
// run function as the nightly cron, no cron secret involved.

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  try {
    const summary = await runSeoBrain();
    return NextResponse.json(summary);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SEO brain run failed';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
