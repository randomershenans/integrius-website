'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Database, Zap, Shield, GitBranch, Clock, CheckCircle2, ArrowRight, Eye, Layers } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const connectors = [
  { name: 'REST API', type: 'API', useCase: 'Any HTTP endpoint with auth, pagination, path extraction' },
  { name: 'PostgreSQL', type: 'Database', useCase: 'Postgres 12+ with SSL, custom queries' },
  { name: 'MySQL', type: 'Database', useCase: 'MySQL 5.7+ / MariaDB 10.3+' },
  { name: 'SQL Server', type: 'Database', useCase: 'MSSQL 2016+ with encryption' },
  { name: 'Snowflake', type: 'Warehouse', useCase: 'Full warehouse access with role assumption' },
  { name: 'MongoDB', type: 'NoSQL', useCase: 'MongoDB 4.4+ including Atlas' },
  { name: 'GraphQL', type: 'API', useCase: 'Any GraphQL endpoint with variables' },
  { name: 'CSV', type: 'File', useCase: 'Upload with delimiter/encoding options' },
  { name: 'Excel', type: 'File', useCase: '.xlsx/.xls with sheet and range selection' },
  { name: 'Amazon S3', type: 'Cloud Storage', useCase: 'CSV, JSON, Parquet from S3 buckets' },
  { name: 'Salesforce', type: 'SaaS', useCase: 'Standard and custom objects via SOQL' },
  { name: 'BigQuery', type: 'Warehouse', useCase: 'Google BigQuery with service account auth' },
  { name: 'Kafka', type: 'Streaming', useCase: 'Topics with SASL auth and Schema Registry' },
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

const eventConsequences = [
  {
    heading: 'No product analytics SDK needed.',
    body: 'No Mixpanel. No Amplitude. No Segment. "How many API calls did the finance team make this month?" Just query the event log data product. No tracking code.',
  },
  {
    heading: 'Usage-based billing comes free from the event stream.',
    body: 'Every API call, every query, every data product access is an event with org, user, and timestamp.',
  },
  {
    heading: 'Customer health scoring from event velocity.',
    body: 'A customer making 10,000 API calls/week is healthy. A customer who dropped from 5,000 to 200 is at risk.',
  },
  {
    heading: 'Churn prediction from declining event frequency.',
    body: "When a customer's event rate drops 60% over 3 weeks, that is a leading indicator.",
  },
];

const permissionFeatures = [
  {
    q: '"Who has access to what?"',
    a: 'Visual matrix showing every AD group × every resource, with drill-down to individual users and field-level permissions.',
  },
  {
    q: '"What happens if we remove the data science team from this source?"',
    a: 'Instant blast radius simulation: see the impact BEFORE you make the change.',
  },
  {
    q: 'AD / Okta / Azure AD group mapping',
    a: 'Works with whatever identity system they already have. Groups sync automatically.',
  },
  {
    q: '"Can the marketing team see patient data?"',
    a: 'One click, definitive answer, with evidence.',
  },
];

const benchmarkRows = [
  { metric: 'Cold query avg', live: '146ms', materialized: '57ms', improvement: '2.6x' },
  { metric: 'Paginated query avg', live: '216ms', materialized: '58ms', improvement: '3.7x' },
  { metric: 'Sequential burst p50', live: '33ms', materialized: '33ms', improvement: 'Baseline' },
];

const features = [
  { icon: Zap, title: 'Real-Time Unified API', description: 'Query all your systems from one endpoint. No waiting for batch jobs. No stale data. Changes propagate instantly across your entire data ecosystem.' },
  { icon: Shield, title: 'Zero Migration Risk', description: 'Your systems stay exactly where they are. No downtime. No cutover weekends. No "we hope this works" moments. Just seamless integration.' },
  { icon: GitBranch, title: 'TOON AI Auto-Mapping', description: 'Our AI reads your schemas and maps them to a unified ontology automatically. Schema changes? We adapt. No manual intervention required.' },
  { icon: Clock, title: 'Knowledge Preservation', description: "When people leave, their tribal knowledge doesn't. The system understands your data structures, so you're never dependent on one person." },
  { icon: CheckCircle2, title: 'Production-Safe', description: "Read-only connections to your systems by default. We don't touch your production data unless you explicitly want write capabilities." },
  { icon: Database, title: 'Data Product Governance', description: 'Define data products with access scopes, owner domains, environments, and field-level permissions. Your data contracts live in the platform.' },
];

