# Agentic SEO Engine

The marketing site runs a daily "SEO brain" that reads real search and traffic data, asks Claude where the content gaps are, writes complete draft articles, and opens a GitHub pull request adding them to `content/blog/`. The blog is git-native: there is no database in the content path. A human reviews the PR, merges it, and Netlify rebuilds the static site. Publishing is the merge.

## The flow

```
                 daily (05:00 UTC)
netlify/functions/seo-brain-cron.js   (fire-and-forget dispatch)
        |
        v
GET /api/cron/seo-brain  (CRON_SECRET)
        |
        v
src/lib/seo-brain.ts  runSeoBrain()
        |
        |-- 1. GATHER signals
        |       src/lib/gsc.ts             GSC top queries + top pages (28 days)
        |       src/lib/posthog-server.ts  PostHog top pages by views
        |       src/lib/content.ts         existing articles + clusters (markdown files)
        |
        |-- 2. ANALYZE (claude-sonnet-4, circuit breaker, 60s timeout)
        |       up to 5 new article opportunities + quick wins (strict JSON),
        |       deduped against existing slugs and primary keywords
        |
        |-- 3. WRITE (one Claude call per article, up to SEO_BRAIN_MAX_ARTICLES)
        |       complete markdown file per opportunity, validated against the
        |       house contract (frontmatter, no H1, no dashes, no dead links)
        |
        |-- 4. OPEN PR (src/lib/github-content.ts, plain fetch, no SDK)
        |       branch seo-brain/{date}, one commit per file under
        |       content/blog/, PR body carries the full run report
        |
        '-- 5. RETURN the run report as JSON (no database writes anywhere)

        human reviews and merges the PR
        |
        v
Netlify auto-deploys master and statically rebuilds the blog,
sitemap, RSS feed, OG images and llms.txt from the new files.
```

The next day the brain sees the new pages in the GSC and PostHog data and adjusts. Nothing goes live without a human merging the PR.

## What the brain writes

Each article is a complete markdown file following `content/blog/README.md`:

- Frontmatter: `title`, `slug`, `meta_title` (60 chars max), `meta_description` (155 chars max), `excerpt`, `primary_keyword`, `article_type` (`pillar` or `faq`), `cluster_slug` (must exist in `content/clusters.json`), `published` (run date), `ai_assisted: true`.
- Body starts at `##` (the page renders the title as the H1), 1500 to 2500 words, British spelling, GFM tables where they help.
- No em dashes or en dashes anywhere (house rule, enforced by a post-generation sweep).
- Internal links only to existing `/blog/<slug>` URLs and product pages (`/products/core`, `/products/optic`, `/technical-brief`); links to unknown slugs are unwrapped to plain text.
- A closing CTA linking `/contact`.

Validation happens before the PR: the output must parse as frontmatter plus body, the frontmatter is rebuilt deterministically from the analysed opportunity so required fields are guaranteed, H1s are demoted, dead links unwrapped, and any deviations are listed as validation notes in the PR body.

## Setup

### Google Search Console

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

### PostHog (EU cloud)

