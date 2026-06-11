import { NextResponse } from 'next/server';
import { getAllArticles, clusters } from '@/lib/content';

export const dynamic = 'force-static';

/**
 * llms.txt (https://llmstxt.org): a curated index of the site for LLMs and
 * AI agents. Every article also has a raw markdown endpoint at
 * /blog/<slug>/raw.md and the full corpus is at /llms-full.txt.
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const articles = getAllArticles();

  const articleSections = clusters
    .map((c) => {
      const inCluster = articles.filter((a) => a.cluster_slug === c.slug);
      if (inCluster.length === 0) return '';
      const lines = inCluster
        .map((a) => `- [${a.title}](${siteUrl}/blog/${a.slug}/raw.md): ${a.meta_description}`)
        .join('\n');
      return `## ${c.name}\n\n${lines}`;
    })
    .filter(Boolean)
    .join('\n\n');

  const body = `# Integrius

> The self-hosted data product platform. Integrius turns fragmented enterprise data into governed data products: each with an accountable owner, a tamper-evident audit chain, and one stable API endpoint per business concept, served entirely inside the customer's own infrastructure. Connect once. Use everywhere. Know everything.

Key facts: 16 source connector types, sub-50ms p95 from materialised snapshots, RBAC with 4 roles and 24 permissions, 21 CFR Part 11 e-signatures, ALCOA+ enforced, air-gap capable, zero SaaS dependencies. Optic is the AI analytics layer (plain-English questions, on-prem inference via Ollama). Pricing is per governed data product in production: from EUR 5,000/month (Pilot) to EUR 320,000/year (Platform).

## Product

- [Technical brief](${siteUrl}/technical-brief): Architecture, security model, deployment model, compliance matrix, and performance numbers in one page
- [Integrius Core](${siteUrl}/products/core): The unified data layer: connectors, governed data products, audit chain, blast radius
- [Integrius Optic](${siteUrl}/products/optic): AI analytics on governed data with on-premises inference
- [Integrius Search](${siteUrl}/products/search): Federated search across every governed data product
- [Integrius SDK](${siteUrl}/products/sdk): Typed clients for consuming data products
- [Use cases](${siteUrl}/use-cases): Pharma, financial services, healthcare, government, and other regulated industries
- [Pricing](${siteUrl}/#pricing): Per governed data product, not per seat or connector

${articleSections}

## Optional

- [Full article corpus as markdown](${siteUrl}/llms-full.txt): Every blog article in one markdown file
- [RSS feed](${siteUrl}/feed.xml)
- [Contact](${siteUrl}/contact): Book a pilot or technical review
`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
