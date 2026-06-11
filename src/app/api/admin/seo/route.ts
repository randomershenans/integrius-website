import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { isGscConfigured } from '@/lib/gsc';
import { isPostHogConfigured } from '@/lib/posthog-server';

// Admin overview for the SEO brain: config status (booleans only, never
// secrets), recent runs, and the latest run's full report.

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const runs = await prisma.cms_seo_runs.findMany({
    orderBy: { started_at: 'desc' },
    take: 20,
    select: {
      id: true,
      started_at: true,
      finished_at: true,
      status: true,
      gsc_rows: true,
      posthog_rows: true,
      opportunities_found: true,
      specs_created: true,
      error: true,
    },
  });

  const latest = runs.length > 0
    ? await prisma.cms_seo_runs.findUnique({
        where: { id: runs[0].id },
        select: { id: true, started_at: true, status: true, quick_wins: true, report: true },
      })
    : null;

  return NextResponse.json({
    config: {
      gsc_configured: isGscConfigured(),
      posthog_configured: isPostHogConfigured(),
      auto_queue_generation: process.env.AUTO_QUEUE_GENERATION === 'true',
    },
    runs,
    latest,
  });
}
