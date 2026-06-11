import { NextResponse } from 'next/server';
import { getAllArticles, getArticle } from '@/lib/content';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

/**
 * Raw markdown view of an article for LLMs and agents, linked from /llms.txt.
 */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) {
    return new NextResponse('Not found', { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const body = [
    `# ${article.title}`,
    '',
    `Source: ${siteUrl}/blog/${article.slug}`,
    `Published: ${article.published.toISOString().slice(0, 10)} | Topic: ${article.cluster?.name ?? article.cluster_slug}`,
    '',
    article.content,
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
