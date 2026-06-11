import type { Metadata } from 'next';
import { SDKClient } from './SDKClient';

export const metadata: Metadata = {
  title: 'Integrius SDK: A Typed Client for Governed Data Products',
  description:
    'One endpoint per business concept. Stable versioned contracts. No point-to-point integration code. The Integrius SDK is live on npm and lets developers consume governed data products in minutes.',
  alternates: { canonical: '/products/sdk' },
  openGraph: {
    title: 'Integrius SDK: A Typed Client for Governed Data Products',
    description:
      'Consume governed data products from your applications with a typed client. Stable contracts instead of glue code. Live on npm.',
    url: '/products/sdk',
    type: 'website',
  },
};

export default function IntegriusSDKPage() {
  return <SDKClient />;
}
