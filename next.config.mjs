// ─────────────────────────────────────────────────────────────────────────────
// INTEGRIUS CMS — next.config.mjs
//
// THIS IS THE MARKETING BLOG CMS — NOT THE INTEGRIUS PRODUCT.
// Deployed independently at integri.us (or a subdomain).
// Do not import or reference from the main product codebase.
// ─────────────────────────────────────────────────────────────────────────────

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control',    value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // eu-assets.i.posthog.com: posthog-js lazy-loads feature modules from there
      "script-src 'self' 'unsafe-inline' https://eu-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://eu.i.posthog.com https://eu-assets.i.posthog.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/products/data-consumer',
        destination: '/products/optic',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
