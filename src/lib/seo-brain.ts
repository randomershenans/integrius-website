// ─────────────────────────────────────────────────────────────────────────────
// The SEO brain: agentic SEO engine for the Integrius marketing site.
//
// The blog is git-native: markdown files in content/blog/, statically built,
// published by merging a PR. One run:
//   1. GATHER:  GSC top queries + pages, PostHog top pages, and the existing
//               content inventory from src/lib/content.ts (no database).
//   2. ANALYZE: one Claude call returns new article opportunities + quick
//               wins, deduped against existing slugs and primary keywords.
//   3. WRITE:   up to SEO_BRAIN_MAX_ARTICLES (default 2) opportunities get a
//               second Claude call each, producing a complete markdown file
//               that follows the house contract (content/blog/README.md).
//   4. PR:      src/lib/github-content.ts opens a branch seo-brain/{date},
//               commits one file per article under content/blog/, and opens
//               a PR carrying the full run report. A human merges; Netlify
//               rebuilds the static site. Publishing is the merge.
//   5. REPORT:  the whole run returns as JSON. No DB writes anywhere.
//
// Never throws unhandled: partial data is fine, everything lands in the report.
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import { CircuitBreaker } from './circuit-breaker';
import { isGscConfigured, fetchTopQueries, fetchTopPages, type SearchAnalyticsRow } from './gsc';
import { isPostHogConfigured, fetchTopPagesByViews, type PageViewRow } from './posthog-server';
import { getAllArticles, clusters, type Cluster } from './content';
import {
  isGitHubConfigured,
  getBranchSha,
  createUniqueBranch,
  createFileOnBranch,
  openPullRequest,
} from './github-content';

const MODEL = 'claude-sonnet-4-20250514';
const ANALYSIS_TIMEOUT_MS = 60_000;
const ARTICLE_TIMEOUT_MS = 180_000;
const DEFAULT_MAX_ARTICLES = 2;

const seoBreaker = new CircuitBreaker('Claude API (SEO brain)');

// ── Types ────────────────────────────────────────────────────────────────────

