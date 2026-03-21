# Integrius CMS

> **THIS IS NOT THE INTEGRIUS PRODUCT.**
>
> This is the marketing blog CMS for integri.us. It is a completely separate Next.js application that shares the same Postgres database (using `cms_` prefixed tables) but has no code dependency on the main product whatsoever. Deploy them independently.

---

## What it does

- **Public blog** at `/blog` — SEO-optimised article listing and article pages with Article + FAQ schema markup, sitemap at `/sitemap.xml`
- **Admin panel** at `/admin` — JWT-authenticated dashboard to manage posts, review AI-generated drafts, publish, and share
- **AI generation** — Claude (claude-3-5-sonnet) writes articles from a structured content bank of 23 keyword-targeted specs (8 pillar articles + 15 FAQ pieces)
- **LinkedIn auto-share** — publishes a hook + link to the company page on every article publish
- **Cron endpoint** — `GET /api/cron/publish?secret=...` publishes scheduled articles and auto-shares to LinkedIn, called hourly by an external scheduler

---

## Separation from the product

| | Main product | CMS |
|---|---|---|
| **Codebase** | `server/`, `src/` (root) | `cms/` |
| **package.json** | Root | `cms/package.json` |
| **DB tables** | No prefix | `cms_` prefix |
| **Prisma schema** | `prisma/schema.prisma` | `cms/prisma/schema.prisma` |
| **Deployment** | Separate Netlify/Vercel site | Separate Netlify/Vercel site |
| **Auth** | Product JWT sessions | CMS-only JWT cookies |

---

## Setup

### 1. Install dependencies

```bash
cd cms
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL=          # same Postgres as the product — CMS uses cms_ tables only
CMS_ADMIN_EMAIL=       # your admin login email
CMS_ADMIN_PASSWORD=    # strong password
CMS_JWT_SECRET=        # random 32+ char string (openssl rand -hex 32)
ANTHROPIC_API_KEY=     # sk-ant-... from console.anthropic.com
LINKEDIN_ACCESS_TOKEN= # OAuth 2.0 token for company page
LINKEDIN_ORGANIZATION_ID= # urn:li:organization:<id> from LinkedIn
NEXT_PUBLIC_SITE_URL=  # https://integri.us
CRON_SECRET=           # random string, passed as ?secret= by cron caller
```

### 3. Run database migrations

```bash
npx prisma db push
```

### 4. Seed the content bank

This creates the admin user and loads all 23 keyword specs:

```bash
npm run db:seed
```

### 5. Start dev server

```bash
npm run dev
# Runs on http://localhost:3002
```

---

## Content bank

23 pre-loaded article specifications across 6 keyword clusters:

| Cluster | Specs |
|---------|-------|
| Data Integration Problems | 6 (pillar + FAQs) |
| Data Products & Data Mesh | 5 (pillar + FAQs) |
| Enterprise Search | 4 (pillar + FAQs) |
| AI & Data Readiness | 2 (pillar + FAQs) |
| Self-Hosted & Sovereignty | 3 (pillar + FAQs) |
| Industry Verticals | 3 (pillar + FAQs) |

All specs include: primary keyword, secondary keywords, H2 structure, key data points to include, meta title/description, CTA text, and internal link targets.

---

## AI generation

1. Go to `/admin/generate`
2. Pick a spec
3. Click **Generate with Claude** — takes 20-40 seconds
4. Review and edit the draft in the article editor
5. Publish — LinkedIn share triggers automatically (or manually from editor)

**Writing rules baked into the prompt:**
- Problem-first. Integrius appears as the answer, never the headline.
- No em dashes. Not a single one.
- UK English.
- Short sentences, short paragraphs.
- Every claim cites a named source.
- Answers the primary keyword query in the first 150 words.

---

## Publishing cadence

Recommended schedule for bi-daily content:

| Day | Action |
|-----|--------|
| Monday | Publish pillar article, auto-share to LinkedIn |
| Wednesday | Publish FAQ/glossary piece |
| Thursday | Publish pillar article, auto-share to LinkedIn |
| Friday | Ross personal LinkedIn post linking to Thursday article |

Schedule articles in the editor (`status: scheduled`, set `scheduled_for`), then the hourly cron picks them up automatically.

---

## Cron setup

The cron endpoint publishes scheduled articles and auto-shares to LinkedIn.

**URL:** `GET https://your-cms-domain.com/api/cron/publish?secret=YOUR_CRON_SECRET`

**Options:**
- **Vercel Cron** (`vercel.json`): `{ "crons": [{ "path": "/api/cron/publish?secret=...", "schedule": "0 * * * *" }] }`
- **GitHub Actions**: scheduled workflow hitting the URL hourly
- **EasyCron / cron-job.org**: free external cron services

---

## LinkedIn setup

1. Create a LinkedIn Developer App at https://developer.linkedin.com/
2. Add the **Marketing Developer Platform** product to get UGC Posts API access
3. Generate an OAuth 2.0 access token with `w_organization_social` scope
4. Set `LINKEDIN_ACCESS_TOKEN` and `LINKEDIN_ORGANIZATION_ID` in `.env.local`

Access tokens expire after 60 days. Refresh them via the LinkedIn OAuth flow or use a long-lived token via the token refresh endpoint.

---

## SEO features

- **Article schema** (JSON-LD) on every article page
- **FAQ schema** (JSON-LD) on FAQ/glossary articles — enables People Also Ask placement
- **OpenGraph + Twitter card** meta on all pages
- **Sitemap** at `/sitemap.xml` (auto-generated, updated on each article publish)
- **Canonical URLs** on all pages
- **ISR** (Incremental Static Regeneration) — pages revalidate every 60 seconds

---

## Deployment

Deploy `cms/` as a separate site from the main product:

```bash
# Netlify — from the cms/ directory
netlify deploy --dir=.next --prod

# Vercel — from the cms/ directory
vercel --prod
```

Set all environment variables in the deployment platform's settings. The `DATABASE_URL` should point to the same Postgres as the product — the CMS only touches `cms_` prefixed tables.
