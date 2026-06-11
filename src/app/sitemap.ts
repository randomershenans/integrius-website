import { MetadataRoute } from 'next';
import { getAllArticles, clusters } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const articles = getAllArticles();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/products/core`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/products/optic`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/products/search`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/products/sdk`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/use-cases`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/technical-brief`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/blog/about`, lastModified: new Date('2026-03-21'), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const clusterUrls: MetadataRoute.Sitemap = clusters.map(c => ({
    url: `${siteUrl}/blog/topic/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const articleUrls: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${siteUrl}/blog/${a.slug}`,
    lastModified: a.updated,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...clusterUrls, ...articleUrls];
}
