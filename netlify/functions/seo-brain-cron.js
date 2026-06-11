// Netlify scheduled function — triggers the daily SEO brain run.
// Schedule is declared in-code via exports.config (no netlify.toml entry needed).
//
// Fire-and-forget: a full run now includes article generation (multiple Claude
// calls) and can take minutes, far longer than this function's budget. We
// dispatch the request with a short timeout, log that it was dispatched, and
// do NOT await completion. The run continues server-side in /api/cron/seo-brain
// and its outcome surfaces as a GitHub PR (and in the function logs of the
// Next.js route). The trade-off: this function's log only confirms dispatch,
// not success. See docs/AGENTIC-SEO.md.

const DISPATCH_TIMEOUT_MS = 5_000;

exports.handler = async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) {
    console.error('seo-brain-cron: no URL or NEXT_PUBLIC_SITE_URL set, cannot trigger run');
    return { statusCode: 500 };
  }

  const secret = encodeURIComponent(process.env.CRON_SECRET || '');
  const url = `${base}/api/cron/seo-brain?secret=${secret}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    // If the run finishes inside the dispatch window (e.g. nothing to write),
    // log the status; otherwise the abort below is the expected path.
    console.log(`seo-brain-cron: run completed within dispatch window, HTTP ${res.status}`);
  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.log(`seo-brain-cron: dispatched, run continues server-side (not awaited beyond ${DISPATCH_TIMEOUT_MS}ms)`);
    } else {
      console.error('seo-brain-cron: dispatch failed', err);
    }
  } finally {
    clearTimeout(timer);
  }

  return { statusCode: 200 };
};

// Daily at 05:00 UTC
exports.config = { schedule: '0 5 * * *' };
