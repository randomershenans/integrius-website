import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const articles = await prisma.cms_articles.findMany({
    orderBy: { updated_at: 'desc' },
    include: { cluster: { select: { name: true, slug: true } } },
  });

  return NextResponse.json({ articles });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const body = await req.json() as {
    title: string; slug: string; meta_title: string; meta_description: string;
    content: string; excerpt?: string; status?: string; article_type?: string;
    scheduled_for?: string;
  };

  if (!body.title || !body.slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }

  const article = await prisma.cms_articles.create({
    data: {
      title:           body.title,
      slug:            body.slug,
      meta_title:      body.meta_title    ?? body.title,
      meta_description: body.meta_description ?? '',
      content:         body.content       ?? '',
      excerpt:         body.excerpt,
      status:          body.status        ?? 'draft',
      article_type:    body.article_type  ?? 'pillar',
      scheduled_for:   body.scheduled_for ? new Date(body.scheduled_for) : null,
      published_at:    body.status === 'published' ? new Date() : null,
    },
  });

  return NextResponse.json({ article }, { status: 201 });
}
