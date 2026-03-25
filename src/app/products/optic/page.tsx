'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  BarChart2,
  FileText,
  Bell,
  Zap,
  Eye,
  TrendingUp,
  GitBranch,
  Target,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Clock,
} from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

// ─── Comparison table data ───────────────────────────────────────────────────
const comparisonRows = [
  { concern: 'NLP on data',         tableau: 'No',       thoughtspot: 'Yes (cloud)', powerbi: 'Yes (Azure)', optic: 'Yes (on-prem)' },
  { concern: 'Self-hosted',         tableau: 'No',       thoughtspot: 'No',          powerbi: 'No',          optic: 'Yes' },
  { concern: 'Data leaves network', tableau: 'Yes',      thoughtspot: 'Yes',         powerbi: 'Yes',         optic: 'Never' },
  { concern: 'Governance built-in', tableau: 'No',       thoughtspot: 'No',          powerbi: 'No',          optic: 'Full lineage + RBAC' },
  { concern: 'Per-seat pricing',    tableau: 'Yes',      thoughtspot: 'Yes',         powerbi: 'Yes',         optic: 'No' },
  { concern: 'Forecasting built-in',tableau: 'No',       thoughtspot: 'Limited',     powerbi: 'Limited',     optic: 'Auto on every answer' },
  { concern: 'Simulation',          tableau: 'No',       thoughtspot: 'No',          powerbi: 'No',          optic: 'Yes — on governed data' },
  { concern: 'Predictive watchers', tableau: 'No',       thoughtspot: 'No',          powerbi: 'No',          optic: 'Yes — alerts before thresholds' },
  { concern: 'PPTX export',         tableau: 'No',       thoughtspot: 'No',          powerbi: 'Yes',         optic: 'Yes' },
  { concern: 'Automated workflows', tableau: 'No',       thoughtspot: 'No',          powerbi: 'No',          optic: 'Yes (Skills)' },
];

