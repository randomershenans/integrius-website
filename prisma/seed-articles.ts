/**
 * Seed published articles into cms_articles from the markdown files in
 * prisma/articles/. Each file carries simple frontmatter (title, slug,
 * meta_title, meta_description, excerpt, primary_keyword, article_type,
 * cluster_slug) followed by the article body in Markdown.
 *
 * The script is idempotent: it upserts by slug, so running it again updates
 * content in place without creating duplicates and without resetting the
 * original published_at date.
 *
 * It links each article to its existing spec (by slug) and cluster (by
 * cluster_slug) so the articles appear correctly on the topic/cluster pages,
 * the sitemap, the RSS feed, and the related-articles section. Run the cluster
 * and spec seeds first for full linkage:
 *
 *   npm run db:seed        # clusters + pillar/FAQ specs
 *   npm run db:seed-v2     # comparison + use-case specs
 *   npm run db:seed-articles   # this script (publishes the 10 articles)
 *
 * Preview without touching the database:
 *   npx tsx prisma/seed-articles.ts --dry-run
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Model attribution for the ai_generated / ai_model fields (honest disclosure).
const AI_MODEL = 'claude-opus-4 (Claude Code)';

// Publishing cadence: oldest first. Each article is dated relative to "now" so
// the blog has a natural ~3-week posting rhythm instead of ten identical
// timestamps. The blog index orders by published_at desc, so the last entry
// here appears at the top of /blog.
const PUBLISH_ORDER: { slug: string; daysAgo: number }[] = [
  { slug: 'n-x-m-data-integration-problem', daysAgo: 22 },
  { slug: 'what-is-a-data-product', daysAgo: 19 },
  { slug: 'data-product-governance', daysAgo: 16 },
  { slug: 'data-integration-cost-hidden-tax', daysAgo: 14 },
  { slug: 'why-enterprise-search-sucks', daysAgo: 11 },
  { slug: 'self-hosted-data-governance', daysAgo: 9 },
  { slug: 'data-integration-for-ai', daysAgo: 6 },
  { slug: 'pharma-data-integration-alcoa', daysAgo: 4 },
  { slug: 'integrius-vs-fivetran', daysAgo: 2 },
  { slug: 'build-customer-360-data-product', daysAgo: 0 },
];

interface ParsedArticle {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
  primary_keyword: string;
  article_type: string;
  cluster_slug: string;
  content: string;
  word_count: number;
}

function stripQuotes(value: string): string {
  const v = value.trim();
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseArticle(raw: string, file: string): ParsedArticle {
  const lines = raw.split(/\r?\n/);
  if (lines[0].trim() !== '---') {
    throw new Error(`${file}: missing opening frontmatter delimiter`);
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) throw new Error(`${file}: missing closing frontmatter delimiter`);

  const meta: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = stripQuotes(line.slice(idx + 1));
    meta[key] = value;
  }

  const content = lines.slice(end + 1).join('\n').trim();
  const word_count = content ? content.split(/\s+/).length : 0;

  const required = ['title', 'slug', 'meta_title', 'meta_description', 'article_type', 'cluster_slug'];
  for (const key of required) {
    if (!meta[key]) throw new Error(`${file}: missing required frontmatter field "${key}"`);
  }

  return {
    title: meta.title,
    slug: meta.slug,
    meta_title: meta.meta_title,
    meta_description: meta.meta_description,
    excerpt: meta.excerpt ?? '',
    primary_keyword: meta.primary_keyword ?? '',
    article_type: meta.article_type,
    cluster_slug: meta.cluster_slug,
    content,
    word_count,
  };
}

function publishedAtFor(slug: string, base: number): Date {
  const entry = PUBLISH_ORDER.find((e) => e.slug === slug);
  const daysAgo = entry ? entry.daysAgo : 0;
  return new Date(base - daysAgo * 24 * 60 * 60 * 1000);
}

async function main() {
  const dir = join(process.cwd(), 'prisma', 'articles');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));

  if (files.length === 0) {
    console.error(`No .md files found in ${dir}`);
    process.exit(1);
  }

  const articles = files.map((f) => parseArticle(readFileSync(join(dir, f), 'utf8'), f));

  console.log(`Parsed ${articles.length} article(s)${DRY_RUN ? ' (dry run, no database writes)' : ''}:`);
  for (const a of articles) {
    console.log(`  - ${a.slug}  [${a.article_type}, ${a.word_count} words, cluster: ${a.cluster_slug}]`);
  }

  if (DRY_RUN) {
    console.log('\nDry run complete. No database connection was made.');
    return;
  }

  const prisma = new PrismaClient();
  const base = Date.now();

  try {
    // Resolve clusters and specs once.
    const clusters = await prisma.cms_keyword_clusters.findMany({ select: { id: true, slug: true } });
    const clusterIdBySlug = Object.fromEntries(clusters.map((c) => [c.slug, c.id]));

    let published = 0;
    let updated = 0;
    let missingCluster = 0;

    for (const a of articles) {
      const cluster_id = clusterIdBySlug[a.cluster_slug] ?? null;
      if (!cluster_id) {
        missingCluster++;
        console.warn(
          `  ! cluster "${a.cluster_slug}" not found for ${a.slug}. ` +
            `Publishing without cluster linkage. Run "npm run db:seed" and "npm run db:seed-v2" first for topic pages and related articles.`,
        );
      }

      const spec = await prisma.cms_article_specs.findUnique({ where: { slug: a.slug }, select: { id: true, cluster_id: true } });
      const spec_id = spec?.id ?? null;
      const resolvedClusterId = cluster_id ?? spec?.cluster_id ?? null;

      const existing = await prisma.cms_articles.findUnique({ where: { slug: a.slug }, select: { id: true, published_at: true } });
      const published_at = existing?.published_at ?? publishedAtFor(a.slug, base);

      const data = {
        spec_id,
        cluster_id: resolvedClusterId,
        title: a.title,
        meta_title: a.meta_title,
        meta_description: a.meta_description,
        content: a.content,
        excerpt: a.excerpt || null,
        primary_keyword: a.primary_keyword || null,
        article_type: a.article_type,
        word_count: a.word_count,
        status: 'published',
        published_at,
        ai_generated: true,
        ai_model: AI_MODEL,
        updated_at: new Date(),
      };

      await prisma.cms_articles.upsert({
        where: { slug: a.slug },
        update: data,
        create: { slug: a.slug, ...data },
      });

      if (existing) {
        updated++;
        console.log(`  ~ updated   ${a.slug}`);
      } else {
        published++;
        console.log(`  + published ${a.slug}`);
      }
    }

    console.log(`\nDone. ${published} newly published, ${updated} updated.`);
    if (missingCluster > 0) {
      console.log(`${missingCluster} article(s) published without a cluster. Seed clusters/specs first for full linkage.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
