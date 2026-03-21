'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BarChart, TrendingUp, FileSpreadsheet, Zap, Eye, MousePointerClick, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const features = [
  { icon: BarChart, title: 'Instant Unified Datasets', description: 'All your data sources—CRMs, ERPs, legacy DBs, spreadsheets, APIs—unified into live datasets. No more stitching, cleaning, joining, harmonizing, and praying it works.' },
  { icon: TrendingUp, title: 'Drag-and-Drop to Any BI Tool', description: 'Tableau, Power BI, Looker, whatever you use—just point it at Integrius. Live data. Unified schema. Zero manual exports or transformations.' },
  { icon: FileSpreadsheet, title: 'No More VLOOKUP Hell', description: 'Stop spending hours in Excel joining data from 5 different exports. Get one unified dataset that\'s always up to date. Always complete. Always correct.' },
  { icon: Zap, title: 'Real-Time Business Intelligence', description: 'Not "refreshed last night." Not "batch job ran at 3am." Right now. Live data from all your systems in one place. Make decisions on current reality, not yesterday\'s snapshot.' },
  { icon: Eye, title: 'Complete Visibility Across the Business', description: 'See the full picture. Customer data from CRM. Orders from ERP. Support tickets from helpdesk. Analytics from your app. All unified. All live. All queryable.' },
  { icon: MousePointerClick, title: 'Self-Service Data Access', description: 'No more "we need IT to build a connector." No more "ask the data team to export that." Analysts and decision-makers get the data they need, when they need it.' },
];

const benefits = [
  'Reduce report creation time from weeks to minutes',
  'Stop waiting for the data team to export and join datasets',
  'Eliminate schema mismatch errors that break dashboards',
  'Get instant answers to business questions without data engineering',
  'Build executive dashboards that actually stay up to date',
  'Give every team access to unified data without IT bottlenecks',
];

const integrations = [
  'Tableau', 'Power BI', 'Looker', 'Metabase', 'Superset', 'Google Data Studio',
  'Excel', 'Google Sheets', 'SQL Clients', 'Python', 'R', 'Jupyter',
];

export default function IntegriusDataConsumerPage() {
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
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">Integrius Data Consumer</h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">Instant Dashboards, Insights & BI</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  For data teams, analysts, and decision-makers. All your data sources unified into live datasets. What takes weeks now takes seconds.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  See It In Action <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                What Data Teams Wish They Always Had
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Stop being a bottleneck. Start being the hero who delivers insights in seconds, not weeks.
              </p>
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
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.3}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                From Data Bottleneck to Data Hero
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                What happens when your data team stops fighting infrastructure and starts delivering insights.
              </p>
              <div className="max-w-3xl mx-auto space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-[#00B8D4]" />
                    <p className="text-lg text-white/80">{benefit}</p>
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
                Works With Your Tools
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Use the BI tools you already know and love. Integrius provides the unified data layer underneath.
              </p>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {integrations.map((tool, index) => (
                  <motion.div key={tool} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.05 }} viewport={{ once: true }} className="px-6 py-3 rounded-lg border bg-black/30 border-white/10">
                    <span className="font-medium text-white">{tool}</span>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Ready for Insights in Seconds, Not Weeks?</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">See how Data Consumer eliminates data plumbing and turns your team into insight machines.</p>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Schedule a Demo <ArrowRight className="h-5 w-5" />
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
