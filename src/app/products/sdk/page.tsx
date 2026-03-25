'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Code, Zap, Package, RefreshCw, Layers, Sparkles, ArrowRight, CheckCircle2, Terminal } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const sdkCards = [
  {
    icon: Package,
    name: 'npm / Node.js',
    install: 'npm install @integrius/sdk',
    installLink: 'https://www.npmjs.com/package/@integrius/sdk',
    description: 'For TypeScript/JavaScript applications, internal tools, and automation',
    bullets: [
      'Full type-safe API with generated TypeScript types',
      'Event stream access — subscribe to 34 event types',
      'Data product queries with pagination, filtering, and projection',
    ],
    accent: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
  {
    icon: Code,
    name: 'Python',
    install: 'pip install integrius',
    installLink: null,
    description: 'For data engineering teams, ML pipelines, and notebooks',
    bullets: [
      'Pandas-friendly output — returns DataFrames directly',
      'Jupyter notebook integration',
      '"The data engineering team writes a script that pulls from the Revenue Analytics data product, joins with internal metrics, and feeds their ML pipeline. 15 lines of code."',
    ],
    accent: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  {
    icon: Terminal,
    name: 'CLI',
    install: 'integrius products list --format json',
    installLink: null,
    description: 'Infrastructure-as-code teams manage data products via CLI + API',
    bullets: [
      '25+ commands covering products, sources, events, and lineage',
      'Zero external dependencies — Node.js built-ins only',
      'JSON and table output modes for scripting and humans',
    ],
    accent: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
  },
];

const features = [
  { icon: Code, title: 'One Schema, Every System', description: 'Pull from Salesforce, PostgreSQL, MySQL, APIs — whatever. Output one clean, consistent data structure every time. No more spaghetti code mapping fields.' },
  { icon: Zap, title: 'Build in Days, Not Months', description: 'Stop spending 80% of dev time on data plumbing. Build the features that actually matter. Ship customer-facing products in days instead of quarters.' },
  { icon: RefreshCw, title: 'Schema Changes? No Problem.', description: 'Upstream systems change all the time. With TOON AI, schema changes don\'t break your code. We adapt automatically. You keep shipping.' },
  { icon: Layers, title: 'Built on Integrius Core', description: 'Get all the power of unified data access with developer-friendly abstractions. The SDK handles complexity. You handle business logic.' },
  { icon: Sparkles, title: 'AI-Powered Auto-Mapping', description: 'TOON understands your data. It maps fields, harmonizes formats, and resolves conflicts automatically. You focus on features, not field mapping.' },
  { icon: CheckCircle2, title: 'Governance Built-In', description: 'Every SDK call respects RBAC, field-level access controls, and consumer scoping. Your governed data stays governed — no shadow API paths.' },
];

const useCases = [
  {
    team: 'Data Engineering',
    example: 'Pull from Revenue Analytics data product → join with internal Snowflake metrics → feed ML churn model. 15 lines of Python. No ETL pipeline.',
  },
  {
    team: 'Backend Engineering',
    example: 'Build a customer 360 API that fans out to CRM, ERP, and analytics in one typed function call. No coordination with 3 platform teams.',
  },
  {
    team: 'DevOps / Platform',
    example: 'Provision data products from CI/CD pipelines. `integrius products create --config products.yaml` in your deploy script.',
  },
  {
    team: 'Internal Tools',
    example: 'Build a Slack bot that answers "how many active trials do we have?" by querying the Pipeline Forecast data product directly.',
  },
  {
    team: 'ML / AI Teams',
    example: 'Feature store replacement. Instead of duplicating data into a vector DB, query your governed products and enrich embeddings at inference time.',
  },
  {
    team: 'Analytics Engineering',
    example: 'Replace Fivetran + dbt + warehouse with: connect source, define data product, expose API. Done.',
  },
];

const nodeExample = `import { IntegriusSDK } from '@integrius/sdk';

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
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="w-full px-4 md:px-8 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Now live on npm
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">Integrius SDK</h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">npm package. Python library. CLI. Three ways to build on your governed data platform.</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  Developer tools for building on top of Integrius. Pull governed data products into your applications, pipelines, and automation — without writing integration plumbing.
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

        {/* Three SDK Cards */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Three Ways to Build
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Pick the interface that fits your team. All three access the same governed data platform.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                {sdkCards.map((card, index) => (
                  <motion.div
                    key={card.name}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className={`p-6 rounded-xl border ${card.border} ${card.bg}`}
                  >
                    <card.icon className={`w-8 h-8 mb-3 ${card.accent}`} />
                    <h3 className="text-xl font-bold mb-2 text-white">{card.name}</h3>
                    {card.installLink ? (
                      <a href={card.installLink} target="_blank" rel="noopener noreferrer" className={`inline-block font-mono text-xs px-3 py-1.5 rounded bg-black/40 border border-white/10 mb-3 hover:border-white/30 transition-colors ${card.accent}`}>
                        {card.install}
                      </a>
                    ) : (
                      <code className={`inline-block font-mono text-xs px-3 py-1.5 rounded bg-black/40 border border-white/10 mb-3 ${card.accent}`}>
                        {card.install}
                      </code>
                    )}
                    <p className="text-white/70 text-sm mb-4">{card.description}</p>
                    <ul className="space-y-2">
                      {card.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${card.accent}`} />
                          <span className="text-xs text-white/60">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                This Simple. This Powerful.
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                No more writing thousands of lines of glue code. Install, connect, build.
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
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">The SDK that makes complex data integration feel like writing a REST call.</p>
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

        {/* What Teams Are Building */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.4}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                What Teams Are Building
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">Real use cases. Real teams. Concrete outcomes.</p>
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
              <p className="text-lg text-white/80 text-center max-w-2xl">Three SDKs. One governed platform. Start building with real data in minutes.</p>
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
