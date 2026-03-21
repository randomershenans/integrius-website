# Integrius CMS — SEO Audit
**Date:** March 21, 2026  
**Auditor:** Cascade  
**Scope:** All public-facing pages in `cms/src/app/`

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 4 | Fixed |
| 🟠 High | 6 | Fixed |
| 🟡 Medium | 4 | Fixed |
| **Total** | **14** | **All fixed** |

---

## 🔴 Critical

### C1 — Footer copyright reads "Real Talk Holdings" instead of "Integrius"
**Files:** `blog/page.tsx:175`, `blog/[slug]/page.tsx:223`  
**Impact:** Brand trust. Any user or crawler reading the footer sees the wrong company name.  
**Fix:** Replace with `© {year} Integrius`.

---

### C2 — Article page missing `<h1>`
**File:** `blog/[slug]/page.tsx`  
**Impact:** Google requires a visible H1 on every page. The article title exists in `<title>` and JSON-LD but is never rendered as an H1 in the DOM. This directly harms keyword ranking for the article's primary keyword.  
**Fix:** Add `<h1>` rendering the `article.title` above the TOC.

---

### C3 — Sitemap missing cluster topic pages and about page
**File:** `sitemap.ts`  
**Impact:** `/blog/topic/*` and `/blog/about` are never submitted to Google. Crawlers can only find them via internal links, which slows indexing significantly.  
**Fix:** Add all cluster pages and `/blog/about` to the sitemap.

---

### C4 — Cluster filter on `/blog` links to `?cluster=` query params, not canonical topic pages
**File:** `blog/page.tsx:110`  
**Impact:** The cluster filter tabs link to `/blog?cluster=data-integration` — a query-param URL that is not the canonical cluster page. No internal link equity passes to `/blog/topic/data-integration`. The topic pages are effectively orphaned in terms of PageRank flow.  
**Fix:** Change cluster filter links to `/blog/topic/[cluster.slug]`.

---

## 🟠 High

### H1 — `BreadcrumbList` cluster item links to `?cluster=` query param
**File:** `blog/[slug]/page.tsx:74`  
**Impact:** The breadcrumb in JSON-LD says the parent URL is `/blog?cluster=data-integration`, not `/blog/topic/data-integration`. Google will follow this and index the query-param version as the authoritative cluster URL.  
**Fix:** Change to `/blog/topic/${cluster.slug}`.

### H2 — `WebSite` SearchAction references non-existent search endpoint
**File:** `layout.tsx`  
**Impact:** The `SearchAction` potentialAction points to `/blog?q={search_term_string}` but no search is implemented. Google may test this and mark the schema as invalid, discrediting other structured data on the page.  
**Fix:** Remove the `potentialAction` from the `WebSite` schema.

### H3 — Google Fonts loaded via CSS `@import` (render-blocking)
**File:** `globals.css:5`  
**Impact:** `@import url('https://fonts.googleapis.com/...')` in CSS is render-blocking. It delays First Contentful Paint. Core Web Vitals (LCP) is a direct Google ranking factor.  
**Fix:** Replace with `next/font/google` which generates a preload hint in `<head>` and serves fonts from the same origin.

### H4 — No security or performance HTTP headers
**File:** `next.config.ts`  
**Impact:** Missing `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. Google's Security Issues report flags these. Also missing `poweredByHeader: false` which reveals the tech stack unnecessarily.  
**Fix:** Add headers config to `next.config.ts`.

### H5 — `Article` JSON-LD missing `author` field
**File:** `blog/[slug]/page.tsx`  
**Impact:** Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) evaluation uses the `author` field to assess content credibility. Missing author reduces eligibility for rich results.  
**Fix:** Add `author: { '@type': 'Organization', name: 'Integrius Research Team', url: siteUrl/blog/about }`.

### H6 — No custom 404 page
**File:** Missing `app/not-found.tsx`  
**Impact:** Default Next.js 404 is a blank white page with no links. Every 404 visit is a bounce. A custom 404 with navigation converts lost traffic.  
**Fix:** Create `app/not-found.tsx`.

---

## 🟡 Medium

### M1 — `/blog` listing page missing `alternates.canonical`
**File:** `blog/page.tsx`  
**Impact:** Without an explicit canonical, Google may index `/blog?cluster=...` filter variants as separate pages, causing duplicate content dilution.  
**Fix:** Add `alternates: { canonical: '/blog' }` to page metadata.

### M2 — Sitemap `changeFrequency` for articles set to `monthly`
**File:** `sitemap.ts`  
**Impact:** Articles that get updated (published → edited) won't be re-crawled quickly. `weekly` is more appropriate for a growing blog.  
**Fix:** Change to `'weekly'`.

### M3 — Cluster topic pages nav missing `About` link
**File:** `blog/topic/[cluster]/page.tsx`  
**Impact:** Minor inconsistency — every other page nav has Blog + About + Book a demo. The topic page nav has Blog + Book a demo, missing About. Inconsistent internal links reduce PageRank flow to `/blog/about`.  
**Fix:** Add About link to cluster page nav.

### M4 — Blog listing footer has no navigation links
**File:** `blog/page.tsx:173-177`  
**Impact:** All other pages have a footer nav (Blog, RSS, About, Product). The main `/blog` listing footer has only copyright. Inconsistent.  
**Fix:** Add consistent footer nav.

---

## Not in scope (require decisions)
- **OG image** — no `openGraph.images` defined anywhere. Social shares will show no image. Requires a default 1200×630 image asset to be created.
- **Twitter/X handle** — `twitter.site` not set. Requires account handle.
- **Analytics** — Plausible or GA4 tracking ID needed from the team.
- **LinkedIn `sameAs`** — Organisation schema references `linkedin.com/company/integrius` — verify this is the correct LinkedIn company URL.
