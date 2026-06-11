import type { Metadata } from 'next';
import { SearchClient } from './SearchClient';

export const metadata: Metadata = {
  title: 'Integrius Search: Federated Search Across Governed Data Products',
  description:
    'Real-time federated search across all your governed data products. Fuzzy matching, relevance scoring, facets, autocomplete. Derived from the data layer, not a separate index to maintain.',
  alternates: { canonical: '/products/search' },
  openGraph: {
    title: 'Integrius Search: Federated Search Across Governed Data Products',
    description:
      'One governed search API across everything. No indexing pipelines, no sync jobs, no separate cluster. If your data is unified, it is already searchable.',
    url: '/products/search',
    type: 'website',
  },
};

export default function IntegriusSearchPage() {
  return <SearchClient />;
}