export interface SeoOpportunity {
  title: string;
  slug: string;
  primary_keyword: string;
  secondary_keywords: string[];
  article_type: 'faq' | 'pillar';
  cluster_slug: string;
  meta_title: string;
  meta_description: string;
  h2_structure: string[];
  key_points: string[];
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

export interface WrittenArticle {
  slug: string;
  title: string;
  path: string;          // content/blog/<slug>.md
  word_count: number;
  rationale: string;
  validation_notes: string[];
}

export interface PrResult {
  status: 'opened' | 'not_configured' | 'skipped' | 'failed';
  url?: string;
  number?: number;
  branch?: string;
  detail?: string;
}

export interface SeoBrainReport {
  status: 'ok' | 'partial' | 'error';
  ran_at: string;
  gsc_rows: number;
  posthog_rows: number;
  opportunities_found: number;
  opportunities: SeoOpportunity[];     // post-dedupe survivors
  quick_wins: QuickWin[];
  articles_written: WrittenArticle[];
  pr: PrResult;
  notes: string[];
  error?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** House rule: no em dashes in any copy. Same replacement as src/lib/claude.ts. */
export function stripEmDashes(text: string): string {
  return text.replace(/—/g, ',').replace(/--/g, ',');
}

/**
 * Dash sweep for full markdown documents. Unlike stripEmDashes this must NOT
 * touch "--" sequences, which are load-bearing in markdown (frontmatter
 * delimiters, GFM table rules). Em dashes become commas, en dashes hyphens.
 */
function stripDashesFromMarkdown(text: string): string {
  return text.replace(/ ?— ?/g, ', ').replace(/–/g, '-');
}

function sanitiseSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[–—]/g, '-')
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

function maxArticlesPerRun(): number {
  const raw = Number.parseInt(process.env.SEO_BRAIN_MAX_ARTICLES ?? '', 10);
  if (Number.isNaN(raw)) return DEFAULT_MAX_ARTICLES;
  return Math.min(5, Math.max(0, raw));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function callClaude(prompt: string, maxTokens: number, timeoutMs: number): Promise<string> {
  const client = getAnthropicClient();
  const response = await seoBreaker.execute(() =>
    withTimeout(
      client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
      timeoutMs,
    ),
  );
  return response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');
}

// ── Claude analysis ──────────────────────────────────────────────────────────

interface AnalysisInput {
  gscQueries: SearchAnalyticsRow[];
  gscPages: SearchAnalyticsRow[];
  posthogPages: PageViewRow[];
  existingArticles: Array<{ slug: string; title: string; primary_keyword: string }>;
  clusters: Cluster[];
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

EXISTING PUBLISHED ARTICLES (do NOT duplicate these topics):
${input.existingArticles.map(a => `- ${a.slug} | "${a.title}" | keyword: ${a.primary_keyword || 'n/a'}`).join('\n') || '(none)'}

KEYWORD CLUSTERS (every opportunity MUST use one of these cluster_slug values):
${input.clusters.map(c => `- ${c.slug} (${c.name}: ${c.description})`).join('\n') || '(none)'}

TASK 1, "opportunities": up to 5 NEW article opportunities not already covered by the existing articles above. Each object must have:
- title: string
- slug: kebab-case string
- primary_keyword: string
- secondary_keywords: string[] (3-6 items)
- article_type: "faq" or "pillar"
- cluster_slug: one of the cluster slugs listed above
- meta_title: string, 60 characters maximum
- meta_description: string, 155 characters maximum
- h2_structure: string[] (5-8 H2 headings, in order)
- key_points: string[] (4-8 bullets the article must cover)
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

    opportunities.push({
      title,
      slug,
      primary_keyword: primaryKeyword,
      secondary_keywords: asStringArray(r.secondary_keywords).map(s => stripEmDashes(s).trim()).filter(Boolean),
      article_type: asString(r.article_type) === 'faq' ? 'faq' : 'pillar',
      cluster_slug: clusterSlug,
      meta_title: stripEmDashes(asString(r.meta_title, title)).trim().slice(0, 60),
      meta_description: stripEmDashes(asString(r.meta_description)).trim().slice(0, 155),
      h2_structure: asStringArray(r.h2_structure).map(s => stripEmDashes(s).trim()).filter(Boolean),
      key_points: asStringArray(r.key_points).map(s => stripEmDashes(s).trim()).filter(Boolean),
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

async function analyseWithClaude(input: AnalysisInput): Promise<SeoAnalysis> {
  const text = await callClaude(buildAnalysisPrompt(input), 4096, ANALYSIS_TIMEOUT_MS);
  return parseAnalysis(text);
}

// ── Article writing ──────────────────────────────────────────────────────────

const PRODUCT_PAGES = ['/products/core', '/products/optic', '/technical-brief'];

function buildArticlePrompt(opp: SeoOpportunity, cluster: Cluster, validSlugs: string[]): string {
  return `You are the content writer for integri.us, the marketing site of Integrius, a self-hosted governed data layer and data products platform (field-level access control, approval workflows, end-to-end lineage, tamper-evident HMAC-chained audit log, 16 source connectors, priced per governed data product, Docker/Helm deployment, air-gap capable). The audience is CDOs, VPs of Data, data engineers and data architects.

Write the COMPLETE markdown file for a new blog article. Output the raw file content only: YAML frontmatter between --- delimiters, then the body. No commentary, no code fences around the output.

ARTICLE BRIEF:
- Title: ${opp.title}
- Slug: ${opp.slug}
- Primary keyword: ${opp.primary_keyword}
- Secondary keywords: ${opp.secondary_keywords.join(', ') || '(none)'}
- Article type: ${opp.article_type}
- Cluster: ${cluster.slug} (${cluster.name}: ${cluster.description})
- Meta title: ${opp.meta_title}
- Meta description: ${opp.meta_description}
- H2 structure (use these headings, in order): ${opp.h2_structure.length > 0 ? '\n' + opp.h2_structure.map(h => `  - ${h}`).join('\n') : '(your choice, 5-8 H2s)'}
- Key points to cover: ${opp.key_points.length > 0 ? '\n' + opp.key_points.map(k => `  - ${k}`).join('\n') : '(your judgement)'}
- Why this article: ${opp.rationale || '(n/a)'}

FRONTMATTER (exactly these keys, in this order):
title: ${opp.title}
slug: ${opp.slug}
meta_title: ${opp.meta_title}
meta_description: ${opp.meta_description}
excerpt: (write a 1-2 sentence summary for the listing card)
primary_keyword: ${opp.primary_keyword}
article_type: ${opp.article_type}
cluster_slug: ${cluster.slug}
published: ${todayIso()}
ai_assisted: true

BODY RULES (house contract):
- The body starts at an H2 (##). NEVER write an H1 (a single #): the page renders the title as the H1.
- ${opp.article_type === 'faq' ? 'This is an FAQ article: every ## heading must be a question (FAQ structured data is auto-extracted from them).' : 'This is a pillar article: substantial, well-structured, practitioner-level.'}
- 1500 to 2500 words.
- British spelling throughout.
- NO em dashes and NO en dashes anywhere. Use commas, colons, full stops or hyphens.
- GFM tables are welcome where they aid comparison.
- Internal links: ONLY link to /blog/<slug> URLs from this list of existing articles (link 2-4 of them naturally where relevant):
${validSlugs.map(s => `  - /blog/${s}`).join('\n')}
  You may also link these product pages: ${PRODUCT_PAGES.join(', ')}.
  Do NOT link any other internal URL and do NOT invent blog slugs.
- Be honest and specific about what Integrius does and does not do. No invented benchmarks, customer names or statistics.
- End with a short closing call to action paragraph that links to /contact, e.g. "[Talk to us](/contact)."`;
}

interface ParsedFile {
  meta: Record<string, string>;
  body: string;
}

/** Parse frontmatter + body the same way src/lib/content.ts does. */
function parseGeneratedFile(raw: string): ParsedFile | null {
  let text = raw.trim();
  // Strip accidental code fences around the whole output
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\r?\n/, '').replace(/\r?\n```\s*$/, '').trim();
  }

  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return null;
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end === -1) return null;

  const meta: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const idx = lines[i].indexOf(':');
    if (idx === -1) continue;
    let value = lines[i].slice(idx + 1).trim();
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1);
    }
    meta[lines[i].slice(0, idx).trim()] = value;
  }

  const body = lines.slice(end + 1).join('\n').trim();
  if (!body) return null;
  return { meta, body };
}

/** Emit a frontmatter value content.ts can parse back (its parser splits on the first colon). */
function yamlValue(value: string): string {
  const clean = value.replace(/\s+/g, ' ').replace(/^['"]+|['"]+$/g, '').trim();
  // Quote when the value contains a colon, to match the house exemplar style.
  if (clean.includes(':') && !clean.includes("'")) return `'${clean}'`;
  return clean;
}

interface ValidatedArticle {
  fileContent: string;
  wordCount: number;
  validationNotes: string[];
}

/**
 * Validate and sanitise a generated article against the house contract:
 * frontmatter parses, required fields present, no em/en dashes, no H1, no
 * dead /blog/ links (unknown links are unwrapped to plain text). The
 * frontmatter is rebuilt deterministically from the opportunity so required
 * fields and constraints are guaranteed.
 */
function validateArticle(
  raw: string,
  opp: SeoOpportunity,
  validSlugs: Set<string>,
): ValidatedArticle {
  const parsed = parseGeneratedFile(raw);
  if (!parsed) {
    throw new Error('Generated article did not parse as frontmatter + body.');
  }

  const notes: string[] = [];
  let body = stripDashesFromMarkdown(parsed.body);

  // No H1: demote any to H2
  if (/^#[^#]/m.test(body)) {
    body = body.replace(/^#(?=[^#])/gm, '##');
    notes.push('Demoted H1 heading(s) to H2.');
  }

  // Body must start at an H2
  if (!body.trimStart().startsWith('##')) {
    notes.push('Body does not start with an H2 heading.');
  }

  // Internal links: unwrap unknown /blog/ slugs to plain text
  let unwrapped = 0;
  body = body.replace(
    /\[([^\]]+)\]\(\/blog\/([a-zA-Z0-9-]+)\/?(?:#[^)]*)?\)/g,
    (match, text: string, slug: string) => {
      if (validSlugs.has(slug.toLowerCase())) return match;
      unwrapped++;
      return text;
    },
  );
  if (unwrapped > 0) notes.push(`Unwrapped ${unwrapped} link(s) to unknown /blog/ slugs.`);

  const wordCount = body.split(/\s+/).filter(Boolean).length;
  if (wordCount < 1500 || wordCount > 2500) {
    notes.push(`Word count ${wordCount} is outside the 1500-2500 target.`);
  }

  if (!/\(\/contact\)/.test(body)) {
    notes.push('No /contact CTA link found in the body.');
  }

  // Rebuild frontmatter deterministically: required fields guaranteed.
  const excerpt = stripEmDashes(parsed.meta.excerpt || opp.meta_description).trim();
  const fm = [
    '---',
    `title: ${yamlValue(opp.title)}`,
    `slug: ${opp.slug}`,
    `meta_title: ${yamlValue(opp.meta_title)}`,
    `meta_description: ${yamlValue(opp.meta_description)}`,
    `excerpt: ${yamlValue(excerpt)}`,
    `primary_keyword: ${yamlValue(opp.primary_keyword)}`,
    `article_type: ${opp.article_type}`,
    `cluster_slug: ${opp.cluster_slug}`,
    `published: ${todayIso()}`,
    'ai_assisted: true',
    '---',
  ].join('\n');

  return {
    fileContent: `${fm}\n\n${body}\n`,
    wordCount,
    validationNotes: notes,
  };
}

async function writeArticle(
  opp: SeoOpportunity,
  cluster: Cluster,
  validSlugs: Set<string>,
): Promise<ValidatedArticle> {
  const raw = await callClaude(
    buildArticlePrompt(opp, cluster, [...validSlugs]),
    8192,
    ARTICLE_TIMEOUT_MS,
  );
  return validateArticle(raw, opp, validSlugs);
}

// ── PR body ──────────────────────────────────────────────────────────────────

function buildPrBody(
  gscQueries: SearchAnalyticsRow[],
  posthogPages: PageViewRow[],
  written: Array<{ article: WrittenArticle; opp: SeoOpportunity }>,
  remaining: SeoOpportunity[],
  quickWins: QuickWin[],
  notes: string[],
): string {
  const lines: string[] = [];

  lines.push(`Automated run of the SEO brain (${todayIso()}). Each article below is a new markdown file under \`content/blog/\`. Merging this PR publishes them: Netlify rebuilds the static site from master.`);
  lines.push('');

  lines.push('## Signals used');
  lines.push('');
  if (gscQueries.length > 0) {
    lines.push('Top Search Console queries (28 days):');
    lines.push('');
    lines.push('| Query | Clicks | Impressions | CTR | Position |');
    lines.push('| --- | ---: | ---: | ---: | ---: |');
    for (const r of gscQueries.slice(0, 10)) {
      lines.push(`| ${r.keys.join(' / ')} | ${r.clicks} | ${r.impressions} | ${(r.ctr * 100).toFixed(1)}% | ${r.position.toFixed(1)} |`);
    }
  } else {
    lines.push('No Search Console data was available for this run.');
  }
  lines.push('');
  if (posthogPages.length > 0) {
    lines.push('Top PostHog pages (28 days): ' + posthogPages.slice(0, 8).map(p => `\`${p.pathname}\` (${p.views})`).join(', '));
    lines.push('');
  }

  lines.push('## Articles in this PR');
  lines.push('');
  for (const { article, opp } of written) {
    lines.push(`### ${article.title}`);
    lines.push('');
    lines.push(`- File: \`${article.path}\``);
    lines.push(`- Keyword: ${opp.primary_keyword} (type: ${opp.article_type}, cluster: ${opp.cluster_slug})`);
    lines.push(`- Word count: ${article.word_count}`);
    lines.push(`- Rationale: ${opp.rationale || 'n/a'}`);
    if (article.validation_notes.length > 0) {
      lines.push(`- Validation notes: ${article.validation_notes.join(' ')}`);
    }
    lines.push('');
  }

  if (remaining.length > 0) {
    lines.push('## Opportunities identified but not written this run');
    lines.push('');
    for (const opp of remaining) {
      lines.push(`- **${opp.title}** (\`${opp.slug}\`, keyword: ${opp.primary_keyword}): ${opp.rationale || 'n/a'}`);
    }
    lines.push('');
  }

  if (quickWins.length > 0) {
    lines.push('## Quick wins (manual follow-up, no file changes here)');
    lines.push('');
    lines.push('| Query | Page | Impressions | CTR | Position | Suggested action |');
    lines.push('| --- | --- | ---: | ---: | ---: | --- |');
    for (const w of quickWins.slice(0, 10)) {
      lines.push(`| ${w.query} | ${w.page || '-'} | ${w.impressions} | ${(w.ctr * 100).toFixed(1)}% | ${w.position.toFixed(1)} | ${w.suggested_action} |`);
    }
    lines.push('');
  }

  if (notes.length > 0) {
    lines.push('## Run notes');
    lines.push('');
    for (const n of notes) lines.push(`- ${n}`);
    lines.push('');
  }

  lines.push('## Review checklist');
  lines.push('');
  lines.push('- [ ] Product claims and facts are accurate (no invented benchmarks or customers)');
  lines.push('- [ ] No em or en dashes in the copy');
  lines.push('- [ ] Body starts at H2, no H1 heading');
  lines.push('- [ ] Internal links resolve (existing /blog/ slugs and product pages only)');
  lines.push('- [ ] Meta title is 60 characters or fewer, meta description 155 or fewer');
  lines.push('- [ ] British spelling, reads naturally');
  lines.push('- [ ] Closing CTA links to /contact');

  return lines.join('\n');
}

// ── The run ──────────────────────────────────────────────────────────────────

export async function runSeoBrain(): Promise<SeoBrainReport> {
  const notes: string[] = [];
  let partial = false;

  // 1. GATHER: signals
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

  // 1b. GATHER: existing content inventory from the git-native content layer
  let existingArticles: Array<{ slug: string; title: string; primary_keyword: string }> = [];
  try {
    existingArticles = getAllArticles().map(a => ({
      slug: a.slug,
      title: a.title,
      primary_keyword: a.primary_keyword,
    }));
  } catch (err) {
    partial = true;
    notes.push(`Could not read existing articles: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 2. ANALYZE
  let analysis: SeoAnalysis = { opportunities: [], quick_wins: [] };
  let analysisError: string | undefined;
  try {
    analysis = await analyseWithClaude({
      gscQueries,
      gscPages,
      posthogPages,
      existingArticles,
      clusters,
    });
  } catch (err) {
    analysisError = err instanceof Error ? err.message : String(err);
    notes.push(`Claude analysis failed: ${analysisError}`);
  }

  // 2b. Dedupe against existing slugs AND primary keywords (case-insensitive),
  // and drop opportunities pointing at unknown clusters.
  const validSlugs = new Set(existingArticles.map(a => a.slug.toLowerCase()));
  const takenSlugs = new Set(validSlugs);
  const takenKeywords = new Set(
    existingArticles.map(a => a.primary_keyword.toLowerCase()).filter(Boolean),
  );
  const clusterSlugs = new Set(clusters.map(c => c.slug.toLowerCase()));

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
    if (!clusterSlugs.has(opp.cluster_slug.toLowerCase())) {
      notes.push(`Skipped "${opp.slug}": cluster "${opp.cluster_slug}" does not exist.`);
      continue;
    }
    takenSlugs.add(opp.slug.toLowerCase());
    takenKeywords.add(opp.primary_keyword.toLowerCase());
    surviving.push(opp);
  }

  // 3. WRITE: up to SEO_BRAIN_MAX_ARTICLES complete articles
  const maxArticles = maxArticlesPerRun();
  const written: Array<{ article: WrittenArticle; opp: SeoOpportunity; fileContent: string }> = [];

  for (const opp of surviving.slice(0, maxArticles)) {
    const cluster = clusters.find(c => c.slug.toLowerCase() === opp.cluster_slug.toLowerCase());
    if (!cluster) continue; // already filtered above, defensive
    try {
      const result = await writeArticle(opp, cluster, validSlugs);
      written.push({
        opp,
        fileContent: result.fileContent,
        article: {
          slug: opp.slug,
          title: opp.title,
          path: `content/blog/${opp.slug}.md`,
          word_count: result.wordCount,
          rationale: opp.rationale,
          validation_notes: result.validationNotes,
        },
      });
    } catch (err) {
      partial = true;
      notes.push(`Failed to write "${opp.slug}": ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // 4. OPEN PR with one commit per article file
  const remaining = surviving.filter(o => !written.some(w => w.opp.slug === o.slug));
  let pr: PrResult;

  if (written.length === 0) {
    pr = { status: 'skipped', detail: 'No articles were written this run, so no PR was opened.' };
  } else if (!isGitHubConfigured()) {
    pr = { status: 'not_configured', detail: 'GITHUB_TOKEN / GITHUB_REPO are not set; articles were generated but not pushed.' };
    notes.push('pr: not configured (set GITHUB_TOKEN and GITHUB_REPO to open content PRs).');
  } else {
    try {
      const baseSha = await getBranchSha();
      const branch = await createUniqueBranch(`seo-brain/${todayIso()}`, baseSha);

      for (const w of written) {
        await createFileOnBranch(
          w.article.path,
          w.fileContent,
          branch,
          `seo-brain: add ${w.article.slug}`,
        );
      }

      const title = `seo-brain: ${written.length} article(s), ${todayIso()}`;
      const body = buildPrBody(
        gscQueries,
        posthogPages,
        written.map(w => ({ article: w.article, opp: w.opp })),
        remaining,
        analysis.quick_wins,
        notes,
      );
      const opened = await openPullRequest(branch, title, body);
      pr = { status: 'opened', url: opened.url, number: opened.number, branch };
    } catch (err) {
      partial = true;
      const detail = err instanceof Error ? err.message : String(err);
      pr = { status: 'failed', detail };
      notes.push(`PR creation failed: ${detail}`);
    }
  }

  // 5. REPORT
  const status: 'ok' | 'partial' | 'error' = analysisError ? 'error' : partial ? 'partial' : 'ok';

  return {
    status,
    ran_at: new Date().toISOString(),
    gsc_rows: gscQueries.length + gscPages.length,
    posthog_rows: posthogPages.length,
    opportunities_found: analysis.opportunities.length,
    opportunities: surviving,
    quick_wins: analysis.quick_wins,
    articles_written: written.map(w => w.article),
    pr,
    notes,
    ...(analysisError ? { error: analysisError } : {}),
  };
}
