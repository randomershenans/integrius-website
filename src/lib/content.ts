import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import clustersData from '../../content/clusters.json';

/**
 * File-based content layer. The blog is served from markdown files in
 * content/blog, committed to the repo and statically built. No database
 * sits in the public content path: publishing is a git merge.
 *
 * Frontmatter contract (see content/blog/README.md):
 *   title, slug, meta_title, meta_description, excerpt, primary_keyword,
 *   article_type (pillar|faq), cluster_slug, published (YYYY-MM-DD),
 *   ai_assisted (true|false, optional), updated (YYYY-MM-DD, optional)
 */

export interface Cluster {
  name: string;
  slug: string;
  description: string;
  sort_order: number;
}

export interface Article {
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
  primary_keyword: string;
  article_type: 'pillar' | 'faq';
  cluster_slug: string;
  cluster: Cluster | null;
  published: Date;
  updated: Date;
  ai_assisted: boolean;
  content: string;
  word_count: number;
}

const CONTENT_DIR = join(process.cwd(), 'content', 'blog');

export const clusters: Cluster[] = (clustersData as Cluster[])
  .slice()
  .sort((a, b) => a.sort_order - b.sort_order);

function stripQuotes(value: string): string {
  const v = value.trim();
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseFile(raw: string, file: string): Article {
  const lines = raw.split(/\r?\n/);
  if (lines[0].trim() !== '---') throw new Error(`${file}: missing opening frontmatter delimiter`);
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) throw new Error(`${file}: missing closing frontmatter delimiter`);

  const meta: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const idx = lines[i].indexOf(':');
    if (idx === -1) continue;
    meta[lines[i].slice(0, idx).trim()] = stripQuotes(lines[i].slice(idx + 1));
  }

  for (const key of ['title', 'slug', 'meta_title', 'meta_description', 'article_type', 'cluster_slug', 'published']) {
    if (!meta[key]) throw new Error(`${file}: missing required frontmatter field "${key}"`);
  }

  const content = lines.slice(end + 1).join('\n').trim();
  const published = new Date(`${meta.published}T08:00:00Z`);
  if (isNaN(published.getTime())) throw new Error(`${file}: invalid published date "${meta.published}"`);
  const updated = meta.updated ? new Date(`${meta.updated}T08:00:00Z`) : published;

  return {
    slug: meta.slug,
    title: meta.title,
    meta_title: meta.meta_title,
    meta_description: meta.meta_description,
    excerpt: meta.excerpt ?? '',
    primary_keyword: meta.primary_keyword ?? '',
    article_type: meta.article_type === 'faq' ? 'faq' : 'pillar',
    cluster_slug: meta.cluster_slug,
    cluster: clusters.find((c) => c.slug === meta.cluster_slug) ?? null,
    published,
    updated,
    ai_assisted: meta.ai_assisted !== 'false',
    content,
    word_count: content ? content.split(/\s+/).length : 0,
  };
}

let cache: Article[] | null = null;

export function getAllArticles(): Article[] {
  if (cache) return cache;
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md') && f !== 'README.md');
  const articles = files.map((f) => parseFile(readFileSync(join(CONTENT_DIR, f), 'utf8'), f));

  const seen = new Set<string>();
  for (const a of articles) {
    if (seen.has(a.slug)) throw new Error(`Duplicate article slug: ${a.slug}`);
    seen.add(a.slug);
  }

  articles.sort((a, b) => b.published.getTime() - a.published.getTime());
  cache = articles;
  return articles;
}

export function getArticle(slug: string): Article | null {
  return getAllArticles().find((a) => a.slug === slug) ?? null;
}

export function getCluster(slug: string): Cluster | null {
  return clusters.find((c) => c.slug === slug) ?? null;
}

export function getArticlesByCluster(clusterSlug: string): Article[] {
  return getAllArticles().filter((a) => a.cluster_slug === clusterSlug);
}

export function getRelatedArticles(article: Article, take = 3): Article[] {
  return getAllArticles()
    .filter((a) => a.cluster_slug === article.cluster_slug && a.slug !== article.slug)
    .slice(0, take);
}
