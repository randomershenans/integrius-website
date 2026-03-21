import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'Integrius — Change Anything. Break Nothing.', template: '%s | Integrius' },
  description: 'Integrius unifies your data into governed data products and shows you exactly what will break, before you break it.',
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
  logo: `${siteUrl}/logo.png`,
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
        {children}
      </body>
    </html>
  );
}