1. In [PostHog EU](https://eu.posthog.com), open your project.
2. Personal API key: click your avatar, Personal API keys, create one with the **Query read** scope. This is the server-side `POSTHOG_PERSONAL_API_KEY`. Never expose it to the browser.
3. Project id: Project settings, the numeric id in the URL or the settings page. This is `POSTHOG_PROJECT_ID`.
4. `POSTHOG_API_HOST` defaults to `https://eu.posthog.com`; set it only if you use a different region.
5. For browser-side tracking (which produces the `$pageview` events the brain reads), the public snippet uses `NEXT_PUBLIC_POSTHOG_KEY` (the project API key, `phc_...`) and `NEXT_PUBLIC_POSTHOG_HOST` (`https://eu.i.posthog.com`).

`src/lib/posthog-server.ts` queries the HogQL endpoint (`POST /api/projects/{id}/query`) for top pages by views. If PostHog is not configured the brain simply skips it and reports the run as `partial`.

### GitHub

1. Create a [fine-grained personal access token](https://github.com/settings/tokens) scoped to the site repo with **Contents: read and write** and **Pull requests: read and write** (or a classic token with the `repo` scope).
2. Set the env vars:
   - `GITHUB_TOKEN`: the token
   - `GITHUB_REPO`: the repo as `owner/repo`, e.g. `randomershenans/integrius-website`
   - `GITHUB_BASE_BRANCH`: optional, defaults to `master`

`src/lib/github-content.ts` is a minimal REST v3 client using plain fetch (no SDK). It resolves the base branch SHA, creates the branch `seo-brain/{YYYY-MM-DD}` (suffixing `-2`, `-3`, ... if the branch already exists), commits one file per article via the contents API, and opens the PR. If `GITHUB_TOKEN` is missing, the run still completes and reports `pr: not configured`; articles are generated but not pushed anywhere.

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
| `GITHUB_TOKEN` | for PRs | Repo-scoped personal access token |
| `GITHUB_REPO` | for PRs | The site repo as `owner/repo` |
| `GITHUB_BASE_BRANCH` | no | Defaults to `master` |
| `SEO_BRAIN_MAX_ARTICLES` | no | Max articles written per run, default 2, clamped to 0..5 |
| `CRON_SECRET` | yes | Shared secret for `/api/cron/*` routes |
| `ANTHROPIC_API_KEY` | yes | Claude analysis and article writing |

The brain degrades gracefully: a run with missing GSC, PostHog or GitHub config still completes and reports `partial` (or `pr: not configured`) instead of failing.

## Scheduling

`netlify/functions/seo-brain-cron.js` runs daily at 05:00 UTC (schedule declared in code, no `netlify.toml` entry) and calls `/api/cron/seo-brain?secret=$CRON_SECRET`.

The dispatch is **fire-and-forget**: a full run now writes whole articles (multiple Claude calls) and can take minutes, far beyond the scheduled function's budget. The function fetches with a 5 second timeout, logs that the run was dispatched, and does not await completion. The trade-off is that the scheduled function's log only confirms dispatch, not success. The authoritative outcome of a run is the PR it opens (or does not open); failures are visible in the Next.js function logs for `/api/cron/seo-brain` and in the run report when triggered manually.

The old hourly `publish-cron.js` is gone: with a git-native blog there is no scheduled publish step, content goes live when a PR merges and Netlify rebuilds.

## Triggering manually

- Admin dashboard: `/admin/seo` has a "Run SEO brain now" button (admin session auth, no cron secret needed). The full run report renders inline: opportunities with rationale, quick wins, articles written and the PR link. The page also shows config status chips (Search Console, PostHog, GitHub), the list of open `seo-brain/*` PRs, live GSC top queries and live PostHog top pages.
- curl:

```bash
curl "https://integri.us/api/cron/seo-brain?secret=$CRON_SECRET"
```

Both return the same JSON run report. There is no run history table: the durable artefacts of a run are its PR (branch, commits, report in the PR body) and the merged markdown files.

## Reviewing a PR

Every PR body contains the signals used (top GSC queries), the chosen opportunities with rationale, the quick wins for manual follow-up, and a review checklist. When reviewing:

1. Check facts and product claims. The writer is instructed not to invent benchmarks, customers or statistics, but verify anything specific.
2. Check the copy reads naturally: British spelling, no em or en dashes, no H1 in the body.
3. Check internal links: they must point at existing `/blog/` slugs or the product pages. The validator unwraps unknown slugs, but confirm the remaining links make sense in context.
4. Check the frontmatter: meta title 60 characters or fewer, meta description 155 or fewer, sensible cluster.
5. Edit freely on the branch if the article needs work, then merge. Merging publishes: the article appears in the blog index, sitemap, RSS feed, OG images and llms.txt on the next deploy.
6. Quick wins in the PR body need manual action (meta rewrites, internal links on existing pages); they involve no file changes in the PR itself.

## House rules honoured

- No em dashes (and no en dashes) in any generated copy. The brain strips them from every analysis field and sweeps the article markdown again after generation.
- Meta titles are capped at 60 characters, meta descriptions at 155.
- Every opportunity must map to an existing cluster in `content/clusters.json`; unknown clusters are skipped and noted in the run report.
- The body starts at `##`; FAQ articles use questions as their `##` headings so FAQ structured data extracts cleanly.
- `ai_assisted: true` is always set, so the AI-assisted badge renders (honest disclosure).
