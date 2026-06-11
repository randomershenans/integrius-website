'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Shield, GitBranch, CheckCircle2, ArrowRight, Eye, Layers, Lock, KeyRound, Network } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const connectors = [
  { name: 'PostgreSQL', type: 'Database', useCase: 'Postgres with SSL and custom queries' },
  { name: 'MySQL', type: 'Database', useCase: 'MySQL and MariaDB' },
  { name: 'SQL Server', type: 'Database', useCase: 'MSSQL with encrypted connections' },
  { name: 'Snowflake', type: 'Warehouse', useCase: 'Warehouse access with role assumption' },
  { name: 'BigQuery', type: 'Warehouse', useCase: 'Google BigQuery with service account auth' },
  { name: 'Redshift', type: 'Warehouse', useCase: 'AWS Redshift with IAM auth' },
  { name: 'MongoDB', type: 'NoSQL', useCase: 'MongoDB including Atlas' },
  { name: 'REST API', type: 'API', useCase: 'Any HTTP endpoint with auth, pagination, path extraction' },
  { name: 'GraphQL', type: 'API', useCase: 'Any GraphQL endpoint with variables' },
  { name: 'Salesforce', type: 'SaaS', useCase: 'Standard and custom objects via SOQL' },
  { name: 'Kafka', type: 'Streaming', useCase: 'Topics with SASL auth and Schema Registry' },
  { name: 'Amazon S3', type: 'Cloud Storage', useCase: 'CSV, JSON, Parquet from S3 buckets' },
  { name: 'CSV', type: 'File', useCase: 'Upload with delimiter and encoding options' },
  { name: 'Excel', type: 'File', useCase: '.xlsx and .xls with sheet and range selection' },
  { name: 'JSON', type: 'File', useCase: 'Newline-delimited or array, streaming parse' },
  { name: 'Event Log', type: 'Streaming', useCase: 'Replay the platform event stream as a source' },
];

const typeColors: Record<string, string> = {
  'API': 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  'Database': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Warehouse': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  'NoSQL': 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  'File': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'Cloud Storage': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'SaaS': 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  'Streaming': 'bg-red-500/20 text-red-400 border border-red-500/30',
};

const dataProductFeatures = [
  {
    icon: Layers,
    title: 'Standard Fields',
    description: 'One organization-wide canonical schema. Every source maps into it through governed field mappings with approval workflows. "Revenue" means the same thing everywhere.',
  },
  {
    icon: GitBranch,
    title: 'Multi-Hop Composition',
    description: 'Compose data products from sources, or from other data products. Entity-keyed joins resolve across systems in real time. Build a customer 360 from a billing product plus a CRM product.',
  },
  {
    icon: CheckCircle2,
    title: 'Stable Versioned Contracts',
    description: 'Every data product exposes one stable API endpoint with a versioned contract and an accountable owner. Consumers build against the contract, not the source schema.',
  },
];

const governanceCards = [
  {
    title: 'RBAC: 4 roles, 24 permissions',
    body: 'Four built-in roles and 24 granular permissions. Access is evaluated on every request, down to the field level. No shadow paths around the rules.',
  },
  {
    title: '21 CFR Part 11 e-signatures',
    body: 'Critical actions require re-authentication and a stated reason. Signatures are chained into the audit log with HMAC or Ed25519, ready for FDA inspection.',
  },
  {
    title: 'Tamper-evident audit chain',
    body: 'Every action lands in a hash-chained audit log, HMAC or Ed25519, with an append-only database trigger. If anything is altered, verification fails and tells you exactly which row broke.',
  },
  {
    title: 'Approval workflows',
    body: 'Field mappings into the canonical schema go through review and approval. Changes to governed definitions are deliberate, attributed, and logged.',
  },
  {
    title: 'GDPR atomic erasure',
    body: 'One endpoint erases a data subject in a single transaction and writes a chained audit row proving it happened. DPA template included.',
  },
  {
    title: 'Accountable ownership',
    body: 'Every data product has a named owner. When a regulator, an auditor, or a new engineer asks "who is responsible for this data?", the platform answers.',
  },
];

