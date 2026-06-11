// ─────────────────────────────────────────────────────────────────────────────
// Google Search Console client: service-account auth without googleapis.
//
// Builds an RS256-signed JWT with jose, exchanges it at the Google OAuth token
// endpoint for an access token (cached in module scope until expiry), then
// calls the Search Analytics API directly via fetch.
//
// Required env vars:
//   GSC_CLIENT_EMAIL  service account email (xxx@yyy.iam.gserviceaccount.com)
//   GSC_PRIVATE_KEY   PEM private key (newlines may be escaped as \n)
//   GSC_SITE_URL      property, e.g. "sc-domain:integri.us" or "https://integri.us/"
// ─────────────────────────────────────────────────────────────────────────────

import { SignJWT, importPKCS8 } from 'jose';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';

export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchAnalyticsQuery {
  startDate: string;            // YYYY-MM-DD
  endDate: string;              // YYYY-MM-DD
  dimensions?: string[];        // e.g. ['query'] or ['page']
  rowLimit?: number;            // default 50
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;            // epoch ms
}

let cachedToken: CachedToken | null = null;

export function isGscConfigured(): boolean {
  return Boolean(
    process.env.GSC_CLIENT_EMAIL &&
    process.env.GSC_PRIVATE_KEY &&
    process.env.GSC_SITE_URL,
  );
}

/** Normalise a PEM key that may have literal \n escapes (common in env vars). */
function normalisePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n').trim();
}

async function getAccessToken(): Promise<string> {
  if (!isGscConfigured()) {
    throw new Error(
      'Google Search Console is not configured. Set GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY and GSC_SITE_URL.',
    );
  }

  // Reuse a cached token with a 60s safety margin
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
    return cachedToken.accessToken;
  }

  const clientEmail = process.env.GSC_CLIENT_EMAIL as string;
  const pem = normalisePrivateKey(process.env.GSC_PRIVATE_KEY as string);

  let privateKey;
  try {
    privateKey = await importPKCS8(pem, 'RS256');
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `GSC_PRIVATE_KEY could not be parsed as a PKCS8 PEM key. Check the value (newlines may need to be escaped as \\n). Detail: ${detail}`,
    );
  }

  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(clientEmail)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Google OAuth token exchange failed (HTTP ${res.status}). Check that the service account key is valid and the Search Console API is enabled. Response: ${body.slice(0, 500)}`,
    );
  }

  const data = await res.json() as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    throw new Error('Google OAuth token exchange returned no access_token.');
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.accessToken;
}

/** Run a Search Analytics query against the configured GSC property. */
export async function fetchSearchAnalytics(query: SearchAnalyticsQuery): Promise<SearchAnalyticsRow[]> {
  const token = await getAccessToken();
  const siteUrl = process.env.GSC_SITE_URL as string;
  const endpoint = `${API_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: query.startDate,
      endDate: query.endDate,
      dimensions: query.dimensions ?? ['query'],
      rowLimit: query.rowLimit ?? 50,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 403) {
      throw new Error(
        `Search Console returned 403 for ${siteUrl}. Add the service account email (${process.env.GSC_CLIENT_EMAIL}) as a user on the property in Search Console. Response: ${body.slice(0, 300)}`,
      );
    }
    throw new Error(
      `Search Console query failed (HTTP ${res.status}) for ${siteUrl}: ${body.slice(0, 500)}`,
    );
  }

  const data = await res.json() as {
    rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }>;
  };

  return (data.rows ?? []).map(r => ({
    keys: r.keys ?? [],
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }));
}

/** YYYY-MM-DD range ending 2 days ago (GSC data lags by roughly 2 days). */
function dateRange(days: number): { startDate: string; endDate: string } {
  const safeDays = Math.max(1, Math.floor(days));
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - safeDays);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/** Top search queries over the last N days (clicks, impressions, CTR, position). */
export async function fetchTopQueries(days = 28, rowLimit = 50): Promise<SearchAnalyticsRow[]> {
  const { startDate, endDate } = dateRange(days);
  return fetchSearchAnalytics({ startDate, endDate, dimensions: ['query'], rowLimit });
}

/** Top pages over the last N days (clicks, impressions, CTR, position). */
export async function fetchTopPages(days = 28, rowLimit = 50): Promise<SearchAnalyticsRow[]> {
  const { startDate, endDate } = dateRange(days);
  return fetchSearchAnalytics({ startDate, endDate, dimensions: ['page'], rowLimit });
}
