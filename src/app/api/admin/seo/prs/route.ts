import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { isGitHubConfigured, listOpenSeoBrainPRs } from '@/lib/github-content';

// Open seo-brain content PRs (head branch starts with "seo-brain/"), proxied
// for the admin dashboard. The blog is git-native, so these PRs ARE the
// review queue: merging one publishes its articles.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  if (!isGitHubConfigured()) {
    return NextResponse.json({ configured: false, prs: [] });
  }

  try {
    const prs = await listOpenSeoBrainPRs();
    return NextResponse.json({ configured: true, prs });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GitHub query failed';
    return NextResponse.json({ configured: true, prs: [], error: message }, { status: 502 });
  }
}
