'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Database, Zap, Shield, GitBranch, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const features = [
  { icon: Database, title: 'Universal Connectivity', description: 'Connect to SAP, Oracle, PostgreSQL, MySQL, MongoDB, Salesforce, APIs, CSV files—literally anything. If it stores data, we connect to it.' },
  { icon: Zap, title: 'Real-Time Unified API', description: 'Query all your systems from one endpoint. No waiting for batch jobs. No stale data. Changes propagate instantly across your entire data ecosystem.' },
  { icon: Shield, title: 'Zero Migration Risk', description: 'Your systems stay exactly where they are. No downtime. No cutover weekends. No "we hope this works" moments. Just seamless integration.' },
  { icon: GitBranch, title: 'TOON AI Auto-Mapping', description: 'Our AI reads your schemas and maps them to a unified ontology automatically. Schema changes? We adapt. No manual intervention required.' },
  { icon: Clock, title: 'Knowledge Preservation', description: "When people leave, their tribal knowledge doesn't. The system understands your data structures, so you're never dependent on one person." },
  { icon: CheckCircle2, title: 'Production-Safe', description: "Read-only connections to your systems by default. We don't touch your production data unless you explicitly want write capabilities." },
];

const useCases = [
  'Query customer data across CRM, ERP, and legacy databases in one API call',
  'Build unified dashboards that pull from 10+ systems without ETL pipelines',
  'Enable real-time business intelligence without building a data warehouse',
  'Eliminate brittle point-to-point integrations that break with every change',
  'Stop losing critical knowledge when employees retire or leave',
  'Reduce integration timeline from 6 months to 6 days',
];

export default function IntegriusCorePage() {
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
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">
                  Integrius Core
                </h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">The Unified Enterprise Data Layer</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  The backbone that changes everything. Connect all your systems into one unified, real-time API—without data lakes, rewrites, migrations, or retiring old systems.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Schedule a Demo <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                What Makes Core Different
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                This is the foundation layer enterprises have needed for 20 years. Query everything from one endpoint. Zero dependency on system retirements.
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}
                    className="p-6 rounded-xl border bg-black/30 border-white/10"
                  >
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
                What You Can Do With Core
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Real use cases from companies who stopped building data plumbing and started building their business.
              </p>
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
              <h3 className="text-2xl font-bold text-center text-white">Ready to Unify Your Data Layer?</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">See how Integrius Core eliminates integration hell and gives you one API for everything.</p>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Talk to Our Team <ArrowRight className="h-5 w-5" />
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
