import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { id } = await params;

  const article = await prisma.cms_articles.update({
    where: { id },
    data: {
      status: 'published',
      published_at: new Date(),
      updated_at: new Date(),
    },
  });

  return NextResponse.json({ article });
}
