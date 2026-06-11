import { NextRequest, NextResponse } from 'next/server';
import { runSeoBrain } from '@/lib/seo-brain';

// Called daily by the Netlify scheduled function netlify/functions/seo-brain-cron.js
// (fire-and-forget: the function dispatches and does not await completion).
// 1. Gathers GSC + PostHog signals and the git-native content inventory
// 2. Asks Claude for new article opportunities and quick wins
// 3. Writes complete article markdown for the top opportunities
// 4. Opens a GitHub PR adding the files under content/blog/ (merge = publish)
//
// Returns the full run report as JSON. No database writes.
// Secured with CRON_SECRET, passed as ?secret=... or "Authorization: Bearer ...".

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // article generation is multiple Claude calls

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
    const report = await runSeoBrain();
    return NextResponse.json(report);
  } catch (err) {
    // runSeoBrain handles its own failures; this is a last-resort guard
    const message = err instanceof Error ? err.message : 'SEO brain run failed';
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
