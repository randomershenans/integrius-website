'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code, Zap, Package, RefreshCw, Layers, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const features = [
  { icon: Code, title: 'One Schema, Every System', description: 'Pull from SAP, Salesforce, MySQL, APIs—whatever. Output one clean, consistent data structure every time. No more spaghetti code mapping fields.' },
  { icon: Zap, title: 'Build in Days, Not Months', description: 'Stop spending 80% of dev time on data plumbing. Build the features that actually matter. Ship customer-facing products in days instead of quarters.' },
  { icon: Package, title: 'Plug-and-Play Integration', description: 'npm install, point it at your data sources, start building. No PhD in distributed systems required. Just clean, simple APIs that make sense.' },
  { icon: RefreshCw, title: 'Schema Changes? No Problem.', description: 'Upstream systems change all the time. With TOON AI, schema changes don\'t break your code. We adapt automatically. You keep shipping.' },
  { icon: Layers, title: 'Built on Integrius Core', description: 'Get all the power of unified data access with developer-friendly abstractions. The SDK handles complexity. You handle business logic.' },
  { icon: Sparkles, title: 'AI-Powered Auto-Mapping', description: 'TOON understands your data. It maps fields, harmonizes formats, and resolves conflicts automatically. You focus on features, not field mapping.' },
];

const useCases = [
  'Build internal tools that pull from 5+ systems without writing integration code',
  'Ship customer-facing features that need data from CRM, ERP, and legacy DBs',
  'Create automation workflows that span disconnected systems',
  'Build analytics features without waiting for the data team',
  'Prototype new products in days using real production data',
  'Turn 3-month integration projects into 3-day sprints',
];

const codeExample = `import { IntegriusSDK } from '@integrius/sdk';

const integrius = new IntegriusSDK({
  apiKey: process.env.INTEGRIUS_API_KEY
});

// Query unified data across all your systems
const customer = await integrius.customers.get('customer_123');

// Returns unified schema - same structure every time
console.log({
  id: customer.id,
  name: customer.name,
  email: customer.email,
  orders: customer.orders,      // From ERP
  support: customer.support,    // From CRM
  usage: customer.usage         // From Analytics DB
});

// One object. Multiple systems. Zero integration code.`;

export default function IntegriusSDKPage() {
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Now live on npm
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">Integrius SDK</h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">Build Faster With Unified Data</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  For developers and product teams. Pull from multiple systems, output one clean structure. Build internal tools, customer features, or automation in days instead of months.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-4">
                <a href="https://www.npmjs.com/package/@integrius/sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Install SDK <ArrowRight className="h-4 w-4" />
                </a>
                <a href="https://github.com/randomershenans/integrius-sdk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-5 py-3 rounded-lg font-semibold hover:border-white/40 hover:text-white transition-all">
                  View on GitHub
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                This Simple. This Powerful.
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                No more writing thousands of lines of glue code. Just install, connect, and build.
              </p>
              <div className="max-w-4xl mx-auto">
                <pre className="p-6 rounded-xl overflow-x-auto bg-gray-900/50 text-sm">
                  <code className="text-gray-100 font-mono whitespace-pre">{codeExample}</code>
                </pre>
              </div>
            </FloatingElement>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.3}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Turn Developers into 10x Integrators
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">The SDK that makes complex data integration feel like magic.</p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 rounded-xl border bg-black/30 border-white/10">
                    <feature.icon className="w-8 h-8 mb-4 text-[#00B8D4]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-white/80">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.4}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                What Teams Are Building
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">Real products. Real companies. Real "wait, that only took 3 days?" moments.</p>
              <div className="max-w-3xl mx-auto space-y-4">
                {useCases.map((useCase, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-[#00B8D4]" />
                    <p className="text-lg text-white/80">{useCase}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Ready to Ship Features, Not Integrations?</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">The SDK is live. Install it now and start building with unified data in minutes.</p>
              <div className="mt-8 flex items-center gap-4">
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
