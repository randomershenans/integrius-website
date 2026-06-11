import { NextRequest, NextResponse } from 'next/server';
import { runSeoBrain } from '@/lib/seo-brain';

// Called nightly by the Netlify scheduled function netlify/functions/seo-brain-cron.js.
// 1. Dispatches any due auto-queued generation jobs
// 2. Gathers GSC + PostHog signals and the existing content inventory
// 3. Asks Claude for new article opportunities and quick wins
// 4. Persists new specs (and queue entries when AUTO_QUEUE_GENERATION=true)
//
// Secured with CRON_SECRET, passed as ?secret=... or "Authorization: Bearer ...".

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const secret = req.nextUrl.searchParams.get('secret');
    const header = req.headers.get('Authorization');
    if (secret !== expected && header !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const summary = await runSeoBrain();
    return NextResponse.json({ ...summary, ran_at: new Date().toISOString() });
  } catch (err) {
    // runSeoBrain handles its own failures; this is a last-resort guard
    const message = err instanceof Error ? err.message : 'SEO brain run failed';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
