# Blog content (git-native)

The blog is served from the markdown files in this directory. There is no
database in the content path: the site statically builds every article at
deploy time, and **publishing an article means merging it to master** (Netlify
auto-deploys). The agentic SEO brain proposes new articles as pull requests
that add files here.

## File format

Each file is frontmatter followed by the article body in Markdown:

```
---
title: The article title
slug: the-article-slug            # must match the filename
meta_title: SEO title tag (<= 60 chars)
meta_description: SEO meta description (<= 155 chars)
excerpt: One or two sentence summary for the listing card
primary_keyword: the primary target keyword
article_type: pillar              # or: faq
cluster_slug: data-integration    # one of content/clusters.json
published: 2026-06-11             # YYYY-MM-DD
ai_assisted: true                 # renders the AI-assisted badge (honest disclosure)
updated: 2026-06-15               # optional, defaults to published
---

## First H2
Body starts here...
```

## Conventions (match the rest of the site)

- **No level-1 heading.** The page renders `title` as the `<h1>`, so the body
  starts at `##`. FAQ structured data is auto-extracted from `##` question
  headings, so FAQ articles use questions as their `##` headings.
- **No em dashes** in copy (house style). Commas, colons, and full stops only.
- **British spelling.**
- Internal links point at `/blog/<slug>` and must only reference slugs that
  exist in this directory, so there are no dead links.
- Clusters are defined in `content/clusters.json`; `cluster_slug` must match.

## Where the content surfaces

Every file here automatically appears in: the blog index and topic pages, the
sitemap, the RSS feed (`/feed.xml`), the per-article Open Graph image, the LLM
index (`/llms.txt`), the full corpus dump (`/llms-full.txt`), and the raw
markdown endpoint (`/blog/<slug>/raw.md`).
