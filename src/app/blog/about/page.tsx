import type { Metadata } from 'next';
import Link from 'next/link';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';

export const metadata: Metadata = {
  title: 'About the Integrius Research Team',
  description: 'The Integrius blog covers data integration, data products, and enterprise data governance. Written by the team building the governed data layer for the enterprise.',
  alternates: { canonical: '/blog/about' },
  openGraph: {
    title: 'About — Integrius Blog',
    description: 'Problem-first writing on data integration and data governance, from the team at Integrius.',
    url: `${siteUrl}/blog/about`,
    type: 'website',
  },
};

const authorSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Integrius Research Team',
  url: `${siteUrl}/blog/about`,
  worksFor: {
    '@type': 'Organization',
    name: 'Integrius',
    url: siteUrl,
  },
  description: 'The Integrius research team writes about data integration architecture, governed data products, and enterprise data engineering. All content is problem-first: we start with the pain, not the pitch.',
  knowsAbout: [
    'Data integration architecture',
    'Data products',
    'Data mesh',
    'Enterprise search',
    'Data governance',
    'Self-hosted software',
    'AI data readiness',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Blog', item: `${siteUrl}/blog` },
    { '@type': 'ListItem', position: 2, name: 'About', item: `${siteUrl}/blog/about` },
  ],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <BlogHeader />

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-10">
          <Link href="/blog" className="hover:text-[#00B8D4] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-white/80">About</span>
        </nav>

        <h1 className="text-3xl font-bold text-white mb-6">About the Integrius Research Team</h1>

        <div className="prose max-w-none leading-relaxed space-y-5">
          <p>
            This blog is written by the team at <a href={siteUrl} className="text-[#00B8D4] font-medium underline decoration-[#00B8D4]/40 hover:decoration-[#00B8D4]">Integrius</a> — the company building the governed data layer for enterprise data integration.
          </p>
          <p>
            We write about the problems we see every day: data integration that does not scale, governance that exists only on paper, enterprise search built on stale indexes, and AI projects that fail because the data underneath them is ungoverned and untrustworthy.
          </p>
          <p>
            Everything here is problem-first. We start with what breaks and why — not with what we sell.
          </p>

          <h2 className="text-xl font-bold text-white mt-10 mb-3">Writing standards</h2>
          <ul className="space-y-2 text-sm list-none pl-0">
            {[
              'Claims are sourced or acknowledged as estimates.',
              'We do not use vendor marketing language or phrase solutions as features.',
              'We name competitors honestly. If something does a job better than us, we say so.',
              'Numbers come from public research, analyst reports, or our own customer data.',
              'UK English throughout.',
            ].map(s => (
              <li key={s} className="flex items-start gap-2">
                <span className="text-[#00B8D4] mt-1">—</span>
                <span className="text-white/80">{s}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-white mt-10 mb-3">What Integrius builds</h2>
          <p>
            Integrius is a governed data layer — infrastructure that sits between your raw data sources and every downstream consumer (dashboards, APIs, AI models, data products). Every field mapping is approved. Every access decision is logged. Every consumer subscribes to an explicit schema with a change notification contract.
          </p>
          <p>
            The platform is self-hosted, API-first, and enterprise-ready. It ships enterprise search as a byproduct of governance, not as an additional product to buy and maintain.
          </p>

          <div className="mt-10 pt-8 border-t border-white/10">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            >
              Book a demo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
