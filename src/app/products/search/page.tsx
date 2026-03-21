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

const searchableEntities = [
  'Customers (email, name, ID, attributes)',
  'Transactions (amounts, dates, references)',
  'Accounts',
  'Orders',
  'Any custom entity defined in your standard schema',
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
  { name: 'Team', scope: 'Single data product', price: '$500 / month' },
  { name: 'Professional', scope: 'Multiple data products', price: '$1,500 / month' },
  { name: 'Enterprise', scope: 'Org-wide unified search', price: '$4,000 / month' },
];

export default function IntegriusSearchPage() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="container px-4 md:px-6 relative z-10">
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

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
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

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
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

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
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

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">What You Can Search Across</h2>
              <p className="text-lg text-center mb-8 max-w-3xl mx-auto text-white/80">
                Results are grouped by entity, deduplicated across sources, and scoped to your permissions.
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                {searchableEntities.map((entity, index) => (
                  <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.05 }} viewport={{ once: true }} className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {entity}
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
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

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
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

        <section id="pricing" className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Layers className="w-8 h-8 text-cyan-400" />
                <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">Pricing</h2>
              </div>
              <p className="text-center mb-8 text-white/70">Search pricing is based on organisational scope, not data volume.</p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                {pricingTiers.map((tier, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className={`p-6 rounded-xl text-center ${index === 2 ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/10 border-2 border-cyan-500/50' : 'bg-white/5 border border-white/10'}`}
                  >
                    <h3 className="text-xl font-bold mb-2 text-white">{tier.name}</h3>
                    <p className="text-sm mb-4 text-white/60">{tier.scope}</p>
                    <p className={`text-2xl font-bold ${index === 2 ? 'text-cyan-400' : 'text-white'}`}>{tier.price}</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-sm text-white/50">Requires an active Integrius unified data layer.</p>
            </FloatingElement>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
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
