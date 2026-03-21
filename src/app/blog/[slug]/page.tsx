import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import prisma from '@/lib/prisma';
import TableOfContents from '@/components/TableOfContents';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { BlogFooter } from '@/components/blog/BlogFooter';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  return prisma.cms_articles.findFirst({
    where: { slug, status: 'published' },
    include: { cluster: { select: { name: true, slug: true } } },
  });
}

async function getRelated(clusterId: string | null | undefined, currentSlug: string) {
  if (!clusterId) return [];
  return prisma.cms_articles.findMany({
    where: { status: 'published', cluster_id: clusterId, slug: { not: currentSlug } },
    orderBy: { published_at: 'desc' },
    take: 3,
    select: { title: true, slug: true, excerpt: true, article_type: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';

  return {
    title: article.meta_title,
    description: article.meta_description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.meta_title,
      description: article.meta_description,
      type: 'article',
      publishedTime: article.published_at?.toISOString(),
      url: `${siteUrl}/blog/${slug}`,
      siteName: 'Integrius',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.meta_title,
      description: article.meta_description,
    },
  };
}

function formatDate(d: Date | null): string {
  if (!d) return '';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

function readingTime(wordCount: number | null): string {
  if (!wordCount) return '';
  return `${Math.ceil(wordCount / 220)} min read`;
}

// BreadcrumbList schema
function BreadcrumbSchema({ article, cluster }: { article: { title: string; slug: string }; cluster: { name: string; slug: string } | null }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Blog', item: `${siteUrl}/blog` },
    ...(cluster ? [{ '@type': 'ListItem', position: 2, name: cluster.name, item: `${siteUrl}/blog/topic/${cluster.slug}` }] : []),
    { '@type': 'ListItem', position: cluster ? 3 : 2, name: article.title, item: `${siteUrl}/blog/${article.slug}` },
  ];
  const schema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// Article schema markup (JSON-LD)
function ArticleSchema({ article }: { article: { title: string; meta_description: string; published_at: Date | null; updated_at: Date; slug: string } }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_description,
    datePublished: article.published_at?.toISOString(),
    dateModified: article.updated_at.toISOString(),
    url: `${siteUrl}/blog/${article.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Integrius Research Team',
      url: `${siteUrl}/blog/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Integrius',
      url: siteUrl,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// FAQ schema markup for FAQ/glossary articles
function FaqSchema({ content }: { content: string }) {
  const faqMatches = [...content.matchAll(/^##\s+(.+)\n+([\s\S]+?)(?=\n##|\n#|$)/gm)];
  if (faqMatches.length < 2) return null;

  const items = faqMatches.slice(0, 10).map(m => ({
    '@type': 'Question',
    name: m[1].trim(),
    acceptedAnswer: { '@type': 'Answer', text: m[2].replace(/[#*`]/g, '').trim().slice(0, 500) },
  }));

  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article  = await getArticle(slug);
  if (!article) notFound();

  const related  = await getRelated(article.cluster_id, slug);
  const isPillar = article.article_type === 'pillar';

  return (
    <div className="min-h-screen bg-black text-white">
      <ArticleSchema article={article} />
      <BreadcrumbSchema article={article} cluster={article.cluster} />
      {article.article_type === 'faq' && <FaqSchema content={article.content} />}

      <BlogHeader />

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Breadcrumb + meta */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-4">
            <Link href="/blog" className="hover:text-[#00B8D4] transition-colors">Blog</Link>
            {article.cluster && (
              <>
                <span>/</span>
                <Link href={`/blog/topic/${article.cluster.slug}`} className="hover:text-[#00B8D4] transition-colors">
                  {article.cluster.name}
                </Link>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center gap-3 text-sm text-white/50">
            <span>{formatDate(article.published_at)}</span>
            {article.word_count && <span>{readingTime(article.word_count)}</span>}
            {article.ai_generated && (
              <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded text-xs">AI-assisted</span>
            )}
          </div>
        </div>

        {/* Table of contents — pillar articles only */}
        {isPillar && <TableOfContents content={article.content} />}

        {/* Article body */}
        <article className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12 pt-10 border-t border-white/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-5">Related reading</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map(r => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="group block">
                  <article className="border border-white/10 rounded-xl p-4 bg-white/5 hover:border-[#00B8D4]/50 transition-all h-full">
                    <p className="text-xs text-[#00B8D4] font-medium mb-2 uppercase tracking-wider">{r.article_type}</p>
                    <h4 className="font-semibold text-white text-sm leading-snug group-hover:text-[#00B8D4]">{r.title}</h4>
                    {r.excerpt && <p className="text-xs text-white/50 mt-2 line-clamp-2">{r.excerpt}</p>}
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA block */}
        <div className="mt-16 bg-gray-950 border border-white/10 rounded-xl p-8">
          <h3 className="text-lg font-bold text-white mb-2">See Integrius in action</h3>
          <p className="text-white/60 mb-4 text-sm">
            Governed data products. Enterprise search as a byproduct. Self-hosted or cloud.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          >
            Book a demo
          </a>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link href="/blog" className="text-sm text-white/40 hover:text-[#00B8D4] transition-colors">
            ← Back to all articles
          </Link>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
