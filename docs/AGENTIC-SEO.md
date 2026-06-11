# Agentic SEO Engine

The marketing site runs a nightly "SEO brain" that reads real search and traffic data, asks Claude where the content gaps are, and feeds new article specs into the existing AI generation and publishing pipeline. No human in the loop is required, but everything is visible and triggerable from the admin dashboard.

## Architecture

```
                 nightly (05:00 UTC)
netlify/functions/seo-brain-cron.js
        |
        v
GET /api/cron/seo-brain  (CRON_SECRET)
        |
        v
src/lib/seo-brain.ts  runSeoBrain()
        |
        |-- 1. Dispatch due cms_generation_queue jobs
        |       -> netlify/functions/generate-background.js (production)
        |       -> src/lib/claude.ts generateArticle() (local dev)
        |
        |-- 2. Gather signals
        |       src/lib/gsc.ts          GSC top queries + top pages (28 days)
        |       src/lib/posthog-server.ts  PostHog top pages by views
        |       Prisma                  existing articles, specs, clusters
        |
        |-- 3. Claude analysis (claude-sonnet-4, circuit breaker, 60s timeout)
        |       -> up to 5 new article opportunities + quick wins (strict JSON)
        |
        |-- 4. Dedupe against existing slugs and primary keywords
        |
        |-- 5. Persist survivors as cms_article_specs
        |       (AUTO_QUEUE_GENERATION=true also inserts cms_generation_queue
        |        rows, staggered one per day at 06:00 UTC)
        |
        '-- 6. Record the run in cms_seo_runs

                 hourly (on the hour)
netlify/functions/publish-cron.js
        |
        v
GET /api/cron/publish  (CRON_SECRET)
        |
        '-- publishes scheduled articles + shares them to LinkedIn
```

The full loop: data in, Claude analysis, new specs, generation queue, draft articles, scheduled publish, LinkedIn share. The next night the brain sees the new pages in the GSC and PostHog data and adjusts.

## Google Search Console setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create (or pick) a project.
2. Enable the **Google Search Console API**: APIs and Services, Library, search for "Google Search Console API", Enable.
3. Create a service account: IAM and Admin, Service Accounts, Create. No project roles are needed.
4. Create a JSON key for the service account (Keys tab, Add key, JSON). The downloaded file contains `client_email` and `private_key`.
5. In [Search Console](https://search.google.com/search-console), open the integri.us property, Settings, Users and permissions, Add user. Add the service account email with **Full** or **Restricted** permission.
6. Set the env vars (Netlify site settings and `.env.local`):
   - `GSC_CLIENT_EMAIL`: the `client_email` from the JSON key
   - `GSC_PRIVATE_KEY`: the `private_key` from the JSON key. Keep the `\n` escapes when pasting into a single-line env var.
   - `GSC_SITE_URL`: the property exactly as registered, e.g. `sc-domain:integri.us` for a domain property or `https://integri.us/` for a URL prefix property.

No googleapis dependency is used. `src/lib/gsc.ts` signs an RS256 JWT with `jose`, exchanges it at the Google OAuth token endpoint, caches the access token in module scope, and calls the Search Analytics API directly.

## PostHog setup (EU cloud)

1. In [PostHog EU](https://eu.posthog.com), open your project.
2. Personal API key: click your avatar, Personal API keys, create one with the **Query read** scope. This is the server-side `POSTHOG_PERSONAL_API_KEY`. Never expose it to the browser.
3. Project id: Project settings, the numeric id in the URL or the settings page. This is `POSTHOG_PROJECT_ID`.
4. `POSTHOG_API_HOST` defaults to `https://eu.posthog.com`; set it only if you use a different region.
5. For browser-side tracking (which produces the `$pageview` events the brain reads), the public snippet uses `NEXT_PUBLIC_POSTHOG_KEY` (the project API key, `phc_...`) and `NEXT_PUBLIC_POSTHOG_HOST` (`https://eu.i.posthog.com`).

`src/lib/posthog-server.ts` queries the HogQL endpoint (`POST /api/projects/{id}/query`) for top pages by views and the daily pageview trend. If PostHog is not configured the brain simply skips it and records the run as `partial`.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GSC_CLIENT_EMAIL` | for GSC | Service account email |
| `GSC_PRIVATE_KEY` | for GSC | Service account PEM key (with `\n` escapes) |
| `GSC_SITE_URL` | for GSC | GSC property, e.g. `sc-domain:integri.us` |
| `POSTHOG_PERSONAL_API_KEY` | for PostHog | Query API key (server only) |
| `POSTHOG_PROJECT_ID` | for PostHog | Numeric project id |
| `POSTHOG_API_HOST` | no | Defaults to `https://eu.posthog.com` |
| `NEXT_PUBLIC_POSTHOG_KEY` | no | Browser tracking key (`phc_...`) |
| `NEXT_PUBLIC_POSTHOG_HOST` | no | Browser ingestion host |
| `AUTO_QUEUE_GENERATION` | no | `true` to auto-queue generation for new specs (default off) |
| `CRON_SECRET` | yes | Shared secret for `/api/cron/*` routes |
| `ANTHROPIC_API_KEY` | yes | Claude analysis and article generation |

The brain degrades gracefully: a run with missing GSC or PostHog config still completes and is recorded with status `partial`.

## Scheduled functions

Both schedules are declared in code, no `netlify.toml` changes needed:

- `netlify/functions/seo-brain-cron.js`: daily at 05:00 UTC, calls `/api/cron/seo-brain`.
- `netlify/functions/publish-cron.js`: hourly, calls `/api/cron/publish` (publishes scheduled articles and shares them to LinkedIn).

Each function fires the corresponding Next.js cron route with `?secret=$CRON_SECRET` and logs the response. If the run takes longer than the function's 25 second wait, the trigger logs a timeout note and the run continues server-side.

## Triggering manually

- Admin dashboard: `/admin/seo` has a "Run SEO brain now" button (admin session auth, no cron secret needed). The page also shows config status, run history, the latest opportunities with rationale, quick wins, and live GSC top queries.
- curl:

```bash
curl "https://integri.us/api/cron/seo-brain?secret=$CRON_SECRET"
curl "https://integri.us/api/cron/publish?secret=$CRON_SECRET"
```

## Data model

Each run writes one row to `cms_seo_runs`:

| Column | Meaning |
|---|---|
| `status` | `ok`, `partial` (a data source was missing or failed), or `error` (analysis failed) |
| `gsc_rows` / `posthog_rows` | how many signal rows were gathered |
| `opportunities_found` | opportunities Claude proposed before dedupe |
| `specs_created` | new `cms_article_specs` rows actually created |
| `quick_wins` | JSON list of striking-distance improvements (page, query, impressions, CTR, position, suggested action) |
| `report` | the full structured analysis, including per-opportunity rationale and run notes |

New specs flow into the existing machinery: `cms_article_specs` to `cms_generation_queue` (when auto-queue is on) to `generate-background` to draft `cms_articles`, then publish and LinkedIn share via the hourly cron. Drafts still need to be published or scheduled from `/admin/articles`, so nothing goes live without the usual review step.

## House rules honoured

- No em dashes in any generated copy. The brain strips them from every field Claude returns, and the article generator strips them again at generation time.
- Meta titles are capped at 60 characters, meta descriptions at 155.
- Every opportunity must map to an existing keyword cluster; unknown clusters are skipped and noted in the run report.
