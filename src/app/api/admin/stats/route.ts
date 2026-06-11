import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { getAllArticles } from '@/lib/content'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req)
  if (session instanceof NextResponse) return session

  // The blog is git-native: every markdown file in content/blog/ is published.
  // Drafts live on unmerged branches, so there is nothing else to count.
  const published = getAllArticles().length

  return NextResponse.json({ published })
}
