import type { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Problem-first thinking on data integration, data products, enterprise search, and AI readiness. No marketing fluff.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Integrius Blog',
    description: 'Problem-first thinking on data integration, data products, and enterprise data governance.',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

async function getArticles() {
  return prisma.cms_articles.findMany({
    where: { status: 'published' },
    orderBy: { published_at: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      primary_keyword: true,
      article_type: true,
      published_at: true,
      word_count: true,
      cluster: { select: { name: true, slug: true } },
    },
  });
}

async function getClusters() {
  return prisma.cms_keyword_clusters.findMany({
    orderBy: { sort_order: 'asc' },
    select: { id: true, name: true, slug: true },
  });
}

function readingTime(wordCount: number | null): string {
  if (!wordCount) return '';
  const mins = Math.ceil(wordCount / 220);
  return `${mins} min read`;
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export default async function BlogPage() {
  const [articles, clusters] = await Promise.all([getArticles(), getClusters()]);

  const pillars = articles.filter(a => a.article_type === 'pillar');
  const faqs    = articles.filter(a => a.article_type === 'faq');

  return (
    <div className="min-h-screen bg-black text-white">
      <BlogHeader />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-14">
          <h1 className="text-4xl font-bold text-white mb-4">
            The data problems your buyers are already Googling.
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            Problem-first content on data integration, data products, and enterprise data governance. No marketing fluff.
          </p>
        </div>

        {/* Cluster filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          <Link
            href="/blog"
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors bg-[#00B8D4]/20 text-[#00B8D4] border-[#00B8D4]/40"
          >
            All
          </Link>
          {clusters.map(c => (
            <Link
              key={c.id}
              href={`/blog/topic/${c.slug}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors bg-white/5 text-white/60 border-white/10 hover:bg-[#00B8D4]/20 hover:text-[#00B8D4] hover:border-[#00B8D4]/40"
            >
              {c.name}
            </Link>
          ))}
        </div>

        {articles.length === 0 && (
          <p className="text-white/50 py-16 text-center">No articles published yet. Check back soon.</p>
        )}

        {/* Pillar articles */}
        {pillars.length > 0 && (
          <section className="mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              {pillars.map(a => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="group block">
                  <article className="border border-white/10 rounded-xl p-6 bg-white/5 hover:border-[#00B8D4]/50 hover:bg-white/8 transition-all">
                    {a.cluster && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#00B8D4] mb-3 block">
                        {a.cluster.name}
                      </span>
                    )}
                    <h2 className="text-lg font-bold text-white mb-3 group-hover:text-[#00B8D4] leading-snug">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="text-sm text-white/60 mb-4 line-clamp-3">{a.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{formatDate(a.published_at)}</span>
                      {a.word_count && <span>{readingTime(a.word_count)}</span>}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ / Glossary */}
        {faqs.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-6 pb-3 border-b border-white/10">
              Quick answers
            </h2>
            <div className="divide-y divide-white/10">
              {faqs.map(a => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="group block py-4 hover:pl-2 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 font-medium group-hover:text-[#00B8D4]">{a.title}</span>
                    <span className="text-xs text-white/40 ml-4 shrink-0">{readingTime(a.word_count)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <BlogFooter />
    </div>
  );
}
