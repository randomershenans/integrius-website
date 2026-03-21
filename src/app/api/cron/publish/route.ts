import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { shareToLinkedIn } from '@/lib/linkedin';

// Called by an external cron (Vercel Cron, GitHub Actions, or EasyCron) every hour.
// 1. Publishes any articles with status=scheduled and scheduled_for <= now
// 2. Auto-shares newly published articles to LinkedIn (if not already shared)
//
// Secure this with a CRON_SECRET env var that the caller passes as ?secret=...

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const published: string[] = [];
  const shared:    string[] = [];
  const errors:    string[] = [];

  // Step 1 — publish scheduled articles
  const due = await prisma.cms_articles.findMany({
    where: {
      status: 'scheduled',
      scheduled_for: { lte: now },
    },
    select: { id: true, title: true },
  });

  for (const a of due) {
    await prisma.cms_articles.update({
      where: { id: a.id },
      data: { status: 'published', published_at: now, updated_at: now },
    });
    published.push(a.title);
  }

  // Step 2 — share newly published articles (not yet shared) to LinkedIn
  const toShare = await prisma.cms_articles.findMany({
    where: {
      status: 'published',
      linkedin_shared: false,
    },
    select: { id: true, title: true, slug: true, excerpt: true },
    orderBy: { published_at: 'asc' },
    take: 5, // cap at 5 per run to avoid API rate limits
  });

  for (const a of toShare) {
    const result = await shareToLinkedIn({
      title:   a.title,
      slug:    a.slug,
      excerpt: a.excerpt ?? '',
    });

    if (result.success) {
      await prisma.cms_articles.update({
        where: { id: a.id },
        data: {
          linkedin_shared:    true,
          linkedin_shared_at: now,
          linkedin_post_url:  result.post_url,
        },
      });
      shared.push(a.title);
    } else {
      errors.push(`${a.title}: ${result.error}`);
    }
  }

  return NextResponse.json({ published, shared, errors, ran_at: now.toISOString() });
}