const securityFeatures = [
  { name: 'TOTP MFA', detail: 'Time-based one-time passwords for every account' },
  { name: 'OIDC SSO', detail: 'OpenID Connect single sign-on' },
  { name: 'SAML 2.0', detail: 'Enterprise identity federation' },
  { name: 'SCIM 2.0', detail: 'Automated user provisioning and deprovisioning' },
  { name: 'Scoped API keys', detail: 'IP allowlists and per-key rate limits' },
  { name: 'Signed webhooks', detail: 'Verifiable event delivery to your systems' },
  { name: 'WebSockets', detail: 'Realtime updates without polling' },
  { name: 'Prometheus metrics', detail: 'First-class observability endpoints' },
  { name: 'OpenAPI docs', detail: 'Complete, generated API documentation' },
  { name: 'AES-256-GCM', detail: 'All source credentials encrypted at rest' },
  { name: 'SSRF-aware validation', detail: 'Every outbound connector URL is validated' },
  { name: '1,028 passing tests', detail: 'Unit, end-to-end, and stress suites' },
];

const complianceWall = [
  { name: '21 CFR Part 11 + ALCOA+', detail: 'E-signatures, attributable audit chain, pharma data integrity' },
  { name: 'GDPR', detail: 'Atomic erasure endpoint, DPA template' },
  { name: 'HIPAA', detail: 'Self-hosted, PHI never leaves your network, BAA template' },
  { name: 'SOX 404', detail: 'Tamper-evident controls over financial data flows' },
  { name: 'FISMA / NIST 800-53', detail: 'Control families mapped for federal deployment' },
  { name: 'FedRAMP-aligned', detail: 'Architecture aligned to FedRAMP requirements' },
  { name: 'ITAR / EAR', detail: 'Data residency by design: nothing leaves your boundary' },
  { name: 'SOC 2 / ISO 27001', detail: 'Controls mapped for your certification audits' },
];

