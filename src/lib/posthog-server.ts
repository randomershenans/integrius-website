// ─────────────────────────────────────────────────────────────────────────────
// PostHog server-side client: read-only analytics queries via the HogQL
// query API. Used by the SEO brain to see which pages actually get traffic.
//
// Required env vars:
//   POSTHOG_PERSONAL_API_KEY  personal API key with query:read scope
//   POSTHOG_PROJECT_ID        numeric project id
//   POSTHOG_API_HOST          optional, defaults to https://eu.posthog.com
// ─────────────────────────────────────────────────────────────────────────────

export interface PageViewRow {
  pathname: string;
  views: number;
}

export interface TrendPoint {
  day: string;     // YYYY-MM-DD
  views: number;
}

export function isPostHogConfigured(): boolean {
  return Boolean(
    process.env.POSTHOG_PERSONAL_API_KEY &&
    process.env.POSTHOG_PROJECT_ID,
  );
}

function apiHost(): string {
  return (process.env.POSTHOG_API_HOST || 'https://eu.posthog.com').replace(/\/$/, '');
}

/** Run a HogQL query and return raw result rows. */
async function runHogQL(query: string): Promise<unknown[][]> {
  if (!isPostHogConfigured()) {
    throw new Error(
      'PostHog is not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID.',
    );
  }

  const projectId = process.env.POSTHOG_PROJECT_ID as string;
  const res = await fetch(`${apiHost()}/api/projects/${projectId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `PostHog query failed (HTTP ${res.status}) at ${apiHost()}: ${body.slice(0, 500)}`,
    );
  }

  const data = await res.json() as { results?: unknown[][] };
  return data.results ?? [];
}

function clampDays(days: number): number {
  return Math.min(365, Math.max(1, Math.floor(days)));
}

/** Top pages by pageview count over the last N days. */
export async function fetchTopPagesByViews(days = 28, limit = 50): Promise<PageViewRow[]> {
  const d = clampDays(days);
  const rows = await runHogQL(
    `SELECT properties.$pathname AS pathname, count() AS views
     FROM events
     WHERE event = '$pageview' AND timestamp > now() - INTERVAL ${d} DAY
     GROUP BY properties.$pathname
     ORDER BY views DESC
     LIMIT ${Math.min(200, Math.max(1, Math.floor(limit)))}`,
  );

  return rows
    .filter(r => Array.isArray(r) && r.length >= 2)
    .map(r => ({
      pathname: String(r[0] ?? ''),
      views: Number(r[1] ?? 0),
    }));
}

/** Daily pageview totals over the last N days (oldest first). */
export async function fetchPageviewTrend(days = 28): Promise<TrendPoint[]> {
  const d = clampDays(days);
  const rows = await runHogQL(
    `SELECT toDate(timestamp) AS day, count() AS views
     FROM events
     WHERE event = '$pageview' AND timestamp > now() - INTERVAL ${d} DAY
     GROUP BY day
     ORDER BY day ASC`,
  );

  return rows
    .filter(r => Array.isArray(r) && r.length >= 2)
    .map(r => ({
      day: String(r[0] ?? ''),
      views: Number(r[1] ?? 0),
    }));
}
