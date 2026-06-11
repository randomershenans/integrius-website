import type { Metadata } from 'next';
import { CoreClient } from './CoreClient';

export const metadata: Metadata = {
  title: 'Integrius Core: The Self-Hosted Data Product Platform',
  description:
    'Connect once. Use everywhere. Know everything. Core turns fragmented enterprise data into governed data products: accountable owners, tamper-evident audit chains, one stable API endpoint, entirely inside your infrastructure.',
  alternates: { canonical: '/products/core' },
  openGraph: {
    title: 'Integrius Core: The Self-Hosted Data Product Platform',
    description:
      'Turn N sources and M consumers into N + M connections. 16 connectors, governed data products, tamper-evident audit, sub-50ms p95 materialized serving. Air-gap capable, zero SaaS dependencies.',
    url: '/products/core',
    type: 'website',
  },
};

export default function IntegriusCorePage() {
  return <CoreClient />;
}
