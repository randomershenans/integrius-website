# Integrius marketing site

> **THIS IS NOT THE INTEGRIUS PRODUCT.**
>
> This is the marketing site for integri.us: the public website, the git-native blog, the agentic SEO engine, the admin panel, and the client portal. It shares a Postgres database with the product but only touches `cms_` prefixed tables, and has no code dependency on the product whatsoever.

---

## What it does

- **Public site + blog** at `/` and `/blog`: statically built from markdown in `content/blog/`, with Article + FAQ schema markup, Open Graph images, and a sitemap at `/sitemap.xml`
- **Git-native publishing**: an article is a markdown file; publishing means merging it to master (Netlify auto-deploys). No database in the content path. See [content/blog/README.md](content/blog/README.md) for the file contract
- **Agentic SEO brain**: a nightly run reads Google Search Console + PostHog signals, finds content gaps, writes draft articles, and opens a PR per run for human review. See [docs/AGENTIC-SEO.md](docs/AGENTIC-SEO.md)
- **Admin panel** at `/admin`: JWT-authenticated dashboard for client and license management plus SEO brain runs and reports
- **Client portal** at `/portal`: Supabase-authenticated portal for clients (licenses, downloads)

---

## Architecture in one paragraph

Next.js 14 App Router on Netlify. The blog content layer (`src/lib/content.ts`) reads `content/blog/*.md` from the filesystem at build time. The SEO brain (`src/lib/seo-brain.ts`) runs from a Netlify scheduled function (`netlify/functions/seo-brain-cron.js`) hitting `/api/cron/seo-brain`, and opens content PRs via the GitHub API (`src/lib/github-content.ts`). Prisma manages a single table, `cms_admin_users`, which backs admin login. Portal tables live in Supabase (`supabase/migrations/`).

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in the values. The essentials:

```
DATABASE_URL=          # same Postgres as the product — this site uses cms_ tables only
CMS_ADMIN_EMAIL=       # your admin login email
CMS_ADMIN_PASSWORD=    # strong password
CMS_JWT_SECRET=        # random 32+ char string (openssl rand -hex 32)
NEXT_PUBLIC_SITE_URL=  # https://integri.us
```

The SEO brain, portal, and contact form need more (Anthropic, GSC, PostHog, GitHub, Supabase, Resend); `.env.example` documents every variable, and [docs/AGENTIC-SEO.md](docs/AGENTIC-SEO.md) walks through the SEO brain credentials.

### 3. Run database migrations and seed the admin user

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start dev server

```bash
npm run dev
# Runs on http://localhost:3002
```

---

## Writing and publishing an article

1. Add a markdown file to `content/blog/` following the contract in [content/blog/README.md](content/blog/README.md) (frontmatter keys, body starts at H2, no em dashes, UK English)
2. Open a PR; review it like code
3. Merge to master: Netlify rebuilds and the article is live

The SEO brain does steps 1 and 2 for you on its nightly run; you do step 3.

---

## SEO features

- **Article schema** (JSON-LD) on every article page
- **FAQ schema** (JSON-LD) on FAQ articles, extracted from H2 questions
- **Open Graph + Twitter card** meta with generated OG images, site-wide and per-article
- **Sitemap** at `/sitemap.xml`, rebuilt with the static site on every deploy
- **Canonical URLs** on all pages
- **LLM-friendly endpoints** for the git-native content

---

## Deployment

Netlify auto-deploys on every push to master. The build runs `npx prisma migrate deploy && npx prisma generate && npm run build` (see `netlify.toml`), so schema migrations apply themselves. Set all environment variables in the Netlify site settings.
