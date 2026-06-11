import type { Metadata } from 'next';
import Link from 'next/link';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

export const metadata: Metadata = {
  title: 'Technical Brief: Architecture, Security, Deployment, Compliance',
  description:
    'How Integrius works: sources flow into one unified layer, become governed data products, and serve every consumer through stable APIs. Security model, deployment model, compliance matrix, and performance numbers in one page.',
  alternates: { canonical: '/technical-brief' },
  openGraph: {
    title: 'Integrius Technical Brief',
    description:
      'Architecture, security model, deployment model, compliance matrix, and performance numbers for the Integrius platform. Self-hosted, air-gap capable, tamper-evident.',
    url: '/technical-brief',
    type: 'website',
  },
};

const sources = ['PostgreSQL', 'MySQL', 'MSSQL', 'Snowflake', 'BigQuery', 'Redshift', 'MongoDB', 'REST API', 'GraphQL', 'Salesforce', 'Kafka', 'S3', 'CSV', 'Excel', 'JSON', 'Event Log'];

const securityModel = [
  {
    area: 'Identity & access',
    items: [
      'RBAC with 4 built-in roles and 24 granular permissions, evaluated on every request',
      'TOTP MFA, OIDC SSO, SAML 2.0, SCIM 2.0 provisioning',
      'Scoped API keys with IP allowlists and per-key rate limits',
    ],
  },
  {
    area: 'Data protection',
    items: [
      'Source credentials encrypted at rest with AES-256-GCM',
      'SSRF-aware validation on every outbound connector URL',
      'Field-level access control on data products',
    ],
  },
  {
    area: 'Audit & integrity',
    items: [
      'Tamper-evident audit log: HMAC or Ed25519 hash-chained, with an append-only database trigger',
      '21 CFR Part 11 e-signatures: re-authentication plus stated reason, chained into the audit row',
      'Field mapping changes pass through approval workflows',
    ],
  },
  {
    area: 'Integration surface',
    items: [
      'Signed webhooks for verifiable event delivery',
      'WebSockets for realtime updates, Prometheus metrics for observability',
      'Complete OpenAPI documentation, generated from the platform',
    ],
  },
];

const deploymentPoints = [
  {
    title: 'Self-hosted, always',
    body: 'The entire platform runs inside your infrastructure: your VPC, your data center, or an air-gapped enclave. There is no SaaS control plane and no phone-home. Nothing to allowlist outbound.',
  },
  {
    title: 'AI inside the boundary',
    body: 'Optic, the AI analytics layer, performs inference on a local LLM via Ollama by default. Questions, schemas, and data stay inside your network. No OpenAI dependency, no per-query bill.',
  },
  {
    title: 'Governance enforced at runtime',
    body: 'Core is the runtime, not a catalog. The layer that documents ownership and policy is the same layer that serves the API call, so access rules cannot drift from enforcement.',
  },
  {
    title: 'Environments and domains',
    body: 'Tiers scale from 1 environment and 1 domain (Pilot) to 3+ environments and 3+ domains (Platform). Data products are environment-aware: dev, test, and prod stay separate.',
  },
];

const complianceMatrix = [
  { regulation: '21 CFR Part 11 + ALCOA+', industry: 'Pharma & biotech', how: 'E-signatures with re-authentication and reason, tamper-evident hash-chained audit log, attributable records' },
  { regulation: 'GDPR', industry: 'All (EU data subjects)', how: 'Atomic erasure endpoint deletes and anonymises in one transaction with a chained audit row; DPA template included' },
  { regulation: 'HIPAA', industry: 'Healthcare', how: 'Self-hosted deployment keeps PHI inside your network; BAA template included' },
  { regulation: 'SOX 404', industry: 'Financial services', how: 'Tamper-evident audit chain provides verifiable evidence for internal controls over financial data flows' },
  { regulation: 'FISMA / NIST 800-53', industry: 'Government', how: 'Control families mapped: access enforcement, audit and accountability, identification and authentication' },
  { regulation: 'FedRAMP', industry: 'Government', how: 'FedRAMP-aligned architecture for agency deployment paths' },
  { regulation: 'ITAR / EAR', industry: 'Defense', how: 'Data residency by architecture: air-gap capable, zero outbound dependencies' },
  { regulation: 'SOC 2 / ISO 27001', industry: 'All', how: 'Platform controls mapped to support your certification audits' },
  { regulation: 'NERC CIP', industry: 'Energy & utilities', how: 'Governed, audited access to operational data within your security perimeter' },
  { regulation: 'FERPA', industry: 'Education', how: 'Student-record access controls with field-level permissions and full audit trail' },
];

const performanceNumbers = [
  { value: '<50ms', label: 'p95 response for materialized data products: streaming pre-computed snapshots, refreshed on schedule or on events' },
  { value: '280ms', label: 'p50 live-fetch across 10 sources simultaneously, demo scale baseline' },
  { value: '1,028', label: 'passing tests across unit, end-to-end, and stress suites' },
  { value: 'N + M', label: 'integration complexity: each source connects once, each consumer reads governed products' },
];

function SectionHeading({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">{kicker}</p>
      <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">{title}</h2>
      {lead && <p className="text-white/70 text-lg max-w-3xl mx-auto mt-4">{lead}</p>}
    </div>
  );
}