export function CoreClient() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="w-full px-4 md:px-8 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">
                  Integrius Core
                </h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">Connect once. Use everywhere. Know everything.</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  Core turns fragmented enterprise data into governed data products: each with an accountable owner, a tamper-evident audit chain, and one stable API endpoint. Served entirely inside your own infrastructure. Air-gap capable. No phone-home. Zero SaaS dependencies.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Schedule a Demo <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* N x M to N + M */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Network className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  The Integration Math Is Broken
                </h2>
              </div>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                N sources and M consumers means N times M point-to-point pipelines. Every new system multiplies the mess. Core collapses it to N plus M: each source connects once, each consumer reads governed data products.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-stretch">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }} viewport={{ once: true }}
                  className="p-6 rounded-xl bg-red-500/5 border border-red-500/20 text-center flex flex-col justify-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">Without Core</p>
                  <p className="text-4xl font-bold text-white mb-1">12 &times; 9</p>
                  <p className="text-red-400 font-semibold mb-2">= 108 pipelines</p>
                  <p className="text-white/60 text-sm">Twelve sources, nine consumers. Every pair is its own integration to build, secure, and babysit.</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}
                  className="flex items-center justify-center"
                >
                  <ArrowRight className="w-10 h-10 text-cyan-400" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }}
                  className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center flex flex-col justify-center"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">With Core</p>
                  <p className="text-4xl font-bold text-white mb-1">12 + 9</p>
                  <p className="text-cyan-400 font-semibold mb-2">= 21 connections</p>
                  <p className="text-white/60 text-sm">One unified layer in the middle. Sources connect once. Consumers get stable, governed contracts.</p>
                </motion.div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* 16 Connectors Table */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                16 Connectors. All Included at Every Tier.
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                No connector marketplace. No add-on fees. Every connector ships with connection testing, schema discovery, encrypted credentials, and SSRF-aware URL validation.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Connector</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Use Case</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connectors.map((connector, index) => (
                      <motion.tr
                        key={connector.name}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }} viewport={{ once: true }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-white">{connector.name}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[connector.type]}`}>
                            {connector.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/70">{connector.useCase}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-6 text-sm text-white/50 text-center">
                All credentials encrypted at rest with AES-256-GCM. All outbound URLs validated against SSRF attacks.
              </p>
            </FloatingElement>
          </div>
        </section>

        {/* Data products + Standard Fields */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Layers className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Data Products, Not Pipelines
                </h2>
              </div>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                A data product is a governed, owned, versioned API over your data. Compose them from one source, many sources, or other data products. Consumers never touch raw schemas again.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                {dataProductFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl border bg-black/30 border-white/10"
                  >
                    <feature.icon className="w-8 h-8 mb-4 text-[#00B8D4]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Governance */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Governance That Holds Up in an Inspection
                </h2>
              </div>
              <p className="text-lg text-center mb-8 max-w-3xl mx-auto text-white/80">
                Every action lands in a tamper-evident, hash-chained audit log. An auditor can walk the chain end to end. If anyone tampered, verification fails and points to the exact row.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {governanceCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }} viewport={{ once: true }}
                    className="p-5 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="font-semibold text-cyan-400 mb-2">{card.title}</p>
                    <p className="text-white/70 text-sm">{card.body}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Blast Radius / Dependency Graph */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Eye className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Blast Radius. Before You Pull the Trigger.
                </h2>
              </div>
              <p className="text-lg text-center mb-8 max-w-3xl mx-auto text-white/80">
                Every data product knows what it depends on and what depends on it. Change a source schema, remove a field, revoke access: see exactly what breaks before you do it.
              </p>
              <div className="rounded-xl overflow-hidden border border-cyan-500/20 mb-6 shadow-2xl shadow-cyan-500/10">
                <img
                  src="/screenshots/integrius-dependency-graph.gif"
                  alt="Integrius dependency graph and blast radius explorer"
                  className="w-full"
                />
                <div className="px-4 py-2 bg-black/60 border-t border-white/10 text-center">
                  <p className="text-xs text-white/40">Live dependency graph. Blast radius computed in real time. Every upstream and downstream relationship, visualised.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { label: 'Schema change', body: 'See every downstream product affected before you touch the source.' },
                  { label: 'Access revocation', body: 'Remove a team from a data product and immediately see which of their workflows break.' },
                  { label: 'Impact analysis', body: 'Run the analysis without making a single change. No surprises in production.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="font-semibold text-cyan-400 text-sm mb-1">{item.label}</p>
                    <p className="text-white/60 text-sm">{item.body}</p>
                  </div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Materialization Engine */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.3}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Materialization: Fast by Default
                </h2>
              </div>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Query live across all your sources, or serve streaming pre-computed snapshots. Your choice, per product. Either way, consumers hit one stable endpoint.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                  <p className="text-3xl font-bold text-cyan-400 mb-1">&lt;50ms</p>
                  <p className="text-sm text-white/60">p95 for materialized data products: streaming pre-computed snapshots</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-white mb-1">280ms</p>
                  <p className="text-sm text-white/60">p50 live-fetch across 10 sources at once, demo scale baseline</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-3xl font-bold text-white mb-1">Two triggers</p>
                  <p className="text-sm text-white/60">Snapshots refresh on a schedule or on events. You decide the freshness contract.</p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Security & operations */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <KeyRound className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Enterprise Security, Standard
                </h2>
              </div>
              <p className="text-lg text-center mb-10 max-w-3xl mx-auto text-white/80">
                Everything your security review will ask about is already built in. No premium tier for the basics.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {securityFeatures.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }} viewport={{ once: true }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
                  >
                    <p className="text-sm font-semibold text-white mb-1">{item.name}</p>
                    <p className="text-xs text-white/50">{item.detail}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Compliance wall */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Lock className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  The Compliance Wall
                </h2>
              </div>
              <p className="text-lg text-center mb-10 max-w-3xl mx-auto text-white/80">
                Built for the industries where data governance is the law, not a nice-to-have.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {complianceWall.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }} viewport={{ once: true }}
                    className="p-5 rounded-xl bg-cyan-500/5 border border-cyan-500/20"
                  >
                    <p className="font-semibold text-cyan-400 mb-2 text-sm">{item.name}</p>
                    <p className="text-white/60 text-xs">{item.detail}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Positioning */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Catalogs Govern. Pipelines Move. Core Does Both.
              </h2>
              <p className="text-lg text-center mb-10 max-w-3xl mx-auto text-white/80">
                Core is the runtime, not a catalog. Governance and serving in one layer, inside your network.
              </p>
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-2">Collibra, Atlan</p>
                  <p className="text-white/60 text-sm">Govern your data on paper. They document policies but never serve a byte. The catalog says who should have access; nothing enforces it at the API.</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-semibold text-white mb-2">Fivetran, Airbyte</p>
                  <p className="text-white/60 text-sm">Move your data. They copy rows from A to B but carry no governance with them. Every copy is a new surface to secure and audit.</p>
                </div>
                <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <p className="font-semibold text-cyan-400 mb-2">Integrius Core</p>
                  <p className="text-white/80 text-sm">Governs and serves. The same layer that enforces RBAC, ownership, and the audit chain is the layer that answers the API call. Policy and runtime are one thing.</p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Ready to Unify Your Data Layer?</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">One governed layer between your sources and everyone who needs them. Inside your infrastructure, on your terms.</p>
              <div className="mt-8 flex gap-4 flex-wrap justify-center">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Talk to Our Team <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/technical-brief" className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-lg font-semibold text-lg hover:border-white/40 hover:text-white transition-all">
                  Read the Technical Brief
                </Link>
              </div>
            </FloatingElement>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
