import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ cluster: string }>;
}

async function getCluster(slug: string) {
  return prisma.cms_keyword_clusters.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: 'published' },
        orderBy: { published_at: 'desc' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          article_type: true, word_count: true, published_at: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cluster } = await params;
  const data = await getCluster(cluster);
  if (!data) return {};

  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const pillarCount = data.articles.filter(a => a.article_type === 'pillar').length;
  const faqCount    = data.articles.filter(a => a.article_type === 'faq').length;

  return {
    title: `${data.name} — Integrius Blog`,
    description: data.description ?? `${pillarCount} in-depth guides and ${faqCount} explainers on ${data.name.toLowerCase()} from the Integrius research team.`,
    alternates: { canonical: `/blog/topic/${data.slug}` },
    openGraph: {
      title: `${data.name} | Integrius`,
      description: data.description ?? '',
      url: `${siteUrl}/blog/topic/${data.slug}`,
      type: 'website',
    },
  };
}

function formatDate(d: Date | null) {
  if (!d) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

function readingTime(wc: number | null) {
  if (!wc) return '';
  return `${Math.ceil(wc / 220)} min read`;
}

export default async function ClusterPage({ params }: Props) {
  const { cluster } = await params;
  const data        = await getCluster(cluster);
  if (!data) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const pillars  = data.articles.filter(a => a.article_type === 'pillar');
  const faqs     = data.articles.filter(a => a.article_type === 'faq');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog',    item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 2, name: data.name, item: `${siteUrl}/blog/topic/${data.slug}` },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${data.name} — Integrius`,
    description: data.description,
    url: `${siteUrl}/blog/topic/${data.slug}`,
    publisher: { '@type': 'Organization', name: 'Integrius', url: siteUrl },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <BlogHeader />

      <main className="max-w-5xl mx-auto px-6 py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
          <Link href="/blog" className="hover:text-[#00B8D4] transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-white/80">{data.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-14">
          <h1 className="text-4xl font-bold text-white mb-4">{data.name}</h1>
          {data.description && (
            <p className="text-lg text-white/60 max-w-2xl leading-relaxed">{data.description}</p>
          )}
          <div className="flex items-center gap-4 mt-5 text-sm text-white/40">
            <span>{pillars.length} guide{pillars.length !== 1 ? 's' : ''}</span>
            {faqs.length > 0 && <span>{faqs.length} explainer{faqs.length !== 1 ? 's' : ''}</span>}
          </div>
        </div>

        {/* Pillar articles */}
        {pillars.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">In-depth guides</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {pillars.map(a => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group block">
                  <article className="border border-white/10 rounded-xl p-6 bg-white/5 hover:border-[#00B8D4]/50 transition-all h-full">
                    <h3 className="font-semibold text-white text-base leading-snug group-hover:text-[#00B8D4] mb-3">{a.title}</h3>
                    {a.excerpt && <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-4">{a.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      {a.published_at && <span>{formatDate(a.published_at)}</span>}
                      {a.word_count && <span>{readingTime(a.word_count)}</span>}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ / explainer articles */}
        {faqs.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">Explainers</h2>
            <div className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
              {faqs.map(a => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group flex items-start justify-between gap-4 px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <h3 className="font-medium text-white text-sm leading-snug group-hover:text-[#00B8D4]">{a.title}</h3>
                    {a.excerpt && <p className="text-xs text-white/40 mt-1 line-clamp-1">{a.excerpt}</p>}
                  </div>
                  <svg className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="bg-gray-950 border border-white/10 text-white rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-lg mb-1">See Integrius in action</h3>
            <p className="text-white/50 text-sm">Governed data products. Enterprise search as a byproduct. No six-month implementation.</p>
          </div>
          <a
            href="/contact"
            className="shrink-0 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all"
          >
            Book a demo
          </a>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
