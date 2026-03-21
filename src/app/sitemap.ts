import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';

  const [articles, clusters] = await Promise.all([
    prisma.cms_articles.findMany({
      where: { status: 'published' },
      select: { slug: true, updated_at: true },
      orderBy: { published_at: 'desc' },
    }),
    prisma.cms_keyword_clusters.findMany({
      select: { slug: true },
    }),
  ]);

  const articleUrls: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${siteUrl}/blog/${a.slug}`,
    lastModified: a.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const clusterUrls: MetadataRoute.Sitemap = clusters.map(c => ({
    url: `${siteUrl}/blog/topic/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/blog/about`,
      lastModified: new Date('2026-03-21'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...clusterUrls,
    ...articleUrls,
  ];
}
