import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const specs = await prisma.cms_article_specs.findMany({
    orderBy: [{ article_type: 'asc' }, { title: 'asc' }],
    include: { cluster: { select: { name: true, slug: true } } },
  });

  return NextResponse.json({ specs });
}
