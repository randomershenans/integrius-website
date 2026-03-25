'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Users, Layers, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const whatItIs = [
  'A single search API across all unified data products',
  'Fully schema-aware (searches fields by meaning, not column names)',
  'Entity-keyed (results are grouped by customer, transaction, account, etc.)',
  'Governance-aware (respects access, domains, environments, scopes)',
  'API-first. No UI opinions. No manual indexing.',
];

const whatItIsNot = [
  'Not a search UI or end-user application',
  'Not Elastic, Algolia, or OpenSearch',
  'Not a data lake query tool',
  'Not a separate system to manage or tune',
];

const howItWorks = [
  { step: '1', title: 'Connect data sources', description: 'Your databases, APIs, and SaaS tools' },
  { step: '2', title: 'Map to standard fields', description: 'Define your canonical schema' },
  { step: '3', title: 'Create data products', description: 'Build governed API contracts' },
  { step: '4', title: 'Search API appears automatically', description: 'Ready to consume' },
];

const capabilities = [
  { capability: 'Federated search', details: 'One API call spans all data products the caller has access to' },
  { capability: 'Fuzzy matching', details: 'Levenshtein distance, 70% similarity threshold. Typos still find results.' },
  { capability: 'Semantic search', details: 'Intent-based matching: "revenue data" finds mrr, arr, monthly_recurring_revenue' },
  { capability: 'Autocomplete', details: 'Suggest endpoint returns matching products, fields, entity types as you type' },
  { capability: 'Faceted results', details: 'Counts by product and entity type for drill-down' },
  { capability: 'Relevance scoring', details: '0–100: exact key match (100), name match (90), substring (60), fuzzy (30)' },
  { capability: 'Result highlights', details: 'Context snippets showing exactly where and how the query matched' },
  { capability: 'Entity resolution', details: '"Acme" finds "Acme Corporation", "ACME_CORP", "Acme Ltd" via 6-strategy matching' },
  { capability: 'Search analytics', details: 'Top queries, zero-result tracking, average response time' },
  { capability: 'Governed by design', details: 'Respects RBAC, field-level access, consumer scoping, org isolation' },
];

const governanceFeatures = [
  'Respects data product access scopes (public / shared / restricted)',
  'Environment-aware (dev / test / prod)',
  'Domain ownership enforced',
  'Search results are explainable. You can see where data came from',
  'No shadow access paths created',
];

const personas = [
  { title: 'Executives', points: ['Find answers without knowing systems', 'Trust results because they\'re governed'] },
  { title: 'Data & Platform Teams', points: ['One search surface instead of dozens', 'No duplicate indexing infrastructure'] },
  { title: 'Product & Ops Teams', points: ['Search customers, orders, activity across systems', 'Zero schema knowledge required'] },
];

const pricingTiers = [
  { name: 'Pilot', search: 'Not available', price: '—', highlight: false },
  { name: 'Enterprise', search: 'Premium add-on', price: '€100,000/year', highlight: false },
  { name: 'Platform Lite', search: 'Premium add-on', price: '€100,000/year', highlight: false },
  { name: 'Platform', search: 'Included', price: '—', highlight: true },
];

const competitors = [
  { name: 'Elastic', charge: '€50k–500k/year', what: 'Search your own indexed data', highlight: false },
  { name: 'Algolia', charge: '€10k–100k/year', what: 'Frontend search, API calls', highlight: false },
  { name: 'Coveo', charge: '€100k–1M/year', what: 'Enterprise search + AI', highlight: false },
  { name: 'Glean', charge: '€200k+/year', what: 'Workplace search', highlight: false },
  { name: 'Integrius Search', charge: '€100k/year', what: 'Live governed data, no indexing, unified across all products', highlight: true },
];