export default function IntegriusCorePage() {
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
                <p className="text-2xl font-semibold text-[#00B8D4]">The Unified Enterprise Data Layer</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  The backbone that changes everything. Connect all your systems into one unified, real-time API, without data lakes, rewrites, migrations, or retiring old systems.
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

        {/* What Makes Core Different */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                What Makes Core Different
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                This is the foundation layer enterprises have needed for 20 years. Query everything from one endpoint. Zero dependency on system retirements.
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl border bg-black/30 border-white/10"
                  >
                    <feature.icon className="w-8 h-8 mb-4 text-[#00B8D4]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/80">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* 13 Connectors Table */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                13 Connectors, All Included at Every Tier
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                No connector marketplace. No add-on fees. Every connector ships with every plan.
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

        {/* Event-Driven Architecture */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Analytics as a Byproduct, Not a Bolt-On
                </h2>
              </div>
              <p className="text-lg text-center mb-4 max-w-3xl mx-auto text-white/80">
                34 event types across 13 categories. Every state change emits an event.
              </p>
              <p className="text-center mb-12 max-w-3xl mx-auto text-white/60 italic">
                This is not a logging system bolted on after the fact. It is the architecture.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {eventConsequences.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="font-semibold text-cyan-400 mb-2">{item.heading}</p>
                    <p className="text-white/70 text-sm">{item.body}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Permission Explorer */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Eye className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Permission Explorer: The Feature That Unblocks Data Sharing
                </h2>
              </div>
              <p className="text-lg text-center mb-8 max-w-3xl mx-auto text-white/80">
                Companies don&apos;t share data internally because they cannot prove who has access. Permission Explorer proves it, visually.
              </p>

              {/* Blast radius / dependency graph */}
              <div className="rounded-xl overflow-hidden border border-cyan-500/20 mb-10 shadow-2xl shadow-cyan-500/10">
                <img
                  src="/screenshots/integrius-dependency-graph.gif"
                  alt="Integrius dependency graph and blast radius"
                  className="w-full"
                />
                <div className="px-4 py-2 bg-black/60 border-t border-white/10 text-center">
                  <p className="text-xs text-white/40">Dependency graph and blast radius. See the full impact of any change before you make it.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {permissionFeatures.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="font-semibold text-cyan-400 mb-2">{item.q}</p>
                    <p className="text-white/70 text-sm">{item.a}</p>
                  </motion.div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-8">
                <p className="text-center text-white/60 text-sm uppercase tracking-wider font-semibold mb-6">Real Examples</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }} viewport={{ once: true }}
                    className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">Pharma</p>
                    <p className="text-white/80 text-sm">
                      Compliance officer verifies PII access for a GxP audit. <span className="text-white/50">Old way: 2-week manual audit.</span> <span className="text-cyan-400 font-semibold">With Permission Explorer: 10 seconds.</span>
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">Banking</p>
                    <p className="text-white/80 text-sm">
                      Regulatory team proves KYC data access controls for MiFID II with timestamped audit export.
                    </p>
                  </motion.div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Materialization Engine */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.3}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Layers className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  Materialization Engine
                </h2>
              </div>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Live queries are instant. Materialized snapshots make them faster. Your choice, per product.
              </p>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Metric</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Live Pipeline</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Materialized</th>
                      <th className="text-left py-3 px-4 text-cyan-400 font-semibold uppercase tracking-wider">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarkRows.map((row, index) => (
                      <motion.tr
                        key={row.metric}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.08 }} viewport={{ once: true }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium">{row.metric}</td>
                        <td className="py-3 px-4 text-white/60">{row.live}</td>
                        <td className="py-3 px-4 text-white/80">{row.materialized}</td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{row.improvement}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-bold text-cyan-400 mb-1">41ms</p>
                  <p className="text-sm text-white/60">Snapshot creation for 2,230 records from 10 sources</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-bold text-cyan-400 mb-1">1 min–24 hr</p>
                  <p className="text-sm text-white/60">Configurable refresh intervals</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-2xl font-bold text-cyan-400 mb-1">Graceful</p>
                  <p className="text-sm text-white/60">Stale snapshot served if refresh fails. Never a dead endpoint.</p>
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
              <p className="text-lg text-white/80 text-center max-w-2xl">See how Integrius Core eliminates integration hell and gives you one API for everything.</p>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Talk to Our Team <ArrowRight className="h-5 w-5" />
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
