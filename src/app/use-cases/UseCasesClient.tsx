'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, FlaskConical, Building2, Cpu, CheckCircle2 } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const pharmaTimeline = [
  {
    label: 'Day 1',
    items: [
      'Deploy Core inside their VPC (air-gapped). Connect all 10 sources via setup wizard — no code, no ETL pipelines.',
      'Create "Unified Oncology View" data product.',
    ],
  },
  {
    label: 'Day 2',
    items: [
      'Search: "Find all patients in the BEACON-3 trial" — federated results from trial management AND lab results AND adverse events.',
      'Optic: "Which clinical trial has the most missing data?" — instant KPI showing BEACON-3 at 23% missing fields.',
      'Optic: "Which trial sites have the highest dropout rate?" — ranked table + bar chart + narrative.',
    ],
  },
  {
    label: 'Week 1',
    items: [
      'Permission Explorer: compliance officer verifies marketing team CANNOT see patient PII in 10 seconds instead of a 2-week audit.',
      'Forecast: "Predict enrollment completion for BEACON-3" — best-case (August) and worst-case (November).',
      'Simulation: "What if we add 2 more trial sites?" — enrollment completion pulls forward by 6 weeks.',
    ],
  },
];

const bankingTimeline = [
  {
    label: 'Day 1',
    items: [
      'Connect all 8 sources.',
      'Entity resolution discovers "Acme Holdings Ltd" (CRM), "ACME_HOLDINGS" (trading), "Acme Holdings PLC" (billing), and "acme-holdings" (compliance) are the same entity — automatically.',
    ],
  },
  {
    label: 'Day 3',
    items: [
      'Search: "Acme Holdings" — unified entity card from ALL 8 systems, conflict detection flagging address discrepancy (severity: HIGH).',
      'Optic: "What\'s our exposure to Acme Holdings?" — aggregated view with KPIs and trend chart.',
    ],
  },
  {
    label: 'Ongoing',
    items: [
      'Watchers: Forecast watcher fires 45 minutes before a transaction volume threshold is breached.',
      'Permission Explorer: proves KYC data access controls for MiFID II with timestamped export.',
      'GDPR: "Right to erasure" — one API call traces all records across all 8 systems via lineage.',
    ],
  },
];

const techTimeline = [
  {
    label: 'Day 1',
    items: [
      'Connect everything — 3 Salesforce instances, 2 BigQuery projects, REST API, Kafka topics. 14 sources, 20 minutes.',
      'Create 5 data products: Unified Customer, Revenue Analytics, Product Usage, Support Health, Pipeline Forecast.',
    ],
  },
  {
    label: 'Day 2',
    items: [
      'Lineage graph — for the first time, VP of Data can see visually how every source connects to every product.',
    ],
  },
  {
    label: 'Day 3',
    items: [
      'CEO asks "What\'s our revenue growth by region?" in a board prep meeting. Instead of a 2-week data team project, the answer appears in 3 seconds.',
    ],
  },
  {
    label: 'Week 2',
    items: [
      'Entity resolution finds "Acme Inc" (Salesforce 1), "Acme Incorporated" (Salesforce 2), and "acme_inc" (BigQuery) are the same customer. 200+ duplicate entities resolved automatically.',
    ],
  },
];