// ─── Interaction modes ────────────────────────────────────────────────────────
const modes = [
  {
    icon: MessageSquare,
    title: 'Ask Mode',
    tagline: 'One question. One answer. Instant.',
    description:
      'Ask a question in plain English, get an instant answer with KPIs, charts, tables, and narrative.',
    examples: [
      '"What\'s our revenue by region?" → instant KPI cards + bar chart + narrative summary',
      '"Which clinical trial has the most missing data?" → table with quality scores per trial',
      '"Show me all customers at risk of churning" → filtered list with risk scores and trend indicators',
    ],
  },
  {
    icon: Eye,
    title: 'Explore Mode',
    tagline: 'Persistent Sessions, Real-Time Signals',
    description:
      'Multi-turn conversational analysis that remembers context across questions — and across sessions.',
    examples: [
      '"Show me revenue" → "Break it down by tier" → "Just enterprise" → "Compare to last quarter" — each question builds on the last',
      'Real-time violet signals appear automatically showing predictions and forecasts on every answer — no configuration, no setup',
      'Sessions persist. Close your browser, come back tomorrow, continue where you left off.',
    ],
  },
  {
    icon: BarChart2,
    title: 'Dashboard Builder',
    tagline: 'Pin, arrange, share, export.',
    description:
      'Pin any answer as a tile, arrange a multi-tile grid, switch chart types, share via URL, and export to PPTX.',
    examples: [
      'Chart type switching (bar, line, pie) per tile',
      'Share via URL — anyone with the link sees live data, refreshed on every view',
      'CFO builds a 6-tile revenue dashboard in 5 minutes — ARR trend, MRR by region, net retention, expansion revenue, churn rate, pipeline value — exports to PowerPoint for the Thursday board meeting. No analyst involved.',
    ],
  },
  {
    icon: FileText,
    title: 'Reports (5 Templates)',
    tagline: 'Sales, Finance, Customer Health, Churn, Marketing.',
    description:
      'Templates for every team. Time period selection, executive summary, actionable recommendations, PDF + PPTX export.',
    examples: [
      'Templates: Sales Pipeline, Finance Summary, Customer Health, Churn Analysis, Marketing Performance + Custom',
      'Time period selection: month, quarter, YTD, trailing 12 months',
      'VP Sales generates a pipeline report every Monday, shares the PDF with leadership before their 10am standup.',
    ],
  },
  {
    icon: Zap,
    title: 'Briefs',
    tagline: 'AI executive briefs. Two minutes. Zero fluff.',
    description:
      'AI-generated executive briefs — concise, actionable summaries for time-starved leaders.',
    examples: [
      '"Give me a 2-minute briefing on customer health before my 10am" → 3 accounts flagged at-risk, net retention at 112%, 2 expansion opportunities identified, 1 support escalation requiring attention.',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Forecast / Predict Explorer',
    tagline: 'Auto-forecast on every answer. No data science team needed.',
    description:
      'Full prediction explorer — any metric, any time horizon. Violet forecast signals appear on every answer automatically.',
    examples: [
      '"What\'s our projected ARR in 6 months?" → trend line + confidence interval + narrative',
      '"Predict enrollment completion date for trial" → projection based on current velocity + confidence bands',
      '"When will we hit 10,000 customers?" → extrapolation with best-case / worst-case scenarios',
    ],
  },
  {
    icon: Bell,
    title: 'Watchers / Monitor',
    tagline: '5 types. One fires BEFORE the threshold is crossed.',
    description: '',
    examples: [],
    watcherTypes: [
      { label: 'Threshold', text: '"Alert when MRR drops below €500K"' },
      { label: 'Anomaly', text: '"Alert on unusual patterns in transaction volume" — detects deviations from baseline automatically' },
      { label: 'Forecast (Predictive)', text: '"Predict when churn rate will exceed 5% and alert me 2 weeks in advance." The alert fires before the problem happens.', highlight: true },
      { label: 'Trend', text: '"Alert when growth rate decelerates for 3 consecutive months"' },
      { label: 'Comparison', text: '"Alert when APAC revenue falls below 80% of EMEA"' },
    ],
  },
  {
    icon: FlaskConical,
    title: 'Simulation ("What If")',
    tagline: 'Run scenarios on live governed data.',
    description:
      'Results show with a violet "Simulated" badge so users never confuse simulations with real data. Trustworthy because the underlying data is governed — not a spreadsheet exercise on stale exports.',
    examples: [
      '"What if we lose our top 3 accounts?" → instant revenue impact, affected products, downstream effects',
      '"What if we add 2 engineers to the data team?" → projected capacity increase, roadmap impact',
      '"What if we migrate off the legacy Oracle source?" → blast radius showing every affected product, consumer, and team + migration timeline estimate',
    ],
  },
  {
    icon: Clock,
    title: 'Skills (Automated Workflows)',
    tagline: 'Scheduled. Recurring. Fully autonomous.',
    description: 'Define a recurring workflow in plain language. Optic runs it on schedule, every time.',
    examples: [
      '"Every Monday at 9am, generate a pipeline report and email it to the sales team"',
      '"Every hour, check if any source is unhealthy and alert Slack"',
      '"Every Friday, produce a customer health brief and post it to the #leadership channel"',
    ],
  },
  {
    icon: Target,
    title: 'Goals',
    tagline: 'Define targets. AI tracks them. Get alerted when off-track.',
    description: 'Define business goals. AI evaluates progress on a schedule and alerts when you\'re off-track.',
    examples: [
      '"Reach €1M ARR by Q3" → AI tracks progress weekly, alerts when trajectory suggests you\'ll miss',
      '"Reduce churn to under 3%" → AI monitors the metric, reports weekly, flags deviations',
    ],
  },
  {
    icon: ShoppingBag,
    title: 'Marketplace',
    tagline: 'Browse all Core data products from inside Optic.',
    description:
      'Click any product, explore it with natural language. See schemas, field descriptions, quality scores — before you ask a single question. Data discovery and data analysis in one interface.',
    examples: [],
  },
];

// ─── What Optic replaces ──────────────────────────────────────────────────────
const replacementRows = [
  { tool: 'Tableau / Looker',         optic: '29 chart types, dashboards, PDF/PPTX export' },
  { tool: 'Mixpanel / Amplitude',     optic: 'Event stream, signals, user behaviour forecasting' },
  { tool: 'PagerDuty',               optic: 'Watchers + email alerts + in-app toasts on any metric' },
  { tool: 'DataRobot / obviously.ai', optic: 'Forecast engine — trend extrapolation, confidence bands, predictive alerts' },
  { tool: 'Klipfolio / Geckoboard',   optic: 'Live dashboards from any Core data product' },
  { tool: 'Notion AI + docs',         optic: 'Brief generator, report builder with narrative' },
  { tool: 'Monte Carlo / Anomalo',    optic: 'Anomaly detection watchers (z-score, absence, change)' },
  { tool: 'Zapier (for data)',        optic: 'Skills — automated workflows triggered on schedule' },
  { tool: 'Retool',                   optic: 'Internal tool builder for any data query' },
  { tool: 'PowerPoint',              optic: 'PPTX export direct from reports and dashboards' },
  { tool: 'Slack bots (data)',        optic: 'Act mode — /watcher, /brief, /forecast in chat' },
  { tool: 'Atlan / Alation',          optic: 'Data Marketplace — browse, discover, explore all products' },
  { tool: 'Informatica MDM',          optic: 'Entity Resolution — canonical names across all products' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function isNegative(val: string) {
  return val === 'No' || val === 'Yes';
}

export default function IntegriusOpticPage() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
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
                  Available Now
                </div>
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none text-white">
                  Integrius Optic
                </h1>
                <p className="text-xl font-semibold text-cyan-400 max-w-4xl mx-auto">
                  The AI-powered intelligence layer that replaces Tableau, ThoughtSpot, and Power BI Copilot — and runs 100% on your infrastructure.
                </p>
                <p className="mx-auto max-w-3xl text-white/80 text-lg md:text-xl leading-relaxed">
                  Ask questions, build dashboards, generate reports, forecast metrics, simulate scenarios, set watchers, automate workflows. All from natural language. All on governed data. All on-premises via Ollama — no data ever leaves your network.
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

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-3 text-white">
                Why Not Tableau / ThoughtSpot / Power BI Copilot?
              </h2>
              <p className="text-center text-white/60 mb-10 text-lg">
                Every alternative sends your data somewhere. Optic never does.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/50 font-medium w-48">Concern</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium">Tableau</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium">ThoughtSpot</th>
                      <th className="text-center py-3 px-4 text-white/60 font-medium">Power BI Copilot</th>
                      <th className="text-center py-3 px-4 text-cyan-400 font-bold bg-cyan-500/10 rounded-t-lg">Integrius Optic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="py-3 px-4 text-white/80 font-medium">{row.concern}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={row.tableau === 'No' ? 'text-red-400/70' : row.tableau === 'Yes' ? 'text-orange-400/80' : 'text-yellow-400/70'}>
                            {row.tableau}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={row.thoughtspot === 'No' ? 'text-red-400/70' : row.thoughtspot === 'Yes' ? 'text-orange-400/80' : 'text-yellow-400/70'}>
                            {row.thoughtspot}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={row.powerbi === 'No' ? 'text-red-400/70' : row.powerbi === 'Yes' ? 'text-orange-400/80' : 'text-yellow-400/70'}>
                            {row.powerbi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center bg-cyan-500/5 font-semibold text-cyan-400">
                          {row.optic}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* ── Interaction Modes ─────────────────────────────────────────────── */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter text-white mb-3">
                11 Ways to Work With Your Data
              </h2>
              <p className="text-white/60 text-lg max-w-3xl mx-auto">
                Every interaction mode on one unified, governed data layer. No separate tools, no SaaS vendors, no data leaving your network.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {modes.map((mode, index) => {
                const Icon = mode.icon;
                const isWatchers = mode.title === 'Watchers / Monitor';
                const isSimulation = mode.title === 'Simulation ("What If")';
                return (
                  <motion.div
                    key={mode.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
                    viewport={{ once: true }}
                    className={`p-6 rounded-xl border bg-black/40 backdrop-blur-sm ${
                      isWatchers
                        ? 'border-cyan-500/40 bg-cyan-500/5'
                        : isSimulation
                        ? 'border-violet-500/40 bg-violet-500/5'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-6 h-6 flex-shrink-0 ${isSimulation ? 'text-violet-400' : 'text-cyan-400'}`} />
                      <div>
                        <h3 className="text-lg font-semibold text-white leading-tight">{mode.title}</h3>
                        <p className={`text-xs font-medium mt-0.5 ${isSimulation ? 'text-violet-400' : 'text-cyan-400/80'}`}>
                          {mode.tagline}
                        </p>
                      </div>
                    </div>
                    {mode.description && (
                      <p className="text-white/70 text-sm mb-4 leading-relaxed">{mode.description}</p>
                    )}

                    {/* Watcher types — special layout */}
                    {isWatchers && mode.watcherTypes && (
                      <div className="space-y-2 mt-3">
                        {mode.watcherTypes.map((wt, wi) => (
                          <div
                            key={wi}
                            className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                              wt.highlight
                                ? 'bg-cyan-500/15 border border-cyan-500/40'
                                : 'bg-white/5 border border-white/8'
                            }`}
                          >
                            {wt.highlight ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Bell className="w-3.5 h-3.5 text-white/40 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className={`font-semibold ${wt.highlight ? 'text-cyan-400' : 'text-white/60'}`}>
                                {wt.label}:{' '}
                              </span>
                              <span className={wt.highlight ? 'text-white/90' : 'text-white/60'}>{wt.text}</span>
                            </div>
                          </div>
                        ))}
                        <p className="text-cyan-400 text-xs font-semibold pt-1">
                          Forecast watchers fire BEFORE the threshold is crossed. Predictive monitoring, not reactive.
                        </p>
                      </div>
                    )}

                    {/* Simulation badge callout */}
                    {isSimulation && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold mb-3">
                        <FlaskConical className="w-3 h-3" />
                        Simulated
                      </div>
                    )}

                    {/* Examples */}
                    {mode.examples.length > 0 && (
                      <ul className="space-y-2 mt-1">
                        {mode.examples.map((ex, ei) => (
                          <li key={ei} className="flex items-start gap-2 text-xs text-white/60">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-white/30" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Watchers spotlight ────────────────────────────────────────────── */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement
              className="p-8 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 border border-cyan-500/25 backdrop-blur-lg rounded-xl"
              delay={0.3}
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-10 h-10 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Forecast Watchers: The alert fires before the problem happens.
                  </h3>
                  <p className="text-white/70 text-lg leading-relaxed max-w-4xl">
                    No other BI tool does this. Threshold watchers fire when a metric crosses a line — by then it&apos;s too late. Optic&apos;s forecast watchers use the same prediction engine that runs on every answer to evaluate whether a threshold <em>will be crossed</em> in the future and alert you while you still have time to act.
                  </p>
                  <div className="mt-4 p-4 rounded-lg bg-black/40 border border-cyan-500/30 font-mono text-sm text-cyan-300 max-w-2xl">
                    &ldquo;Predict when churn rate will exceed 5% and alert me 2 weeks in advance.&rdquo;
                  </div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* ── Simulation spotlight ──────────────────────────────────────────── */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement
              className="p-8 bg-gradient-to-r from-violet-500/10 via-transparent to-violet-500/10 border border-violet-500/25 backdrop-blur-lg rounded-xl"
              delay={0.3}
            >
              <div className="flex items-start gap-4">
                <FlaskConical className="w-10 h-10 text-violet-400 flex-shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">Simulation — on governed, live data.</h3>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold">
                      <FlaskConical className="w-3 h-3" /> Simulated
                    </span>
                  </div>
                  <p className="text-white/70 text-lg leading-relaxed max-w-4xl">
                    Every simulation result is tagged with a violet &ldquo;Simulated&rdquo; badge — users can never confuse a scenario with real data. This isn&apos;t a spreadsheet exercise on a stale CSV export. Simulations run on the same live data products that power production dashboards, meaning the inputs are always current and the outputs are trustworthy.
                  </p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* ── What Optic Replaces ───────────────────────────────────────────── */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-3 text-white">
                What Optic Alone Replaces
              </h2>
              <p className="text-center text-white/60 mb-10 text-lg max-w-3xl mx-auto">
                Count the SaaS subscriptions. Now cancel them.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/50 font-medium">Tool You&apos;re Paying For</th>
                      <th className="text-left py-3 px-4 text-cyan-400 font-bold">What Optic Does Instead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {replacementRows.map((row, i) => (
                      <tr
                        key={i}
                        className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                      >
                        <td className="py-3 px-4 text-white/70 font-medium whitespace-nowrap">{row.tool}</td>
                        <td className="py-3 px-4 text-white/80">{row.optic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-8 text-center text-white/60 text-sm max-w-3xl mx-auto">
                All on-prem, on your data, connected to Core — no SaaS vendor, no data leaving your network, no per-seat pricing that kills the business case.
              </p>
            </FloatingElement>
          </div>
        </section>

        {/* ── Setup ─────────────────────────────────────────────────────────── */}
        <section className="py-16 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl border border-white/10" delay={0.2}>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 space-y-3">
                  <h2 className="text-2xl font-bold text-white">Zero to running in 5 minutes.</h2>
                  <p className="text-white/70 leading-relaxed">
                    A 4-step setup wizard handles everything: org name, Core connection, AI provider, done. Demo mode with mock data means you can evaluate Optic without a Core instance.
                  </p>
                </div>
                <div className="lg:w-1/2">
                  <div className="p-5 rounded-lg bg-black/60 border border-white/10 font-mono text-sm">
                    <p className="text-cyan-400 mb-3">$ ./setup.sh</p>
                    <div className="space-y-2 text-white/70">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Step 1: Set organisation name</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Step 2: Connect to Core</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Step 3: Select AI provider (Ollama / OpenAI)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>Step 4: Done — Optic is running</span>
                      </div>
                    </div>
                    <p className="mt-3 text-white/40 text-xs">Demo mode available — no Core instance required for evaluation.</p>
                  </div>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <section className="py-24 relative">
          <div className="w-full px-4 md:px-8 lg:px-12">
            <FloatingElement
              className="flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-lg p-12 rounded-xl border border-cyan-500/20"
              delay={0.5}
            >
              <h3 className="text-3xl font-bold text-center text-white">
                The last BI tool you&apos;ll ever need.
              </h3>
              <p className="text-lg text-white/70 text-center max-w-2xl">
                Self-hosted. On your data. Zero data leakage. Deploys in minutes.
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
