'use client';

import { useCallback, useEffect, useState } from 'react';

interface QuickWin {
  page: string;
  query: string;
  impressions: number;
  ctr: number;
  position: number;
  suggested_action: string;
}

interface Opportunity {
  title: string;
  slug: string;
  primary_keyword: string;
  article_type: string;
  cluster_slug: string;
  rationale: string;
}

interface WrittenArticle {
  slug: string;
  title: string;
  path: string;
  word_count: number;
  validation_notes: string[];
}

interface PrResult {
  status: 'opened' | 'not_configured' | 'skipped' | 'failed';
  url?: string;
  number?: number;
  branch?: string;
  detail?: string;
}

interface RunReport {
  status: string;
  ran_at: string;
  gsc_rows: number;
  posthog_rows: number;
  opportunities_found: number;
  opportunities: Opportunity[];
  quick_wins: QuickWin[];
  articles_written: WrittenArticle[];
  pr: PrResult;
  notes: string[];
  error?: string;
}

interface SeoConfig {
  gsc_configured: boolean;
  posthog_configured: boolean;
  github_configured: boolean;
}

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PostHogRow {
  pathname: string;
  views: number;
}

interface SeoPr {
  number: number;
  title: string;
  html_url: string;
  head_branch: string;
  created_at: string;
}

function ConfigChip({ label, on, onText, offText }: { label: string; on: boolean; onText: string; offText: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
      on
        ? 'bg-green-500/15 text-green-400 border-green-500/30'
        : 'bg-white/5 text-white/40 border-white/10'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-green-400' : 'bg-white/30'}`} />
      {label}: {on ? onText : offText}
    </span>
  );
}

function RunStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ok:      'bg-green-500/15 text-green-400 border-green-500/30',
    partial: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    error:   'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${styles[status] ?? styles.partial}`}>
      {status}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default function SeoPage() {
  const [config, setConfig] = useState<SeoConfig | null>(null);
  const [gsc, setGsc] = useState<{ configured: boolean; rows: GscRow[]; error?: string } | null>(null);
  const [posthog, setPosthog] = useState<{ configured: boolean; rows: PostHogRow[]; error?: string } | null>(null);
  const [prs, setPrs] = useState<{ configured: boolean; prs: SeoPr[]; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<RunReport | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfgRes, gscRes, phRes, prsRes] = await Promise.all([
        fetch('/api/admin/seo'),
        fetch('/api/admin/seo/gsc'),
        fetch('/api/admin/seo/posthog'),
        fetch('/api/admin/seo/prs'),
      ]);
      if (cfgRes.ok) {
        const data = await cfgRes.json() as { config: SeoConfig };
        setConfig(data.config);
      }
      setGsc(await gscRes.json().catch(() => null) as { configured: boolean; rows: GscRow[]; error?: string } | null);
      setPosthog(await phRes.json().catch(() => null) as { configured: boolean; rows: PostHogRow[]; error?: string } | null);
      setPrs(await prsRes.json().catch(() => null) as { configured: boolean; prs: SeoPr[]; error?: string } | null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function runNow() {
    setRunning(true);
    setReport(null);
    setRunError(null);
    try {
      const res = await fetch('/api/admin/seo/run', { method: 'POST' });
      const data = await res.json() as RunReport & { error?: string };
      if (res.ok) {
        setReport(data);
      } else {
        setRunError(`Run failed: ${data.error ?? res.statusText}`);
      }
      await load();
    } catch (err) {
      setRunError(`Run failed: ${err instanceof Error ? err.message : 'network error'}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Brain</h1>
          <p className="text-sm text-white/40 mt-1">
            Agentic SEO engine: Search Console + PostHog signals, analysed daily by Claude. New articles arrive as GitHub PRs; merging publishes them.
          </p>
        </div>
        <button
          onClick={() => void runNow()}
          disabled={running}
          className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? 'Running (can take a few minutes)...' : 'Run SEO brain now'}
        </button>
      </div>

      {runError && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">
          {runError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : (
        <>
          {/* Config status */}
          <div className="flex flex-wrap gap-2 mb-8">
            <ConfigChip label="Search Console" on={config?.gsc_configured ?? false} onText="connected" offText="not configured" />
            <ConfigChip label="PostHog" on={config?.posthog_configured ?? false} onText="connected" offText="not configured" />
            <ConfigChip label="GitHub" on={config?.github_configured ?? false} onText="connected" offText="not configured" />
          </div>

          {/* Inline run report */}
          {report && (
            <div className="mb-8 bg-black/40 rounded-xl border border-[#00B8D4]/30 px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-white">Run report</h2>
                <RunStatusBadge status={report.status} />
                <span className="text-xs text-white/40">
                  {fmtDate(report.ran_at)} &middot; {report.gsc_rows} GSC rows &middot; {report.posthog_rows} PostHog rows
                </span>
              </div>

              {/* PR */}
              <div className="mb-4 text-sm">
                {report.pr.status === 'opened' ? (
                  <a href={report.pr.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#00B8D4] hover:underline font-medium">
                    Pull request #{report.pr.number} opened on {report.pr.branch} &rarr;
                  </a>
                ) : (
                  <span className="text-white/50">
                    PR: {report.pr.status.replace('_', ' ')}{report.pr.detail ? ` (${report.pr.detail})` : ''}
                  </span>
                )}
              </div>

              {/* Articles written */}
              {report.articles_written.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Articles written ({report.articles_written.length})</h3>
                  <div className="grid gap-2">
                    {report.articles_written.map(a => (
                      <div key={a.slug} className="bg-white/5 rounded-lg px-4 py-2.5 text-sm">
                        <span className="text-white/90 font-medium">{a.title}</span>
                        <span className="text-white/40 ml-2">{a.path} &middot; {a.word_count} words</span>
                        {a.validation_notes.length > 0 && (
                          <p className="text-xs text-yellow-400/80 mt-1">{a.validation_notes.join(' ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {report.opportunities.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Opportunities ({report.opportunities.length})</h3>
                  <div className="grid gap-2">
                    {report.opportunities.map(o => (
                      <div key={o.slug} className="bg-white/5 rounded-lg px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/90">{o.title}</span>
                          <span className="text-xs text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">{o.article_type}</span>
                          <span className="text-xs text-white/40">{o.cluster_slug}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5">/{o.slug} &middot; keyword: {o.primary_keyword}</p>
                        {o.rationale && <p className="text-xs text-white/60 mt-1">{o.rationale}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick wins */}
              {report.quick_wins.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Quick wins ({report.quick_wins.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-white/40 border-b border-white/10">
                          <th className="px-3 py-2 font-medium">Query</th>
                          <th className="px-3 py-2 font-medium">Page</th>
                          <th className="px-3 py-2 font-medium text-right">Impr.</th>
                          <th className="px-3 py-2 font-medium text-right">CTR</th>
                          <th className="px-3 py-2 font-medium text-right">Pos.</th>
                          <th className="px-3 py-2 font-medium">Suggested action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {report.quick_wins.map((w, i) => (
                          <tr key={`${w.query}-${i}`}>
                            <td className="px-3 py-2 text-white/80">{w.query}</td>
                            <td className="px-3 py-2 text-white/50 max-w-[180px] truncate">{w.page || '-'}</td>
                            <td className="px-3 py-2 text-right text-white/60">{w.impressions.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right text-white/60">{(w.ctr * 100).toFixed(1)}%</td>
                            <td className="px-3 py-2 text-right text-white/60">{w.position.toFixed(1)}</td>
                            <td className="px-3 py-2 text-white/60">{w.suggested_action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {report.notes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/70 mb-2">Notes</h3>
                  <ul className="text-xs text-white/50 space-y-1 list-disc list-inside">
                    {report.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Open seo-brain PRs */}
          <h2 className="text-lg font-semibold text-white mb-3">Open content PRs</h2>
          <div className="mb-8 bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
            {!prs?.configured ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">
                GitHub is not configured. Set GITHUB_TOKEN and GITHUB_REPO to open and list content PRs.
              </p>
            ) : prs.error ? (
              <p className="px-6 py-10 text-center text-red-400/70 text-sm">{prs.error}</p>
            ) : prs.prs.length === 0 ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">No open seo-brain PRs. Merging a PR publishes its articles.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="px-6 py-3 font-medium">PR</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-6 py-3 font-medium text-right">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {prs.prs.map(pr => (
                    <tr key={pr.number}>
                      <td className="px-6 py-3">
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-[#00B8D4] hover:underline">
                          #{pr.number} {pr.title}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-white/50">{pr.head_branch}</td>
                      <td className="px-6 py-3 text-right text-white/60">{pr.created_at ? fmtDate(pr.created_at) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Live GSC top queries */}
          <h2 className="text-lg font-semibold text-white mb-3">Search Console top queries (28 days)</h2>
          <div className="mb-8 bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
            {!gsc?.configured ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">
                Search Console is not configured. Set GSC_CLIENT_EMAIL, GSC_PRIVATE_KEY and GSC_SITE_URL.
              </p>
            ) : gsc.error ? (
              <p className="px-6 py-10 text-center text-red-400/70 text-sm">{gsc.error}</p>
            ) : gsc.rows.length === 0 ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">No query data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="px-6 py-3 font-medium">Query</th>
                    <th className="px-4 py-3 font-medium text-right">Clicks</th>
                    <th className="px-4 py-3 font-medium text-right">Impressions</th>
                    <th className="px-4 py-3 font-medium text-right">CTR</th>
                    <th className="px-6 py-3 font-medium text-right">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {gsc.rows.map((r, i) => (
                    <tr key={`${r.keys.join('-')}-${i}`}>
                      <td className="px-6 py-3 text-white/80">{r.keys.join(' / ')}</td>
                      <td className="px-4 py-3 text-right text-white/60">{r.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-white/60">{r.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-white/60">{(r.ctr * 100).toFixed(1)}%</td>
                      <td className="px-6 py-3 text-right text-white/60">{r.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Live PostHog top pages */}
          <h2 className="text-lg font-semibold text-white mb-3">PostHog top pages (28 days)</h2>
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
            {!posthog?.configured ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">
                PostHog is not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID.
              </p>
            ) : posthog.error ? (
              <p className="px-6 py-10 text-center text-red-400/70 text-sm">{posthog.error}</p>
            ) : posthog.rows.length === 0 ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">No pageview data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="px-6 py-3 font-medium">Page</th>
                    <th className="px-6 py-3 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {posthog.rows.map((r, i) => (
                    <tr key={`${r.pathname}-${i}`}>
                      <td className="px-6 py-3 text-white/80">{r.pathname}</td>
                      <td className="px-6 py-3 text-right text-white/60">{r.views.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
