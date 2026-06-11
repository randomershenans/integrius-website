'use client';

import { useCallback, useEffect, useState } from 'react';

interface SeoRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  gsc_rows: number;
  posthog_rows: number;
  opportunities_found: number;
  specs_created: number;
  error: string | null;
}

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

interface LatestRun {
  id: string;
  started_at: string;
  status: string;
  quick_wins: QuickWin[];
  report: { opportunities?: Opportunity[]; notes?: string[] } | null;
}

interface SeoOverview {
  config: {
    gsc_configured: boolean;
    posthog_configured: boolean;
    auto_queue_generation: boolean;
  };
  runs: SeoRun[];
  latest: LatestRun | null;
}

interface GscRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
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
  const [overview, setOverview] = useState<SeoOverview | null>(null);
  const [gsc, setGsc] = useState<{ configured: boolean; rows: GscRow[]; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [ovRes, gscRes] = await Promise.all([
        fetch('/api/admin/seo'),
        fetch('/api/admin/seo/gsc'),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json() as SeoOverview);
      setGsc(await gscRes.json().catch(() => null) as { configured: boolean; rows: GscRow[]; error?: string } | null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function runNow() {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await fetch('/api/admin/seo/run', { method: 'POST' });
      const data = await res.json() as { status?: string; opportunities_found?: number; specs_created?: number; error?: string };
      if (res.ok) {
        setRunResult(`Run finished (${data.status}): ${data.opportunities_found ?? 0} opportunities, ${data.specs_created ?? 0} new specs.`);
      } else {
        setRunResult(`Run failed: ${data.error ?? res.statusText}`);
      }
      await load();
    } catch (err) {
      setRunResult(`Run failed: ${err instanceof Error ? err.message : 'network error'}`);
    } finally {
      setRunning(false);
    }
  }

  const opportunities = overview?.latest?.report?.opportunities ?? [];
  const quickWins = overview?.latest?.quick_wins ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Brain</h1>
          <p className="text-sm text-white/40 mt-1">Agentic SEO engine: Search Console + PostHog signals, analysed nightly by Claude.</p>
        </div>
        <button
          onClick={() => void runNow()}
          disabled={running}
          className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? 'Running...' : 'Run SEO brain now'}
        </button>
      </div>

      {runResult && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-[#00B8D4]/30 bg-[#00B8D4]/10 text-sm text-[#00B8D4]">
          {runResult}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : (
        <>
          {/* Config status */}
          <div className="flex flex-wrap gap-2 mb-8">
            <ConfigChip label="Search Console" on={overview?.config.gsc_configured ?? false} onText="connected" offText="not configured" />
            <ConfigChip label="PostHog" on={overview?.config.posthog_configured ?? false} onText="connected" offText="not configured" />
            <ConfigChip label="Auto-queue generation" on={overview?.config.auto_queue_generation ?? false} onText="on" offText="off" />
          </div>

          {/* Latest run: opportunities */}
          <h2 className="text-lg font-semibold text-white mb-3">Latest opportunities</h2>
          <div className="mb-8">
            {opportunities.length === 0 ? (
              <div className="bg-black/40 rounded-xl border border-white/10 px-6 py-10 text-center text-white/30 text-sm">
                No opportunities yet. Run the SEO brain to generate some.
              </div>
            ) : (
              <div className="grid gap-3">
                {opportunities.map(o => (
                  <div key={o.slug} className="bg-black/40 rounded-xl border border-white/10 px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white/90">{o.title}</span>
                      <span className="text-xs text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">{o.article_type}</span>
                      <span className="text-xs text-white/40">{o.cluster_slug}</span>
                    </div>
                    <p className="text-xs text-white/40 mb-2">/{o.slug} &middot; keyword: {o.primary_keyword}</p>
                    {o.rationale && <p className="text-sm text-white/60">{o.rationale}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest run: quick wins */}
          <h2 className="text-lg font-semibold text-white mb-3">Quick wins</h2>
          <div className="mb-8 bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
            {quickWins.length === 0 ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">No quick wins in the latest run.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="px-6 py-3 font-medium">Query</th>
                    <th className="px-4 py-3 font-medium">Page</th>
                    <th className="px-4 py-3 font-medium text-right">Impr.</th>
                    <th className="px-4 py-3 font-medium text-right">CTR</th>
                    <th className="px-4 py-3 font-medium text-right">Pos.</th>
                    <th className="px-6 py-3 font-medium">Suggested action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {quickWins.map((w, i) => (
                    <tr key={`${w.query}-${i}`}>
                      <td className="px-6 py-3 text-white/80">{w.query}</td>
                      <td className="px-4 py-3 text-white/50 max-w-[200px] truncate">{w.page || '-'}</td>
                      <td className="px-4 py-3 text-right text-white/60">{w.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-white/60">{(w.ctr * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-white/60">{w.position.toFixed(1)}</td>
                      <td className="px-6 py-3 text-white/60">{w.suggested_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Run history */}
          <h2 className="text-lg font-semibold text-white mb-3">Run history</h2>
          <div className="mb-8 bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
            {(overview?.runs.length ?? 0) === 0 ? (
              <p className="px-6 py-10 text-center text-white/30 text-sm">No runs yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/40 border-b border-white/10">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">GSC rows</th>
                    <th className="px-4 py-3 font-medium text-right">PostHog rows</th>
                    <th className="px-4 py-3 font-medium text-right">Opportunities</th>
                    <th className="px-6 py-3 font-medium text-right">Specs created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {overview?.runs.map(r => (
                    <tr key={r.id}>
                      <td className="px-6 py-3 text-white/80">{fmtDate(r.started_at)}</td>
                      <td className="px-4 py-3"><RunStatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-right text-white/60">{r.gsc_rows}</td>
                      <td className="px-4 py-3 text-right text-white/60">{r.posthog_rows}</td>
                      <td className="px-4 py-3 text-right text-white/60">{r.opportunities_found}</td>
                      <td className="px-6 py-3 text-right text-white/60">{r.specs_created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Live GSC top queries */}
          <h2 className="text-lg font-semibold text-white mb-3">Search Console top queries (28 days)</h2>
          <div className="bg-black/40 rounded-xl border border-white/10 overflow-x-auto">
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
        </>
      )}
    </div>
  );
}
