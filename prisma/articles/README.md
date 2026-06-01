# Blog articles (seed source)

These markdown files are the **source** for the launch set of blog articles. The
live blog renders from the `cms_articles` table in the database, not from these
files. `prisma/seed-articles.ts` reads each file and upserts it into
`cms_articles` as a **published** article.

## File format

Each file is frontmatter followed by the article body in Markdown:

```
---
title: The article title
slug: the-article-slug
meta_title: SEO title tag
meta_description: SEO meta description
excerpt: One or two sentence summary for the listing card
primary_keyword: the primary target keyword
article_type: pillar        # or: faq
cluster_slug: data-integration
---

## First H2
Body starts here...
```

Conventions (match the rest of the site):

- **No level-1 heading.** The page renders `title` as the `<h1>`, so the body
  starts at `##`. FAQ structured data is auto-extracted from `##` question
  headings, so FAQ articles use questions as their `##` headings.
- **No em dashes** in copy (house style). Commas, colons, and full stops only.
- **British spelling.**
- Internal links point at `/blog/<slug>` and only reference slugs in this set,
  so there are no dead links on launch.

## Publishing

Clusters and specs must exist first (they provide topic-page linkage, sitemap
entries, and related-article grouping):

```bash
npm run db:seed         # clusters + pillar/FAQ specs
npm run db:seed-v2      # comparison + use-case specs
npm run db:seed-articles  # publish these 10 articles
```

`db:seed-articles` is **idempotent**: re-running it updates content in place by
slug and preserves each article's original `published_at`. Preview what it will
do without touching the database:

```bash
npx tsx prisma/seed-articles.ts --dry-run
```

`DATABASE_URL` must point at the CMS database (the one with the `cms_` tables).

## The launch set

Ten articles spanning all eight content clusters, written to rank for longtail
keywords and to route readers toward the product:

| Slug | Type | Cluster |
| --- | --- | --- |
| `data-integration-cost-hidden-tax` | pillar | data-integration |
| `n-x-m-data-integration-problem` | faq | data-integration |
| `what-is-a-data-product` | pillar | data-products |
| `data-product-governance` | faq | data-products |
| `why-enterprise-search-sucks` | pillar | enterprise-search |
| `data-integration-for-ai` | pillar | ai-data |
| `self-hosted-data-governance` | pillar | self-hosted |
| `pharma-data-integration-alcoa` | pillar | verticals |
| `integrius-vs-fivetran` | pillar | vendor-comparisons |
| `build-customer-360-data-product` | pillar | use-cases |

Each article is flagged `ai_generated = true` and carries a model attribution in
`ai_model`, so the site's "AI-assisted" badge is accurate.
