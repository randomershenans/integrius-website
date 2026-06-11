'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  BarChart2,
  FileText,
  Bell,
  Eye,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Shield,
  Share2,
  Network,
  Presentation,
  RefreshCw,
  Mail,
  Lock,
} from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

// How an answer happens
const answerSteps = [
  {
    step: '1',
    title: 'You ask',
    description: '"Which trial sites have the highest dropout rate?" Plain English. No SQL, no semantic model, no dashboard to find.',
  },
  {
    step: '2',
    title: 'Optic resolves',
    description: 'Optic works out which governed data products answer the question, using the same ownership and schema metadata Core already maintains.',
  },
  {
    step: '3',
    title: 'Core enforces',
    description: 'Data is fetched live through Core with your identity. RBAC is applied before the query runs. You can never see data you are not permitted to see.',
  },
  {
    step: '4',
    title: 'The answer appears',
    description: 'A local LLM composes KPIs, the right chart, a forecast, and a written summary. The answer is the dashboard.',
  },
];

// Feature ecosystem
const features = [
  {
    icon: MessageSquare,
    title: 'Ask',
    description: 'One-shot Q&A. A question in, a complete answer out: KPIs, chart, narrative.',
  },
  {
    icon: Eye,
    title: 'Explore',
    description: 'Multi-turn analysis with context. "Show me revenue" then "break it down by tier" then "just enterprise". Each question builds on the last.',
  },
  {
    icon: BarChart2,
    title: 'Around 30 chart types',
    description: 'D3 sankey, force network, sunburst, stream, spiral, and geo maps alongside every standard chart. Optic picks the right one for the answer.',
  },
  {
    icon: TrendingUp,
    title: 'Forecasting',
    description: 'Exponential smoothing and linear regression with 95% confidence bands. Projections on any metric, no data science team required.',
  },
  {
    icon: Bell,
    title: 'Watchers',
    description: 'Threshold, change, absence, and anomaly alerts, each with AI-generated context explaining what moved and why it matters.',
  },
  {
    icon: Mail,
    title: 'Scheduled Briefs',
    description: 'Auto-emailed intelligence reports. The Monday morning state of the business, written and delivered without anyone asking.',
  },
  {
    icon: BarChart2,
    title: 'Dashboards',
    description: 'Pin any answer as a tile. Multi-tile grids with persistent, shareable URLs that always show live data.',
  },
  {
    icon: FileText,
    title: 'Report templates',
    description: '5+ templates with time period selection, executive summary, and recommendations.',
  },
  {
    icon: Presentation,
    title: 'PDF and PPTX export',
    description: 'Board-ready decks from a single question. Ask, review, export, present.',
  },
  {
    icon: Share2,
    title: 'No-login share links',
    description: 'Share an answer with anyone, no account needed. Every view lands in the audit trail.',
  },
  {
    icon: Network,
    title: 'Entity resolution',
    description: 'Optic knows "Acme" and "Acme Corp" are the same company, across every data product.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time schema updates',
    description: 'Server-sent events keep Optic in sync with Core. New fields and products appear as soon as they are governed.',
  },
];

// Honest comparison
const comparisonRows = [
  {
    concern: 'How you get an answer',
    others: 'Find or build the right dashboard first',
    optic: 'Ask the question. The answer is the dashboard.',
  },
  {
    concern: 'Where the AI runs',
    others: 'Vendor cloud (Tableau Cloud, Azure, Google)',
    optic: 'Inside your network. Ollama on-prem by default.',
  },
  {
    concern: 'Does data leave your network?',
    others: 'Yes, for cloud AI features',
    optic: 'Never',
  },
  {
    concern: 'Governance',
    others: 'Bolted on per workbook or workspace',
    optic: 'Enforced upstream by Core. RBAC applies before the query runs.',
  },
  {
    concern: 'Per-query AI cost',
    others: 'Metered cloud AI consumption',
    optic: 'None. Local inference, flat platform pricing.',
  },
  {
    concern: 'Pricing model',
    others: 'Per seat',
    optic: 'Per governed data product. Everyone in the org can ask.',
  },
  {
    concern: 'Forecasting',
    others: 'Separate feature or add-on',
    optic: 'Built in, with 95% confidence bands',
  },
];

