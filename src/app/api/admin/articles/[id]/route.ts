import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const article = await prisma.cms_articles.findUnique({
    where: { id },
    include: { cluster: { select: { name: true, slug: true } }, spec: { select: { title: true } } },
  });

  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const data: Record<string, unknown> = {
    updated_at: new Date(),
  };

  const allowed = ['title', 'slug', 'meta_title', 'meta_description', 'content', 'excerpt',
                   'status', 'article_type', 'primary_keyword'];
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if ('scheduled_for' in body) {
    data.scheduled_for = body.scheduled_for ? new Date(body.scheduled_for as string) : null;
  }

  if (body.status === 'published') {
    const existing = await prisma.cms_articles.findUnique({ where: { id }, select: { published_at: true } });
    if (!existing?.published_at) data.published_at = new Date();
  }

  const article = await prisma.cms_articles.update({ where: { id }, data });
  return NextResponse.json({ article });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  await prisma.cms_articles.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
