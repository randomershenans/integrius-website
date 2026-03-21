import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';
import { shareToLinkedIn } from '@/lib/linkedin';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  const article = await prisma.cms_articles.findUnique({
    where: { id },
    select: { title: true, slug: true, excerpt: true, status: true, linkedin_shared: true },
  });

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (article.status !== 'published') return NextResponse.json({ error: 'Article must be published before sharing' }, { status: 400 });
  if (article.linkedin_shared) return NextResponse.json({ error: 'Already shared to LinkedIn' }, { status: 400 });

  const result = await shareToLinkedIn({
    title:   article.title,
    slug:    article.slug,
    excerpt: article.excerpt ?? '',
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  await prisma.cms_articles.update({
    where: { id },
    data: {
      linkedin_shared:    true,
      linkedin_shared_at: new Date(),
      linkedin_post_url:  result.post_url,
    },
  });

  return NextResponse.json({ ok: true, post_url: result.post_url });
}
