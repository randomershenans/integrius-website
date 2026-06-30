import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles, clusters } from '@/lib/content';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Problem-first writing on data integration, data products, enterprise data governance, and self-hosted AI.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Integrius Blog',
    description: 'Problem-first thinking on data integration, data products, and enterprise data governance.',
    type: 'website',
  },
};

function readingTime(wordCount: number): string {
  if (!wordCount) return '';
  const mins = Math.ceil(wordCount / 220);
  return `${mins} min read`;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export default function BlogPage() {
  const articles = getAllArticles();

  const pillars = articles.filter(a => a.article_type === 'pillar');
  const faqs    = articles.filter(a => a.article_type === 'faq');

  return (
    <div className="min-h-screen bg-black text-white">
      <BlogHeader />

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-14">
          <h1 className="text-4xl font-bold text-white mb-4">
            The data problems worth getting right.
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            Problem-first writing on data integration, data products, enterprise data governance, and self-hosted AI.
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
              key={c.slug}
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
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group block">
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
                      <span>{formatDate(a.published)}</span>
                      <span>{readingTime(a.word_count)}</span>
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
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group block py-4 hover:pl-2 transition-all">
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
