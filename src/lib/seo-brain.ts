// ─────────────────────────────────────────────────────────────────────────────
// The SEO brain: agentic SEO engine for the Integrius marketing site.
//
// One run:
//   1. Dispatches any due cms_generation_queue jobs (auto-queued by earlier runs)
//   2. Gathers signals: GSC top queries + pages, PostHog top pages,
//      existing articles / specs / clusters
//   3. Asks Claude for new article opportunities + quick wins (structured JSON)
//   4. Dedupes against existing slugs and primary keywords
//   5. Persists survivors as cms_article_specs (optionally auto-queues generation)
//   6. Records the run in cms_seo_runs
//
// Never throws unhandled: partial data is fine, everything is recorded.
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import { CircuitBreaker } from './circuit-breaker';
import { isGscConfigured, fetchTopQueries, fetchTopPages, type SearchAnalyticsRow } from './gsc';
import { isPostHogConfigured, fetchTopPagesByViews, type PageViewRow } from './posthog-server';

const MODEL = 'claude-sonnet-4-20250514';
const API_TIMEOUT_MS = 60_000;

const seoBreaker = new CircuitBreaker('Claude API (SEO brain)');

// ── Types ────────────────────────────────────────────────────────────────────

export interface SeoOpportunity {
  title: string;
  slug: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  meta_title: string;
  meta_description: string;
  h2_structure: string[];
  key_points: string[];
  article_type: 'faq' | 'pillar';
  word_count_min: number;
  word_count_max: number;
  cta_text: string | null;
  cluster_slug: string;
  rationale: string;
}

export interface QuickWin {
  page: string;
  query: string;
  impressions: number;
  ctr: number;
  position: number;
  suggested_action: string;
}

interface SeoAnalysis {
  opportunities: SeoOpportunity[];
  quick_wins: QuickWin[];
}

