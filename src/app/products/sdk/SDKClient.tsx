'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code, Zap, RefreshCw, Layers, ArrowRight, CheckCircle2, Shield, GitBranch } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const features = [
  {
    icon: Layers,
    title: 'One Endpoint per Business Concept',
    description: 'Customer 360. Revenue analytics. Trial enrollment. Each governed data product is one stable endpoint, not a scavenger hunt across systems.',
  },
  {
    icon: GitBranch,
    title: 'Stable Versioned Contracts',
    description: 'You build against the data product contract, not the source schema. Sources can change behind the layer; your code keeps working.',
  },
  {
    icon: Code,
    title: 'Typed End to End',
    description: 'A typed client with full TypeScript support. Your editor knows the shape of every data product before you run a single request.',
  },
  {
    icon: Zap,
    title: 'No Point-to-Point Integration Code',
    description: 'Stop writing glue between every app and every system. The unified layer already did the joining, mapping, and governing.',
  },
  {
    icon: Shield,
    title: 'Governance Built In',
    description: 'Every SDK call goes through Core. RBAC, field-level access, and the audit chain apply to your code the same as to every other consumer.',
  },
  {
    icon: RefreshCw,
    title: 'Built on Integrius Core',
    description: 'Scoped API keys with IP allowlists and rate limits, signed webhooks, and OpenAPI docs. Everything the platform offers, from code.',
  },
];

const useCases = [
  {
    team: 'Data Engineering',
    example: 'Pull from a Revenue Analytics data product, join with internal metrics, feed the ML pipeline. No bespoke ETL to write or maintain.',
  },
  {
    team: 'Backend Engineering',
    example: 'Build a customer 360 API on one governed endpoint instead of fanning out to CRM, ERP, and analytics yourself.',
  },
  {
    team: 'Internal Tools',
    example: 'Build a Slack bot that answers "how many active trials do we have?" by querying a data product directly.',
  },
  {
    team: 'ML / AI Teams',
    example: 'Query governed products and enrich features at inference time instead of duplicating data into yet another store.',
  },
];

const nodeExample = `import { IntegriusSDK } from '@integrius/sdk';

const integrius = new IntegriusSDK({
  apiKey: process.env.INTEGRIUS_API_KEY
});

// One endpoint per business concept.
// "customer-360" is a governed data product:
// owned, versioned, audited.
const customer = await integrius.dataProducts
  .query('customer-360', { entityId: 'customer_123' });

console.log({
  id: customer.id,
  name: customer.name,
  orders: customer.orders,      // joined from ERP
  support: customer.support,    // joined from CRM
  usage: customer.usage         // joined from analytics
});

// One object. Multiple systems. Zero integration code.`;

export function SDKClient() {
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live on npm
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">Integrius SDK</h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">A typed client for governed data products.</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  One endpoint per business concept. Stable versioned contracts. No point-to-point integration code. Pull governed data products into your applications, pipelines, and automation in minutes.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
                <a href="https://www.npmjs.com/package/@integrius/sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  npm install @integrius/sdk <ArrowRight className="h-4 w-4" />
                </a>
                <a href="https://github.com/randomershenans/integrius-sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-5 py-3 rounded-lg font-semibold hover:border-white/40 hover:text-white transition-all">
                  View on GitHub
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                The Whole Integration, in One Call
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                The hard part already happened in the unified layer: connecting sources, mapping fields, joining entities, enforcing access. What is left for your code is a function call.
              </p>
              <div className="w-full">
                <pre className="p-6 rounded-xl overflow-x-auto bg-gray-900/50 text-sm">
                  <code className="text-gray-100 font-mono whitespace-pre">{nodeExample}</code>
                </pre>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* SDK Capabilities */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.3}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Built for Integration Work
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">Contracts instead of glue code. Governance instead of hope.</p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 rounded-xl border bg-black/30 border-white/10">
                    <feature.icon className="w-8 h-8 mb-4 text-[#00B8D4]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/80 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* What Teams Build */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.4}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                What Teams Build With It
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">Anywhere code needs governed data, the SDK is the shortest path.</p>
              <div className="grid md:grid-cols-2 gap-6">
                {useCases.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }} viewport={{ once: true }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">{item.team}</p>
                    <p className="text-white/70 text-sm">{item.example}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Ready to Ship Features, Not Integrations?</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">One typed client. One governed platform. Start building with real data in minutes.</p>
              <div className="mt-8 flex items-center gap-4 flex-wrap justify-center">
                <a href="https://www.npmjs.com/package/@integrius/sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  npm install @integrius/sdk <ArrowRight className="h-5 w-5" />
                </a>
                <Link href="/contact" className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-lg font-semibold text-lg hover:border-white/40 hover:text-white transition-all">
                  Talk to us
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
