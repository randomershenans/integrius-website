import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { isGscConfigured } from '@/lib/gsc';
import { isPostHogConfigured } from '@/lib/posthog-server';
import { isGitHubConfigured } from '@/lib/github-content';

// Admin config status for the SEO brain: booleans only, never secrets.
// Run history lives in the GitHub PRs the brain opens (see ./prs), not in a
// database: the blog is git-native and the brain keeps no state.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  return NextResponse.json({
    config: {
      gsc_configured: isGscConfigured(),
      posthog_configured: isPostHogConfigured(),
      github_configured: isGitHubConfigured(),
    },
  });
}