export interface SeoBrainSummary {
  run_id: string | null;
  status: 'ok' | 'error' | 'partial';
  gsc_rows: number;
  posthog_rows: number;
  opportunities_found: number;
  specs_created: number;
  quick_wins_found: number;
  auto_queued: number;
  generation_dispatched: number;
  notes: string[];
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** House rule: no em dashes in any copy. Same replacement as src/lib/claude.ts. */
export function stripEmDashes(text: string): string {
  return text.replace(/\u2014/g, ',').replace(/--/g, ',');
}

function sanitiseSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`API call timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to your environment variables.');
  }
  return new Anthropic({ apiKey });
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback;
}

// ── Claude analysis ──────────────────────────────────────────────────────────

interface AnalysisInput {
  gscQueries: SearchAnalyticsRow[];
  gscPages: SearchAnalyticsRow[];
  posthogPages: PageViewRow[];
  existingArticles: Array<{ slug: string; title: string; primary_keyword: string | null }>;
  existingSpecs: Array<{ slug: string; title: string; primary_keyword: string }>;
  clusters: Array<{ slug: string; name: string }>;
}

function buildAnalysisPrompt(input: AnalysisInput): string {
  const fmtGsc = (rows: SearchAnalyticsRow[]) =>
    rows.map(r => `${r.keys.join(' | ')}: clicks=${r.clicks}, impressions=${r.impressions}, ctr=${(r.ctr * 100).toFixed(1)}%, position=${r.position.toFixed(1)}`).join('\n') || '(no data)';

  return `You are the SEO strategist for integri.us, the marketing site of Integrius, a governed data layer and data products platform. The audience is CDOs, VPs of Data, data engineers and data architects.

Analyse the search and traffic data below and return a JSON object with exactly two keys: "opportunities" and "quick_wins".

GOOGLE SEARCH CONSOLE TOP QUERIES (last 28 days):
${fmtGsc(input.gscQueries.slice(0, 40))}

GOOGLE SEARCH CONSOLE TOP PAGES (last 28 days):
${fmtGsc(input.gscPages.slice(0, 25))}

POSTHOG TOP PAGES BY VIEWS (last 28 days):
${input.posthogPages.slice(0, 25).map(p => `${p.pathname}: ${p.views} views`).join('\n') || '(no data)'}

EXISTING PUBLISHED/DRAFT ARTICLES (do NOT duplicate these topics):
${input.existingArticles.map(a => `- ${a.slug} | "${a.title}" | keyword: ${a.primary_keyword ?? 'n/a'}`).join('\n') || '(none)'}

EXISTING ARTICLE SPECS ALREADY PLANNED (do NOT duplicate these either):
${input.existingSpecs.map(s => `- ${s.slug} | "${s.title}" | keyword: ${s.primary_keyword}`).join('\n') || '(none)'}

KEYWORD CLUSTERS (every opportunity MUST use one of these cluster_slug values):
${input.clusters.map(c => `- ${c.slug} (${c.name})`).join('\n') || '(none)'}

TASK 1, "opportunities": up to 5 NEW article opportunities not already covered by the existing articles or specs above. Each object must have:
- title: string
- slug: kebab-case string
- primary_keyword: string
- secondary_keywords: string[] (3-6 items)
- search_intent: "informational" or "commercial"
- meta_title: string, 60 characters maximum
- meta_description: string, 155 characters maximum
- h2_structure: string[] (5-8 H2 headings, in order)
- key_points: string[] (4-8 bullets the article must cover)
- article_type: "faq" or "pillar"
- word_count_min: number (faq: 300, pillar: 1200)
- word_count_max: number (faq: 500, pillar: 2000)
- cta_text: string (a closing call to action)
- cluster_slug: one of the cluster slugs listed above
- rationale: 1-3 sentences explaining why, citing the specific GSC or PostHog signals above (queries, impressions, CTR, position, page views)

Prioritise topics where the data shows real demand: queries with impressions but no dedicated page, rising query themes adjacent to pages that already get traffic, and gaps in cluster coverage.

TASK 2, "quick_wins": existing pages and queries with high impressions but low CTR where the average position is between 5 and 20 (striking distance). Each object must have:
- page: string (the page URL or path, or "" if the signal is query-only)
- query: string
- impressions: number
- ctr: number (the decimal CTR from the data)
- position: number
- suggested_action: 1-2 sentences (e.g. rewrite the meta title, add an FAQ section targeting the query, add internal links)

Return an empty array for either key if there is genuinely nothing.

RULES:
- Return ONLY valid JSON. No markdown fences, no commentary.
- NO EM DASHES anywhere in any string. Use commas, colons or full stops instead.
- UK English.
- Slugs must be lowercase kebab-case and must not collide with the existing slugs listed above.`;
}

async function analyseWithClaude(input: AnalysisInput): Promise<SeoAnalysis> {
  const client = getAnthropicClient();

  const response = await seoBreaker.execute(() =>
    withTimeout(
      client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildAnalysisPrompt(input) }],
      }),
      API_TIMEOUT_MS,
    ),
  );

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  return parseAnalysis(text);
}

function parseAnalysis(raw: string): SeoAnalysis {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`SEO analysis response contained no JSON object. First 200 chars: ${raw.slice(0, 200)}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`SEO analysis response was not valid JSON: ${detail}`);
  }

  const obj = parsed as { opportunities?: unknown; quick_wins?: unknown };
  const rawOpps = Array.isArray(obj.opportunities) ? obj.opportunities : [];
  const rawWins = Array.isArray(obj.quick_wins) ? obj.quick_wins : [];

  const opportunities: SeoOpportunity[] = [];
  for (const o of rawOpps.slice(0, 5)) {
    if (typeof o !== 'object' || o === null) continue;
    const r = o as Record<string, unknown>;

    const title = stripEmDashes(asString(r.title)).trim();
    const slug = sanitiseSlug(asString(r.slug) || title);
    const primaryKeyword = stripEmDashes(asString(r.primary_keyword)).trim();
    const clusterSlug = sanitiseSlug(asString(r.cluster_slug));
    if (!title || !slug || !primaryKeyword || !clusterSlug) continue;

    const articleType = asString(r.article_type) === 'faq' ? 'faq' : 'pillar';
    const defaults = articleType === 'faq' ? { min: 300, max: 500 } : { min: 1200, max: 2000 };

    opportunities.push({
      title,
      slug,
      primary_keyword: primaryKeyword,
      secondary_keywords: asStringArray(r.secondary_keywords).map(s => stripEmDashes(s).trim()).filter(Boolean),
      search_intent: asString(r.search_intent, 'informational') === 'commercial' ? 'commercial' : 'informational',
      meta_title: stripEmDashes(asString(r.meta_title, title)).trim().slice(0, 60),
      meta_description: stripEmDashes(asString(r.meta_description)).trim().slice(0, 155),
      h2_structure: asStringArray(r.h2_structure).map(s => stripEmDashes(s).trim()).filter(Boolean),
      key_points: asStringArray(r.key_points).map(s => stripEmDashes(s).trim()).filter(Boolean),
      article_type: articleType,
      word_count_min: asNumber(r.word_count_min, defaults.min),
      word_count_max: asNumber(r.word_count_max, defaults.max),
      cta_text: r.cta_text ? stripEmDashes(asString(r.cta_text)).trim() || null : null,
      cluster_slug: clusterSlug,
      rationale: stripEmDashes(asString(r.rationale)).trim(),
    });
  }

  const quick_wins: QuickWin[] = [];
  for (const w of rawWins.slice(0, 20)) {
    if (typeof w !== 'object' || w === null) continue;
    const r = w as Record<string, unknown>;
    const query = stripEmDashes(asString(r.query)).trim();
    if (!query) continue;
    quick_wins.push({
      page: stripEmDashes(asString(r.page)).trim(),
      query,
      impressions: asNumber(r.impressions, 0),
      ctr: typeof r.ctr === 'number' && Number.isFinite(r.ctr) ? r.ctr : 0,
      position: typeof r.position === 'number' && Number.isFinite(r.position) ? r.position : 0,
      suggested_action: stripEmDashes(asString(r.suggested_action)).trim(),
    });
  }

  return { opportunities, quick_wins };
}

