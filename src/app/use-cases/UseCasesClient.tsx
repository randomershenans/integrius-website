'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, FlaskConical, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const pharmaTimeline = [
  {
    label: 'Day 1',
    items: [
      'Deploy Core inside their own infrastructure, air-gap capable, no phone-home. Connect all 10 sources through the setup wizard. No code, no ETL pipelines.',
      'Create a "Unified Oncology View" data product with a named, accountable owner.',
    ],
  },
  {
    label: 'Day 2',
    items: [
      'Search: "Find all patients in the BEACON-3 trial". Federated results from trial management, lab results, and adverse events in one call.',
      'Optic: "Which clinical trial has the most missing data?" An instant KPI, governed, with the answer traced back to source.',
      'Optic: "Which trial sites have the highest dropout rate?" A ranked table, the right chart, and a written summary.',
    ],
  },
  {
    label: 'Week 1',
    items: [
      'FDA inspection prep: the 21 CFR Part 11 audit chain is walked end to end, e-signatures and all, in minutes instead of weeks of document pulls.',
      'A compliance officer proves the marketing team cannot see patient PII, with evidence, in seconds.',
      'Blast radius: before retiring a legacy lab system, the team sees every downstream data product it would break.',
    ],
  },
];

const bankingTimeline = [
  {
    label: 'Day 1',
    items: [
      'Connect all 8 systems holding customer data.',
      'Build a golden customer view: one entity-keyed data product joining CRM, trading, billing, and compliance records in real time.',
    ],
  },
  {
    label: 'Day 3',
    items: [
      'Search: "Acme Holdings". One governed result spanning all 8 systems, instead of a junior analyst spending 2 days searching each one.',
      'Optic: "What\'s our exposure to Acme Holdings?" An aggregated answer with KPIs and a trend chart, RBAC enforced before the query runs.',
    ],
  },
  {
    label: 'Ongoing',
    items: [
      'SOX 404: the tamper-evident audit chain gives internal controls testing a verifiable record of who touched what, when.',
      'AML/KYC: the golden customer view becomes the single reference for screening and investigations.',
      'GDPR: right to erasure handled in one atomic transaction, with a chained audit row proving it happened.',
    ],
  },
];

