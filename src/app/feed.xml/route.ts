import { NextResponse } from 'next/server';
import { getAllArticles } from '@/lib/content';

export const dynamic = 'force-static';

export async function GET() {
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const siteName = 'Integrius Blog';
  const desc     = 'Problem-first thinking on data integration, data products, and enterprise data governance.';

  const articles = getAllArticles().slice(0, 50);

  const items = articles.map(a => {
    const url = `${siteUrl}/blog/${a.slug}`;
    return `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${a.excerpt || a.title}]]></description>
      <pubDate>${a.published.toUTCString()}</pubDate>
      ${a.primary_keyword ? `<category><![CDATA[${a.primary_keyword}]]></category>` : ''}
    </item>`.trim();
  }).join('\n    ');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}/blog</link>
    <description>${desc}</description>
    <language>en-gb</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>hello@integri.us (Integrius)</managingEditor>
    <webMaster>hello@integri.us (Integrius)</webMaster>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  });
}