// ── Generation queue integration ────────────────────────────────────────────

/**
 * Dispatch due pending cms_generation_queue jobs through the real generation
 * mechanism: the Netlify background function in production (same payload as
 * /api/admin/generate), or synchronous generation via src/lib/claude.ts in
 * local dev. The background function reports back to /api/admin/generate/complete.
 */
export async function dispatchDueGenerationJobs(notes: string[]): Promise<number> {
  const now = new Date();
  const due = await prisma.cms_generation_queue.findMany({
    where: { status: 'pending', scheduled_for: { lte: now } },
    orderBy: { scheduled_for: 'asc' },
    take: 3, // cap per run to stay inside function limits
  });

  if (due.length === 0) return 0;

  const siteUrl = process.env.URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3002';
  const bgFnUrl = process.env.URL ? `${process.env.URL}/.netlify/functions/generate-background` : null;

  let dispatched = 0;

  for (const job of due) {
    const spec = await prisma.cms_article_specs.findUnique({
      where: { id: job.spec_id },
      include: { cluster: { select: { id: true } } },
    });

    if (!spec) {
      await prisma.cms_generation_queue.update({
        where: { id: job.id },
        data: { status: 'failed', completed_at: new Date(), error: 'Spec not found' },
      });
      notes.push(`Queue job ${job.id} failed: spec ${job.spec_id} not found.`);
      continue;
    }

    // Claim the job so a concurrent run does not double-dispatch it
    await prisma.cms_generation_queue.update({
      where: { id: job.id },
      data: { status: 'generating', started_at: new Date() },
    });

    const specPayload = {
      id:                 spec.id,
      cluster_id:         spec.cluster?.id ?? null,
      title:              spec.title,
      slug:               spec.slug,
      meta_title:         spec.meta_title ?? spec.title,
      meta_description:   spec.meta_description ?? '',
      primary_keyword:    spec.primary_keyword,
      secondary_keywords: spec.secondary_keywords,
      search_intent:      spec.search_intent,
      article_type:       spec.article_type,
      h2_structure:       spec.h2_structure,
      key_points:         spec.key_points,
      word_count_min:     spec.word_count_min,
      word_count_max:     spec.word_count_max,
      cta_text:           spec.cta_text ?? null,
      internal_links:     spec.internal_links,
    };

    try {
      if (bgFnUrl) {
        // Production: fire the Netlify background function (returns 202 instantly)
        await fetch(bgFnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ queue_id: job.id, site_url: siteUrl, spec: specPayload }),
        });
        dispatched++;
        notes.push(`Dispatched generation for "${spec.title}" to background function.`);
      } else {
        // Local dev: generate synchronously (dynamic import keeps module load safe)
        const { generateArticle } = await import('./claude');
        const generated = await generateArticle(specPayload);

        let slug = spec.slug;
        const existingSlug = await prisma.cms_articles.findUnique({ where: { slug }, select: { id: true } });
        if (existingSlug) slug = `${spec.slug}-${Date.now()}`;

        const article = await prisma.cms_articles.create({
          data: {
            spec_id:          spec.id,
            cluster_id:       spec.cluster?.id,
            title:            spec.title,
            slug,
            meta_title:       spec.meta_title ?? spec.title,
            meta_description: spec.meta_description ?? '',
            primary_keyword:  spec.primary_keyword,
            article_type:     spec.article_type,
            content:          generated.content,
            excerpt:          generated.excerpt,
            word_count:       generated.word_count,
            status:           'draft',
            ai_generated:     true,
            ai_model:         generated.model,
            ai_prompt_tokens: generated.prompt_tokens,
            ai_output_tokens: generated.output_tokens,
          },
        });

        await prisma.cms_generation_queue.update({
          where: { id: job.id },
          data: { status: 'done', completed_at: new Date(), article_id: article.id },
        });
        dispatched++;
        notes.push(`Generated "${spec.title}" synchronously (local dev).`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Generation dispatch failed';
      await prisma.cms_generation_queue.update({
        where: { id: job.id },
        data: { status: 'failed', completed_at: new Date(), error: errorMsg },
      }).catch(() => {});
      notes.push(`Generation for "${spec.title}" failed: ${errorMsg}`);
    }
  }

  return dispatched;
}

