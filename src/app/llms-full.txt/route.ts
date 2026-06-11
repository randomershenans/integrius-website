import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';

export const dynamic = 'force-static';

/**
 * llms-full.txt: the entire blog corpus as one markdown document, for LLMs
 * and agents that want full content rather than the /llms.txt index.
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const articles = getAllArticles();

  const sections = articles.map((a) => {
    const date = a.published.toISOString().slice(0, 10);
    return [
      `# ${a.title}`,
      '',
      `Source: ${siteUrl}/blog/${a.slug}`,
      `Published: ${date} | Topic: ${a.cluster?.name ?? a.cluster_slug} | Type: ${a.article_type}`,
      '',
      a.content,
    ].join('\n');
  });

  const body = [
    '# Integrius blog: full corpus',
    '',
    `> Problem-first writing on data integration, data products, and enterprise data governance from Integrius (${siteUrl}), the self-hosted data product platform. ${articles.length} articles. Index at ${siteUrl}/llms.txt.`,
    '',
    sections.join('\n\n---\n\n'),
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