const govTimeline = [
  {
    label: 'Day 1',
    items: [
      'Deploy Core inside the air-gapped enclave. Zero SaaS dependencies, no phone-home, nothing to allowlist outbound.',
      'Connect mission systems through the same 16 connectors used everywhere else. ITAR data never leaves the boundary, by architecture.',
    ],
  },
  {
    label: 'Week 1',
    items: [
      'Data products stood up with RBAC: 4 built-in roles, 24 granular permissions, field-level access control.',
      'FISMA / NIST 800-53 control mapping handed to the assessor: audit chain, access enforcement, and session controls are platform features, not custom builds.',
    ],
  },
  {
    label: 'Ongoing',
    items: [
      'Every access lands in the tamper-evident, hash-chained audit log. Verification fails loudly if anything is altered.',
      'Blast radius analysis before every schema or access change. No surprises in systems where surprises are unacceptable.',
      'Optic runs inside the same enclave: local LLM inference via Ollama, so even the AI layer never reaches outward.',
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
                <p className="text-2xl font-semibold text-[#00B8D4]">Built for the industries where governance is the law.</p>
                <p className="mx-auto max-w-[700px] text-white/70 text-lg md:text-xl">
                  Pharma and biotech, financial services, healthcare, government and defense, manufacturing, energy and utilities, insurance, education. Anywhere regulated, federated, or audit-driven. Three deep scenarios below.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-4 flex-wrap justify-center">
                <a href="#pharma" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  Pharma
                </a>
                <a href="#finance" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  Financial Services
                </a>
                <a href="#government" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
                  Government & Defense
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Industries strip */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/40 backdrop-blur-lg rounded-xl border border-white/10" delay={0.15}>
              <div className="text-center mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">Industry coverage</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-white">
                  Eight regulated industries. One platform. Same answer.
                </h2>
                <p className="text-white/60 text-base max-w-3xl mx-auto mt-3">
                  The audit chain pharma uses for 21 CFR Part 11 is the same chain banks use for SOX 404. The self-hosted posture that keeps PHI inside a hospital network is the same posture FERPA needs for student records. Federated, governed, tamper-evident, self-hosted.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
                {[
                  { name: 'Pharma & Biotech', key: '21 CFR Part 11, ALCOA+, FDA inspection prep in minutes' },
                  { name: 'Financial Services', key: 'SOX 404, AML/KYC golden customer view' },
                  { name: 'Healthcare', key: 'HIPAA, self-hosted: PHI never leaves the network' },
                  { name: 'Government & Defense', key: 'FISMA / NIST 800-53, air-gap capable, ITAR by residency' },
                  { name: 'Manufacturing', key: 'Federated supply-chain data products with blast radius' },
                  { name: 'Energy & Utilities', key: 'NERC CIP: governed access to operational data' },
                  { name: 'Insurance', key: 'Claims-data audit chain and permission proof' },
                  { name: 'Education', key: 'FERPA: student-record access controls and audit' },
                ].map((industry) => (
                  <div key={industry.name} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors">
                    <p className="text-sm font-semibold text-white mb-1">{industry.name}</p>
                    <p className="text-xs text-white/50">{industry.key}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-white/40 mt-6">
                Three deep scenarios below. The platform applies the same way to every industry above.
              </p>
            </FloatingElement>
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-1">Scenario 1: Pharma & Biotech</p>
                  <h2 className="text-2xl font-bold text-white">10 Oncology Sources, 4 Months, Got Nowhere</h2>
                </div>
              </div>

              {/* The Problem */}
              <div className="mb-8 p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">The Problem</p>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  A pharma company needs to unify 10 oncology data sources: clinical trial management (Oracle), patient registries (Postgres), lab results (REST API), adverse events (MSSQL), and research publications (S3 CSV exports).
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  They spent 4 months with an internal team and a systems integrator. Result: a stale weekly CSV dump that breaks every time a schema changes, and nothing an FDA inspector would accept.
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
                  What took 4 months and failed is now running in production: governed, 21 CFR Part 11 compliant, inspection-ready.{' '}
                  <span className="text-cyan-400 font-semibold">Starting at €5,000/month on the Pilot tier.</span>
                </p>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Financial Services */}
        <section id="finance" className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Building2 className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">Scenario 2: Financial Services</p>
                  <h2 className="text-2xl font-bold text-white">8 Systems, 1 Customer, No Golden Record</h2>
                </div>
              </div>

              {/* The Problem */}
              <div className="mb-8 p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">The Problem</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  A mid-tier investment bank holds KYC data in 8 systems, each with its own version of the customer. When compliance asks &quot;show me everything about Acme Holdings&quot;, a junior analyst spends 2 days manually searching each system, and SOX controls testing means more weeks of evidence gathering.
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
                    <p className="text-2xl font-bold text-cyan-400 mb-1">2 days to seconds</p>
                    <p className="text-sm text-white/60">From manual system-by-system search to one governed golden customer view</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">One audit chain</p>
                    <p className="text-sm text-white/60">Tamper-evident evidence for SOX 404 controls testing, on tap</p>
                  </div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Government & Defense */}
        <section id="government" className="py-24 relative">
          <div className="w-full px-4 md:px-8">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">Scenario 3: Government & Defense</p>
                  <h2 className="text-2xl font-bold text-white">Every Vendor Wanted the Cloud. The Data Could Not Leave.</h2>
                </div>
              </div>

              {/* The Problem */}
              <div className="mb-8 p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-3">The Problem</p>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  A defense program needs to unify data across mission systems inside an air-gapped network. ITAR-controlled data cannot cross the boundary. FISMA requires NIST 800-53 controls with evidence.
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  Every data platform they evaluated phones home, requires a SaaS control plane, or sends telemetry. All of them are disqualified before the first demo.
                </p>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-6">With Integrius</p>
                <TimelineSection items={govTimeline} />
              </div>

              {/* Result */}
              <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">Result</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">Air-gapped, day one</p>
                    <p className="text-sm text-white/60">The full platform, including the AI layer, runs inside the enclave</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-cyan-400 mb-1">Zero bytes outbound</p>
                    <p className="text-sm text-white/60">No SaaS dependencies, no telemetry, ITAR residency by architecture</p>
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