// ── The run ──────────────────────────────────────────────────────────────────

export async function runSeoBrain(): Promise<SeoBrainSummary> {
  const startedAt = new Date();
  const notes: string[] = [];
  let partial = false;

  // 1. Dispatch any generation jobs that earlier runs queued and are now due
  let generationDispatched = 0;
  try {
    generationDispatched = await dispatchDueGenerationJobs(notes);
  } catch (err) {
    notes.push(`Queue dispatch failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. Gather signals
  let gscQueries: SearchAnalyticsRow[] = [];
  let gscPages: SearchAnalyticsRow[] = [];
  if (isGscConfigured()) {
    try {
      [gscQueries, gscPages] = await Promise.all([fetchTopQueries(28), fetchTopPages(28)]);
    } catch (err) {
      partial = true;
      notes.push(`GSC fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    partial = true;
    notes.push('Google Search Console not configured, skipped.');
  }

  let posthogPages: PageViewRow[] = [];
  if (isPostHogConfigured()) {
    try {
      posthogPages = await fetchTopPagesByViews(28);
    } catch (err) {
      partial = true;
      notes.push(`PostHog fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    partial = true;
    notes.push('PostHog not configured, skipped.');
  }

  const gscRows = gscQueries.length + gscPages.length;
  const posthogRows = posthogPages.length;

  // 3. Existing content inventory
  const [existingArticles, existingSpecs, clusters] = await Promise.all([
    prisma.cms_articles.findMany({ select: { slug: true, title: true, primary_keyword: true } }),
    prisma.cms_article_specs.findMany({ select: { id: true, slug: true, title: true, primary_keyword: true } }),
    prisma.cms_keyword_clusters.findMany({ select: { id: true, name: true, slug: true } }),
  ]);

  // 4. Claude analysis
  let analysis: SeoAnalysis = { opportunities: [], quick_wins: [] };
  let analysisError: string | undefined;
  try {
    analysis = await analyseWithClaude({
      gscQueries,
      gscPages,
      posthogPages,
      existingArticles,
      existingSpecs,
      clusters: clusters.map(c => ({ slug: c.slug, name: c.name })),
    });
  } catch (err) {
    analysisError = err instanceof Error ? err.message : String(err);
    notes.push(`Claude analysis failed: ${analysisError}`);
  }

  // 5. Dedupe against existing slugs AND primary keywords (case-insensitive)
  const takenSlugs = new Set<string>([
    ...existingArticles.map(a => a.slug.toLowerCase()),
    ...existingSpecs.map(s => s.slug.toLowerCase()),
  ]);
  const takenKeywords = new Set<string>([
    ...existingArticles.map(a => (a.primary_keyword ?? '').toLowerCase()).filter(Boolean),
    ...existingSpecs.map(s => s.primary_keyword.toLowerCase()),
  ]);

  const surviving: SeoOpportunity[] = [];
  for (const opp of analysis.opportunities) {
    if (takenSlugs.has(opp.slug.toLowerCase())) {
      notes.push(`Skipped "${opp.slug}": slug already exists.`);
      continue;
    }
    if (takenKeywords.has(opp.primary_keyword.toLowerCase())) {
      notes.push(`Skipped "${opp.slug}": primary keyword "${opp.primary_keyword}" already covered.`);
      continue;
    }
    takenSlugs.add(opp.slug.toLowerCase());
    takenKeywords.add(opp.primary_keyword.toLowerCase());
    surviving.push(opp);
  }

  // 6. Persist surviving opportunities as cms_article_specs
  const clusterBySlug = new Map(clusters.map(c => [c.slug.toLowerCase(), c.id]));
  const createdSpecIds: string[] = [];

  for (const opp of surviving) {
    const clusterId = clusterBySlug.get(opp.cluster_slug.toLowerCase());
    if (!clusterId) {
      notes.push(`Skipped "${opp.slug}": cluster "${opp.cluster_slug}" not found.`);
      continue;
    }
    try {
      const spec = await prisma.cms_article_specs.create({
        data: {
          cluster_id:         clusterId,
          article_type:       opp.article_type,
          title:              opp.title,
          slug:               opp.slug,
          primary_keyword:    opp.primary_keyword,
          secondary_keywords: opp.secondary_keywords,
          search_intent:      opp.search_intent,
          meta_title:         opp.meta_title,
          meta_description:   opp.meta_description,
          h2_structure:       opp.h2_structure,
          key_points:         opp.key_points,
          word_count_min:     opp.word_count_min,
          word_count_max:     opp.word_count_max,
          cta_text:           opp.cta_text,
          internal_links:     [],
        },
      });
      createdSpecIds.push(spec.id);
    } catch (err) {
      notes.push(`Failed to create spec "${opp.slug}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 7. Optionally auto-queue generation, staggered one per day
  let autoQueued = 0;
  if (process.env.AUTO_QUEUE_GENERATION === 'true' && createdSpecIds.length > 0) {
    for (let i = 0; i < createdSpecIds.length; i++) {
      const scheduledFor = new Date();
      scheduledFor.setUTCDate(scheduledFor.getUTCDate() + i + 1);
      scheduledFor.setUTCHours(6, 0, 0, 0);
      try {
        await prisma.cms_generation_queue.create({
          data: { spec_id: createdSpecIds[i], status: 'pending', scheduled_for: scheduledFor },
        });
        autoQueued++;
      } catch (err) {
        notes.push(`Failed to queue spec ${createdSpecIds[i]}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  // 8. Record the run
  const status: 'ok' | 'error' | 'partial' = analysisError ? 'error' : partial ? 'partial' : 'ok';
  const report = {
    opportunities: analysis.opportunities,
    quick_wins: analysis.quick_wins,
    skipped: analysis.opportunities.length - surviving.length,
    notes,
  };

  let runId: string | null = null;
  try {
    const run = await prisma.cms_seo_runs.create({
      data: {
        started_at:          startedAt,
        finished_at:         new Date(),
        status,
        gsc_rows:            gscRows,
        posthog_rows:        posthogRows,
        opportunities_found: analysis.opportunities.length,
        specs_created:       createdSpecIds.length,
        quick_wins:          analysis.quick_wins as unknown as Prisma.InputJsonValue,
        report:              report as unknown as Prisma.InputJsonValue,
        error:               analysisError ?? null,
      },
    });
    runId = run.id;
  } catch (err) {
    notes.push(`Failed to record run: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    run_id: runId,
    status,
    gsc_rows: gscRows,
    posthog_rows: posthogRows,
    opportunities_found: analysis.opportunities.length,
    specs_created: createdSpecIds.length,
    quick_wins_found: analysis.quick_wins.length,
    auto_queued: autoQueued,
    generation_dispatched: generationDispatched,
    notes,
    ...(analysisError ? { error: analysisError } : {}),
  };
}
