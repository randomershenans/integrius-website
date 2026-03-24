import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  const [published, draft, scheduled, pending_gen] = await Promise.all([
    prisma.cms_articles.count({ where: { status: 'published' } }),
    prisma.cms_articles.count({ where: { status: 'draft' } }),
    prisma.cms_articles.count({ where: { status: 'scheduled' } }),
    prisma.cms_generation_queue.count({ where: { status: 'pending' } }),
  ])

  return NextResponse.json({ published, draft, scheduled, pending_gen })
}
