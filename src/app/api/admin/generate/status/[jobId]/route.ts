import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const session = await requireAdmin(req);
  if (session instanceof NextResponse) return session;

  const { jobId } = await params;

  const entry = await prisma.cms_generation_queue.findUnique({
    where: { id: jobId },
    select: { status: true, article_id: true, error: true },
  });

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(entry);
}
