import type { Metadata } from 'next';
import { UseCasesClient } from './UseCasesClient';

export const metadata: Metadata = {
  title: 'Industry Scenarios: Pharma, Finance, Government and More',
  description:
    'How Integrius works in regulated industries: 21 CFR Part 11 inspection prep in pharma, AML/KYC golden customer views in finance, air-gapped deployment for government and defense, HIPAA, FERPA, NERC CIP and more.',
  alternates: { canonical: '/use-cases' },
  openGraph: {
    title: 'Industry Scenarios: Pharma, Finance, Government and More',
    description:
      'Governed data products in the industries where governance is the law. Three deep scenarios, eight industries, one platform.',
    url: '/use-cases',
    type: 'website',
  },
};

export default function UseCasesPage() {
  return <UseCasesClient />;
}