export default function TechnicalBriefPage() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <SiteHeader />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="pt-24 pb-16 relative">
          <div className="w-full px-4 md:px-8 relative z-10">
            <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Technical Brief</p>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-white">
                How Integrius Works
              </h1>
              <p className="mx-auto max-w-[760px] text-white/80 text-lg md:text-xl">
                The platform in one page: architecture, security model, deployment model, compliance coverage, and the numbers behind them. Written for the engineers and security teams who will evaluate it.
              </p>
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <div className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10">
              <SectionHeading
                kicker="Architecture"
                title="Sources In. Governed Data Products Out."
                lead="N sources and M consumers normally means N times M point-to-point pipelines. Integrius collapses that to N plus M: every source connects once to the unified layer, every consumer reads governed data products through stable, versioned APIs."
              />
              {/* Flow diagram */}
              <div className="grid md:grid-cols-4 gap-4 items-stretch max-w-6xl mx-auto mb-6">
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">1 · Sources</p>
                  <p className="text-white font-semibold mb-2">16 connector types</p>
                  <p className="text-white/60 text-sm">Each with connection testing, schema discovery, AES-256-GCM credential encryption, and SSRF-aware URL validation.</p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">2 · Unified layer</p>
                  <p className="text-white font-semibold mb-2">Standard Fields</p>
                  <p className="text-white/60 text-sm">An organization-wide canonical schema. Sources map into it through governed field mappings with approval workflows.</p>
                </div>
                <div className="p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">3 · Data products</p>
                  <p className="text-white font-semibold mb-2">Owned, versioned, audited</p>
                  <p className="text-white/60 text-sm">Composed from sources or other data products. Entity-keyed joins in real time. Each has an accountable owner and one stable API endpoint.</p>
                </div>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">4 · Consumers</p>
                  <p className="text-white font-semibold mb-2">Apps, SDK, Search, Optic</p>
                  <p className="text-white/60 text-sm">Applications via the typed SDK, federated search, and Optic: plain-English AI analytics with RBAC enforced upstream.</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                {sources.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">{s}</span>
                ))}
              </div>
              <div className="mt-8 max-w-3xl mx-auto p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-white/70 text-sm">
                  <span className="text-cyan-400 font-semibold">Dependency graph and blast radius:</span> every data product knows what it depends on and what depends on it. Schema changes, field removals, and access revocations show their full downstream impact before anything is changed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security model */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <div className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10">
              <SectionHeading
                kicker="Security model"
                title="Designed for the Security Review"
              />
              <div className="grid md:grid-cols-2 gap-6">
                {securityModel.map((group) => (
                  <div key={group.area} className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-semibold text-cyan-400 mb-3">{group.area}</p>
                    <ul className="space-y-2">
                      {group.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                          <span className="text-cyan-400 mt-0.5">·</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Deployment model */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <div className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10">
              <SectionHeading
                kicker="Deployment model"
                title="Your Infrastructure. All of It."
              />
              <div className="grid md:grid-cols-2 gap-6">
                {deploymentPoints.map((point) => (
                  <div key={point.title} className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-semibold text-white mb-2">{point.title}</p>
                    <p className="text-white/60 text-sm leading-relaxed">{point.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Compliance matrix */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <div className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10">
              <SectionHeading
                kicker="Compliance"
                title="Compliance Matrix"
                lead="The same platform primitives, ownership, RBAC, e-signatures, and the tamper-evident audit chain, map onto each framework."
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Framework</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Industry</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">How Integrius Addresses It</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceMatrix.map((row) => (
                      <tr key={row.regulation} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-semibold text-cyan-400 whitespace-nowrap">{row.regulation}</td>
                        <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.industry}</td>
                        <td className="py-3 px-4 text-white/70">{row.how}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <div className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10">
              <SectionHeading
                kicker="Performance"
                title="The Numbers"
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {performanceNumbers.map((stat) => (
                  <div key={stat.value} className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                    <p className="text-3xl font-bold text-cyan-400 mb-2">{stat.value}</p>
                    <p className="text-sm text-white/60">{stat.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-white/40 mt-6">
                Materialized products serve streaming pre-computed snapshots. Live products query sources directly. Both behind the same stable endpoint.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing summary */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <div className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10">
              <SectionHeading
                kicker="Commercials"
                title="Priced per Data Product, Not per Seat"
                lead="No per-seat, per-connector, or per-API-call charges. You pay for governed data products in production."
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-1">Pilot</p>
                  <p className="text-2xl font-bold text-cyan-400 mb-2">€5,000<span className="text-sm text-white/40 font-normal">/mo</span></p>
                  <p className="text-xs text-white/60">Up to 20 data products, 1 environment, 1 domain. Optic lite included.</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-1">Enterprise</p>
                  <p className="text-2xl font-bold text-cyan-400 mb-2">€18,000<span className="text-sm text-white/40 font-normal">/mo</span></p>
                  <p className="text-xs text-white/60">Up to 50 data products, 2 environments. Search and Optic each €100k/yr add-ons.</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-1">Platform Lite</p>
                  <p className="text-2xl font-bold text-cyan-400 mb-2">€22,000<span className="text-sm text-white/40 font-normal">/mo</span></p>
                  <p className="text-xs text-white/60">Up to 75 data products.</p>
                </div>
                <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <p className="font-semibold text-cyan-400 mb-1">Platform</p>
                  <p className="text-2xl font-bold text-cyan-400 mb-2">€320,000<span className="text-sm text-white/40 font-normal">/yr</span></p>
                  <p className="text-xs text-white/60">100+ data products, 3+ environments, 3+ domains. Search and Optic included.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-12 rounded-xl border border-cyan-500/20 text-center">
              <h3 className="text-2xl font-bold text-white">Put it in front of your security team.</h3>
              <p className="text-lg text-white/70 max-w-2xl">We will walk your engineers through the architecture, the audit chain, and a live deployment.</p>
              <div className="mt-6 flex gap-4 flex-wrap justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Schedule a Technical Session
                </Link>
                <Link href="/products/core" className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-lg font-semibold text-lg hover:border-white/40 hover:text-white transition-all">
                  Explore Integrius Core
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
