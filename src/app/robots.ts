import { MetadataRoute } from 'next';

// AI crawlers are explicitly welcomed: the site is written to be a citation
// source for LLM answers about data integration and governance. See /llms.txt.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/portal/'] },
      ...AI_CRAWLERS.map(userAgent => ({ userAgent, allow: '/', disallow: ['/admin/', '/api/', '/portal/'] })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