export function OpticClient() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="w-full px-4 md:px-8 lg:px-12 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-medium">
                  The AI analytics layer on Integrius Core
                </div>
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none text-white">
                  Integrius Optic
                </h1>
                <p className="text-xl font-semibold text-cyan-400 max-w-4xl mx-auto">
                  Ask a question in plain English. Get KPIs, the right chart, a forecast, and a written summary. Nothing leaves your network.
                </p>
                <p className="mx-auto max-w-3xl text-white/80 text-lg md:text-xl leading-relaxed">
                  Optic resolves which governed data products answer your question, fetches live data through Core, and a local LLM composes the answer. On-prem inference via Ollama by default. No OpenAI. No data exfiltration. No per-query bill.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold transition-all"
                >
                  Start a Pilot <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-cyan-500/40 hover:border-cyan-400/70 text-white/90 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all bg-white/5"
                >
                  Schedule a Demo
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How an answer happens */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-3 text-white">
                How an Answer Happens
              </h2>
              <p className="text-center text-white/60 mb-12 text-lg max-w-3xl mx-auto">
                Four steps between a question and a board-ready answer. Governance is not a checkbox at the end, it is step three.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {answerSteps.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="text-3xl font-bold mb-3 text-cyan-400">{item.step}</div>
                    <h3 className="font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* On-prem AI differentiator */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement
              className="p-8 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 border border-cyan-500/25 backdrop-blur-lg rounded-xl"
              delay={0.3}
            >
              <div className="flex items-start gap-4">
                <Lock className="w-10 h-10 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    The AI runs where your data lives.
                  </h3>
                  <p className="text-white/70 text-lg leading-relaxed max-w-4xl">
                    Every other AI analytics product sends your questions, your schemas, and often your data to someone else&apos;s cloud. Optic runs a local LLM inside your network, on-prem inference via Ollama by default. Your questions never leave. Your data never leaves. And there is no per-query bill quietly growing in the background.
                  </p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Governance-aware answers */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement
              className="p-8 bg-black/50 border border-white/10 backdrop-blur-lg rounded-xl"
              delay={0.3}
            >
              <div className="flex items-start gap-4">
                <Shield className="w-10 h-10 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Governance enforced upstream, not promised downstream.
                  </h3>
                  <p className="text-white/70 text-lg leading-relaxed max-w-4xl">
                    Optic calls Core with the user&apos;s identity, and RBAC is applied before the query runs. A sales analyst asking about revenue sees revenue. The same analyst asking about patient data gets nothing, because Core never returns it. There is no prompt-injection path to data you were never permitted to see.
                  </p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Feature ecosystem */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter text-white mb-3">
                One Question In. A Whole Intelligence Layer Out.
              </h2>
              <p className="text-white/60 text-lg max-w-3xl mx-auto">
                Everything below runs on the same governed data layer. No separate tools, no exports, no copies.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
                    viewport={{ once: true }}
                    className="p-6 rounded-xl border bg-black/40 backdrop-blur-sm border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-6 h-6 flex-shrink-0 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white leading-tight">{feature.title}</h3>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-3 text-white">
                Optic vs Tableau, Power BI, and Looker
              </h2>
              <p className="text-center text-white/60 mb-10 text-lg max-w-3xl mx-auto">
                They are dashboard tools with AI features attached. Optic is answer-first, and it knows the governance graph.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/50 font-medium w-56">Concern</th>
                      <th className="text-left py-3 px-4 text-white/60 font-medium">Tableau / Power BI / Looker</th>
                      <th className="text-left py-3 px-4 text-cyan-400 font-bold bg-cyan-500/10 rounded-t-lg">Integrius Optic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="py-3 px-4 text-white/80 font-medium">{row.concern}</td>
                        <td className="py-3 px-4 text-white/60">{row.others}</td>
                        <td className="py-3 px-4 bg-cyan-500/5 font-medium text-cyan-400">{row.optic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 max-w-3xl mx-auto p-5 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/70 text-sm">
                  <span className="text-cyan-400 font-semibold">And versus Monte Carlo:</span> data observability tools monitor data quality, whether the pipeline ran and the rows arrived. Optic&apos;s watchers monitor data meaning: whether churn is accelerating, whether a metric is behaving abnormally, whether a number a regulator cares about just moved.
                </p>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Deployment */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10" delay={0.2}>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 space-y-3">
                  <h2 className="text-2xl font-bold text-white">Runs entirely inside your network.</h2>
                  <p className="text-white/70 leading-relaxed">
                    Optic deploys next to Core, on your infrastructure. Inference runs on Ollama, on-prem, by default. The same deployment posture that makes Core viable for pharma, banking, and defense applies to the AI layer too: no SaaS dependency, no phone-home, no data leaving the building.
                  </p>
                </div>
                <div className="lg:w-1/2 w-full">
                  <div className="p-5 rounded-lg bg-black/60 border border-white/10">
                    <div className="space-y-3 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Local LLM inference via Ollama, on your hardware</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Connects to Core with the user&apos;s identity, RBAC enforced upstream</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Real-time SSE schema sync with the governed layer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Included with Pilot (lite) and Platform. Add-on for Enterprise and Platform Lite.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement
              className="flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-lg p-12 rounded-xl border border-cyan-500/20"
              delay={0.5}
            >
              <h3 className="text-3xl font-bold text-center text-white">
                Stop building dashboards. Start asking questions.
              </h3>
              <p className="text-lg text-white/70 text-center max-w-2xl">
                Governed answers, on-prem AI, zero data leakage.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all"
                >
                  Start a Pilot <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-cyan-500/40 hover:border-cyan-400/70 text-white/90 hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all bg-white/5"
                >
                  Schedule a Demo
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
