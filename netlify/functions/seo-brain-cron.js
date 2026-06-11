// Netlify scheduled function — triggers the nightly SEO brain run.
// Schedule is declared in-code via exports.config (no netlify.toml entry needed).
// The heavy lifting happens in /api/cron/seo-brain; this just kicks it off.

const TIMEOUT_MS = 25_000;

exports.handler = async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) {
    console.error('seo-brain-cron: no URL or NEXT_PUBLIC_SITE_URL set, cannot trigger run');
    return { statusCode: 500 };
  }

  const secret = encodeURIComponent(process.env.CRON_SECRET || '');
  const url = `${base}/api/cron/seo-brain?secret=${secret}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const body = await res.text();
    console.log(`seo-brain-cron: HTTP ${res.status}: ${body.slice(0, 1000)}`);
  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.log(`seo-brain-cron: triggered, still running after ${TIMEOUT_MS}ms (run continues server-side)`);
    } else {
      console.error('seo-brain-cron: trigger failed', err);
    }
  } finally {
    clearTimeout(timer);
  }

  return { statusCode: 200 };
};

// Daily at 05:00 UTC
exports.config = { schedule: '0 5 * * *' };
