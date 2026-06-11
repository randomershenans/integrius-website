// Netlify scheduled function — triggers the hourly publish + LinkedIn share run.
// Previously /api/cron/publish needed an external scheduler (EasyCron etc.);
// this makes the site self-contained.

const TIMEOUT_MS = 25_000;

exports.handler = async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) {
    console.error('publish-cron: no URL or NEXT_PUBLIC_SITE_URL set, cannot trigger run');
    return { statusCode: 500 };
  }

  const secret = encodeURIComponent(process.env.CRON_SECRET || '');
  const url = `${base}/api/cron/publish?secret=${secret}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const body = await res.text();
    console.log(`publish-cron: HTTP ${res.status}: ${body.slice(0, 1000)}`);
  } catch (err) {
    if (err && err.name === 'AbortError') {
      console.log(`publish-cron: triggered, still running after ${TIMEOUT_MS}ms (run continues server-side)`);
    } else {
      console.error('publish-cron: trigger failed', err);
    }
  } finally {
    clearTimeout(timer);
  }

  return { statusCode: 200 };
};

// Hourly on the hour
exports.config = { schedule: '0 * * * *' };