export default function IntegriusSearchPage() {
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
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">Unified Search API</h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">Expose a single, governed search API across all your systems.</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  Schema-aware search generated automatically from your data contracts. No indexing. No sync jobs. Just API endpoints.
                </p>
                <p className="text-lg font-medium text-cyan-400">If your data is unified, it is already searchable via API.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-4">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  See How It Works <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#pricing" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  View Pricing
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What This Is */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">What This Is</h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">Search endpoints are generated automatically from your unified data contracts.</p>
              <div className="max-w-3xl mx-auto space-y-4">
                {whatItIs.map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <p className="text-lg text-white/80">{item}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* What This Is Not */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">What This Is Not</h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Unified Search is an API layer, not a UI. It queries live data through the Integrius integration layer. Your applications consume the API.
              </p>
              <div className="max-w-3xl mx-auto space-y-4">
                {whatItIsNot.map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="flex items-start gap-3">
                    <XCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-red-400" />
                    <p className="text-lg text-white/60">{item}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">How Unified Search Works</h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                No configuration. No setup screen. No index definitions. Search is a by-product of unification, not a separate feature.
              </p>
              <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {howItWorks.map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="text-center p-6 rounded-xl bg-white/5">
                    <div className="text-3xl font-bold mb-2 text-cyan-400">{item.step}</div>
                    <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Search Capabilities Table */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Search Capabilities
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Ten capabilities in a single governed API call. No stitching. No fan-out to manage.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Capability</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capabilities.map((row, index) => (
                      <motion.tr
                        key={row.capability}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }} viewport={{ once: true }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-cyan-400 whitespace-nowrap">{row.capability}</td>
                        <td className="py-3 px-4 text-white/70">{row.details}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
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
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">Built for Governed Environments</h2>
              </div>
              <div className="max-w-3xl mx-auto space-y-4 mt-8">
                {governanceFeatures.map((item, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <p className="text-lg text-white/80">{item}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Who Uses It */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-8">
                <Users className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">Who Uses Unified Search</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {personas.map((persona, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-semibold mb-4 text-white">{persona.title}</h3>
                    <ul className="space-y-2">
                      {persona.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-1 text-cyan-400" />
                          <span className="text-sm text-white/70">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Competitor Context */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Why Not Elastic or Algolia?
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Enterprise search is broken: Elasticsearch requires a dedicated infrastructure team, Algolia sends data to the cloud, Coveo costs six figures and still needs indexing pipelines. Integrius Search searches your governed data products directly.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Competitor</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">What They Charge</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">What They Do</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((row, index) => (
                      <motion.tr
                        key={row.name}
                        initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.06 }} viewport={{ once: true }}
                        className={`border-b transition-colors ${row.highlight ? 'bg-cyan-500/10 border-cyan-500/30' : 'border-white/5 hover:bg-white/5'}`}
                      >
                        <td className={`py-3 px-4 font-semibold ${row.highlight ? 'text-cyan-400' : 'text-white/80'}`}>{row.name}</td>
                        <td className={`py-3 px-4 ${row.highlight ? 'text-cyan-400 font-semibold' : 'text-white/60'}`}>{row.charge}</td>
                        <td className={`py-3 px-4 ${row.highlight ? 'text-white font-medium' : 'text-white/60'}`}>{row.what}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Layers className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">Pricing</h2>
              </div>
              <p className="text-center mb-2 text-white/80 text-xl font-semibold">Search is not a feature. It&apos;s a product.</p>
              <p className="text-center mb-10 text-white/50 text-sm">Available as a premium add-on, or included in Platform tier.</p>
              <div className="overflow-x-auto mb-8">
                <table className="w-full text-sm max-w-3xl mx-auto">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Tier</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Search</th>
                      <th className="text-left py-3 px-4 text-white/60 font-semibold uppercase tracking-wider">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingTiers.map((tier, index) => (
                      <motion.tr
                        key={tier.name}
                        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.08 }} viewport={{ once: true }}
                        className={`border-b transition-colors ${tier.highlight ? 'bg-cyan-500/10 border-cyan-500/30' : 'border-white/5 hover:bg-white/5'}`}
                      >
                        <td className={`py-3 px-4 font-semibold ${tier.highlight ? 'text-cyan-400' : 'text-white'}`}>{tier.name}</td>
                        <td className={`py-3 px-4 ${tier.highlight ? 'text-emerald-400 font-semibold' : 'text-white/60'}`}>{tier.search}</td>
                        <td className={`py-3 px-4 font-bold ${tier.highlight ? 'text-white/40' : tier.price === '—' ? 'text-white/30' : 'text-cyan-400'}`}>{tier.price}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="max-w-3xl mx-auto p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/70 text-sm">
                  <span className="text-cyan-400 font-semibold">Why €100,000/year?</span> Integrius Search is different from Elastic or Algolia. It searches live governed data with no indexing required. One API call, complete picture, governed results.
                </p>
              </div>
              <p className="text-center text-sm text-white/40 mt-4">Requires an active Integrius unified data layer.</p>
            </FloatingElement>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Search isn&apos;t a feature. It&apos;s a consequence.</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">Unify your data. Search everything.</p>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Talk to Us <ArrowRight className="h-5 w-5" />
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
