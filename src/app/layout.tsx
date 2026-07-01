import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Integrius: Connect once. Use everywhere. Know everything.', template: '%s | Integrius' },
  description: 'The self-hosted data product platform. Integrius turns fragmented enterprise data into governed data products: one API per business concept, a tamper-evident audit trail, and AI answers that never leave your network.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us'),
  openGraph: {
    siteName: 'Integrius',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: 'Integrius Blog RSS Feed' }] },
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://integri.us';

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Integrius',
  url: siteUrl,
  logo: `${siteUrl}/logo-dark.png`,
  sameAs: [
    'https://www.linkedin.com/company/integrius',
  ],
  description: 'Governed data layer and data products platform. Self-hosted, API-first, enterprise-grade.',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Integrius Blog',
  url: `${siteUrl}/blog`,
  publisher: { '@type': 'Organization', name: 'Integrius', url: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="bg-black min-h-screen font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <PostHogProvider>
          <main>{children}</main>
        </PostHogProvider>
      </body>
    </html>
  );
}
