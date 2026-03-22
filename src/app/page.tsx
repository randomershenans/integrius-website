'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Workflow, LineChart, Database, Clock, BarChart } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { DataChaosAnimation } from '@/components/landing/DataChaosAnimation';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import HowItWorks from '@/components/landing/HowItWorks';
import PricingCalculator from '@/components/landing/PricingCalculator';
import { Logo } from '@/components/landing/Logo';
import { BurgerMenu } from '@/components/landing/BurgerMenu';
import { ProductsDropdown } from '@/components/landing/ProductsDropdown';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden text-white">
      <SpaceBackground />
      <FlyingDataIcons />

      {/* Header */}
      <header className="fixed top-0 w-full px-4 lg:px-6 h-16 flex items-center justify-between z-[60] bg-black/50 backdrop-blur-md">
        <Logo />
        <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
          <ProductsDropdown />
          <a className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="#how-it-works">
            How It Works
          </a>
          <a className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="#pricing">
            Pricing
          </a>
          <Link className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="/blog">
            Blog
          </Link>
          <Link className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="/contact">
            Contact
          </Link>
        </nav>
        <BurgerMenu />
      </header>

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-12 text-center max-w-[65%] mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Change Anything. Break Nothing.
                </h1>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  Integrius unifies your data into governed data products and shows you exactly what will break, before you break it.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://app.integri.us"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-lg font-semibold hover:border-white/40 hover:text-white transition-all"
                >
                  Schedule a Demo
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Fear of Change */}
        <section className="pb-12 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                The Real Problem: Fear of Change
              </h2>
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2 space-y-6">
                  <p className="text-lg text-white/80">
                    Someone renames a field in Salesforce. Three dashboards break. Two pipelines fail. A VP is screaming. Nobody knew the blast radius until the fires started.
                  </p>
                  <ul className="space-y-4">
                    {[
                      { icon: Database, title: "You're terrified to touch anything", description: "Change a field? Update a schema? Who knows what breaks downstream." },
                      { icon: Workflow, title: "Nobody knows how data flows", description: "Point-to-point integrations everywhere. Tribal knowledge. Documentation 3 years stale." },
                      { icon: Clock, title: "Every change is a firefighting exercise", description: "Find out what broke after it breaks. Apologize. Patch. Repeat." },
                      { icon: BarChart, title: "You move slower than startups half your size", description: "Not because you're dumb. Because you're scared. And you should be, without visibility." },
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <item.icon className="w-6 h-6 mr-2 text-[#00B8D4]" />
                        <div>
                          <h3 className="font-bold text-white">{item.title}</h3>
                          <p className="text-white/80">{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:w-1/2 h-[400px] relative overflow-hidden">
                  <DataChaosAnimation />
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Dependency Graph */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                  See What Breaks Before You Break It
                </h2>
                <p className="text-lg max-w-3xl mx-auto text-white/80">
                  Integrius maps your entire data estate. Every source, every product, every dependency. Click any node and instantly see its blast radius.
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-[#1a1a2e]">
                <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-3 bg-[#0d0d1a] border-b border-white/10">
                  <div className="flex gap-1 md:gap-1.5">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500/80" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-2 md:mx-4">
                    <div className="bg-white/10 rounded-md px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs text-white/50 font-mono">
                      app.integri.us/dependency-graph
                    </div>
                  </div>
                </div>
                <img
                  src="/screenshots/integrius-dependency-graph.gif"
                  alt="Integrius Dependency Graph showing data lineage and blast radius analysis"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-lg md:text-2xl font-bold text-cyan-400">Blast Radius</p>
                  <p className="text-xs md:text-sm text-white/60">See affected systems</p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-2xl font-bold text-purple-400">Impact Analysis</p>
                  <p className="text-xs md:text-sm text-white/60">Before you change</p>
                </div>
                <div className="text-center">
                  <p className="text-lg md:text-2xl font-bold text-emerald-400">Zero Surprises</p>
                  <p className="text-xs md:text-sm text-white/60">Change with confidence</p>
                </div>
              </div>
              <div className="mt-12 grid md:grid-cols-3 gap-6">
                {[
                  { step: '1. Connect Your Sources', desc: 'Databases, APIs, SaaS tools. Connect them all. We auto-discover fields and relationships.' },
                  { step: '2. Map to Standard Fields', desc: '"customer_email", "user_email", "Email" all become one canonical field.' },
                  { step: '3. Build Data Products', desc: 'Governed APIs that expose standardized data. Dependencies tracked automatically.' },
                ].map((item) => (
                  <div key={item.step} className="p-6 rounded-xl bg-white/5">
                    <h3 className="text-xl font-bold mb-2 text-white">{item.step}</h3>
                    <p className="text-white/70">{item.desc}</p>
                  </div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="pt-12 pb-24 relative z-10">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                One Unified Data Layer. Everything You Need.
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                The foundation enterprises have needed for 20 years. Built for how companies actually work.
              </p>
              <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {[
                  { icon: Database, title: 'Integrius Core', subtitle: 'Unified Enterprise Data Layer', description: 'Connect all your legacy systems, databases, and SaaS tools into one unified real-time API without data lakes, rewrites, or migrations.', link: '/products/core' },
                  { icon: Zap, title: 'Integrius SDK', subtitle: 'Build Faster With Unified Data', description: 'For developers and product teams. Pull from multiple systems, output one clean structure. Build internal tools in days instead of months.', link: '/products/sdk', badge: 'Live on npm' },
                  { icon: LineChart, title: 'Integrius Optic', subtitle: 'See Everything. Ask Anything.', description: 'The conversational data interface for your enterprise. Ask questions, explore answers, generate reports, and monitor what matters. All from one interface.', link: '/products/optic', badge: 'Available in Pilot' },
                ].map((product, index) => (
                  <motion.div
                    key={product.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02 }}
                    className="relative p-8 rounded-xl overflow-hidden bg-black/30 transition-all duration-300 flex flex-col"
                  >
                    <product.icon className="w-12 h-12 mb-4 text-[#00B8D4]" />
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white">{product.title}</h3>
                      {'badge' in product && product.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 whitespace-nowrap">{product.badge}</span>
                      )}
                    </div>
                    <p className="text-lg font-semibold mb-4 text-[#00B8D4]">{product.subtitle}</p>
                    <p className="mb-6 flex-grow text-white/80">{product.description}</p>
                    <Link
                      href={product.link}
                      className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white py-2 px-4 rounded-lg font-semibold transition-all"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <HowItWorks />
            </FloatingElement>
          </div>
        </section>

        {/* Search API */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 border border-cyan-500/20 backdrop-blur-lg rounded-xl" delay={0.2}>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                    Unified Search API
                  </h2>
                  <p className="text-lg text-white/80">
                    Expose a single, governed search API across all your systems. No indexes. No pipelines. Just endpoints.
                  </p>
                  <ul className="space-y-2 text-white/70">
                    {['Schema-aware API endpoints', 'Entity-keyed results (customers, transactions, accounts)', 'Governance & access-aware', 'Your apps consume the API'].map((item) => (
                      <li key={item} className="flex items-center gap-2"><span className="text-cyan-400">✓</span> {item}</li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <Link href="/products/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                      Explore Search API
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="lg:w-1/2 p-6 rounded-xl bg-black/30">
                  <p className="text-center text-xs mb-4 font-mono text-white/50">API endpoints generated from your data contracts</p>
                  <div className="space-y-2 font-mono text-sm text-cyan-400">
                    {['GET /v1/search?q=john.smith', 'GET /v1/search/customers?email=@gmail.com', 'GET /v1/search?entity=transaction&amount_gt=1000'].map((endpoint) => (
                      <p key={endpoint} className="p-2 rounded bg-black/50">{endpoint}</p>
                    ))}
                  </div>
                  <p className="text-center text-xs mt-4 text-white/40">Results are entity-keyed, schema-aware, and governed.</p>
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 relative z-20">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Transparent Pricing
              </h2>
              <p className="text-center mb-8 max-w-3xl mx-auto text-white/70">
                Priced by data products. Data sources and complexity are unlimited.
              </p>
              <PricingCalculator />
            </FloatingElement>
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="space-y-12 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.3}>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text text-center">
                  Why Integrius vs. Everything Else
                </h2>
                <p className="md:text-xl text-center text-white/80">
                  ETL tools take months and break constantly. Data lakes are expensive graveyards. We&apos;re different.
                </p>
              </div>
              <ComparisonTable />
            </FloatingElement>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Finally Make Changes With Confidence</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">
                Know what breaks before you break it. Move as fast as a startup, even with 20 years of legacy systems.
              </p>
              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all"
                >
                  Schedule a Demo
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FloatingElement>
          </div>
        </section>
      </main>

      <footer className="relative z-10 w-full py-6 border-t border-white/10">
        <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-white/80">© {new Date().getFullYear()} Integrius. All rights reserved.</p>
          <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
            <Link href="/blog" className="text-xs hover:underline underline-offset-4 text-white/80">Blog</Link>
            <a href="#" className="text-xs hover:underline underline-offset-4 text-white/80">Terms of Service</a>
            <a href="#" className="text-xs hover:underline underline-offset-4 text-white/80">Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
