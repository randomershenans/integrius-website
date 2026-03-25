import type { Metadata } from 'next';
import { UseCasesClient } from './UseCasesClient';

export const metadata: Metadata = {
  title: 'Industry Scenarios — Integrius',
  description: 'Real problems. Real industries. Real results. See how Integrius solves data unification challenges in pharma, banking, and enterprise tech.',
};

export default function UseCasesPage() {
  return <UseCasesClient />;
}