function TimelineSection({ items }: { items: { label: string; items: string[] }[] }) {
  return (
    <div className="space-y-6">
      {items.map((block, blockIndex) => (
        <motion.div
          key={block.label}
          initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: blockIndex * 0.1 }} viewport={{ once: true }}
          className="flex gap-4"
        >
          <div className="flex-shrink-0 w-16">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-1">
              {block.label}
            </span>
          </div>
          <div className="flex-1 space-y-2 pt-0.5">
            {block.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400/60" />
                <p className="text-white/70 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function UseCasesClient() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="min-h-[60vh] flex items-center justify-center relative">
          <div className="w-full px-4 md:px-8 relative z-10">
            <div className="flex flex-col items-center space-y-6 text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">
                  Industry Scenarios
                </h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">Real problems. Real industries. Real results.</p>
                <p className="mx-auto max-w-[700px] text-white/70 text-lg md:text-xl">
                  These are not hypotheticals. They are the exact challenges we were built to solve.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-4 flex-wrap justify-center">
                <a href="#pharma" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  Pharma
                </a>
                <a href="#banking" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  Banking
                </a>
                <a href="#enterprise-tech" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  Enterprise Tech
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pharma */}
        <section id="pharma" className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <FlaskConical className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">Scenario 1 — Pharma</p>
                  <h2 className="text-2xl font-bold text-white">10 Oncology Sources, 4 Months, Got Nowhere</h2>
                </div>
              </div>

              {/* The Problem */}
              <div className="mb-8 p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">The Problem</p>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  A top-20 pharma company needs to unify 10 oncology data sources — clinical trial management (Oracle), patient registries (Postgres), lab results (REST API), adverse events (MSSQL), and research publications (S3 CSV exports).
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  They spent 4 months with an internal team and a systems integrator. Result: a stale weekly CSV dump that breaks every time a schema changes.
                </p>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">With Integrius</p>
                <TimelineSection items={pharmaTimeline} />
              </div>

              {/* Result */}
              <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Result</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  What took 4 months and failed is now running in production, governed, with lineage.{' '}
                  <span className="text-cyan-400 font-semibold">For €5K/month.</span>
                </p>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Banking */}
        <section id="banking" className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">Scenario 2 — Banking</p>
                  <h2 className="text-2xl font-bold text-white">8 Systems, 1 Customer, 8 Different Names</h2>
                </div>
              </div>

              {/* The Problem */}
              <div className="mb-8 p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">The Problem</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  A mid-tier investment bank has KYC data in 8 systems. When compliance asks &quot;show me everything about Acme Holdings&quot;, a junior analyst spends 2 days manually searching each system.
                </p>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">With Integrius</p>
                <TimelineSection items={bankingTimeline} />
              </div>

              {/* Result */}
              <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Result</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">2 days → 2 seconds</p>
                    <p className="text-sm text-white/60">Compliance query time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">40%</p>
                    <p className="text-sm text-white/60">Duplicate records eliminated by entity resolution</p>
                  </div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Enterprise Tech */}
        <section id="enterprise-tech" className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Cpu className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">Scenario 3 — Enterprise Tech (Series D SaaS)</p>
                  <h2 className="text-2xl font-bold text-white">Data Mesh in Production in 2 Weeks, Not 6 Months</h2>
                </div>
              </div>

              {/* The Problem */}
              <div className="mb-8 p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">The Problem</p>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  A Series D SaaS company has 3 Salesforce instances, 2 data warehouses, a legacy REST API, and Kafka streams. VP of Data was hired to &quot;build a data mesh.&quot;
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  After 6 months: a Confluence page with a diagram and nothing in production.
                </p>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">With Integrius</p>
                <TimelineSection items={techTimeline} />
              </div>

              {/* Result */}
              <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Result</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">2 weeks</p>
                    <p className="text-sm text-white/60">Data mesh in production (vs. 6 months, zero delivered)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">€400K/year</p>
                    <p className="text-sm text-white/60">Saved by replacing Collibra + Fivetran + Tableau</p>
                  </div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="flex flex-col items-center justify-center space-y-6 bg-black/50 backdrop-blur-lg p-12 rounded-xl text-center" delay={0.5}>
              <h3 className="text-3xl font-bold text-white max-w-2xl">
                We don&apos;t ask you to trust a scenario.
              </h3>
              <p className="text-xl text-white/70 max-w-xl">
                We ask you to try it.
              </p>
              <div className="flex gap-4 flex-wrap justify-center mt-4">
                <Link href="/contact?type=pilot" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Start a Pilot <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
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
