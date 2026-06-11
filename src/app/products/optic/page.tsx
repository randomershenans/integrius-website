import type { Metadata } from 'next';
import { OpticClient } from './OpticClient';

export const metadata: Metadata = {
  title: 'Integrius Optic: AI Analytics That Never Leave Your Network',
  description:
    'Ask a question in plain English. Optic resolves the governed data products that answer it, fetches live data through Core, and a local LLM returns KPIs, the right chart, a forecast, and a written summary. On-prem inference, no per-query bill.',
  alternates: { canonical: '/products/optic' },
  openGraph: {
    title: 'Integrius Optic: AI Analytics That Never Leave Your Network',
    description:
      'Plain-English answers on governed data. Around 30 chart types, forecasting with confidence bands, watchers, scheduled briefs, PDF and PPTX export. Local LLM inference via Ollama, inside your network.',
    url: '/products/optic',
    type: 'website',
  },
};

export default function IntegriusOpticPage() {
  return <OpticClient />;
}
