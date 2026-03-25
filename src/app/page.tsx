'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, LineChart, Database } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import PricingCalculator from '@/components/landing/PricingCalculator';
import { Logo } from '@/components/landing/Logo';
import { BurgerMenu } from '@/components/landing/BurgerMenu';
import { ProductsDropdown } from '@/components/landing/ProductsDropdown';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { WhatWeReplace } from '@/components/landing/WhatWeReplace';
import { TimeToValue } from '@/components/landing/TimeToValue';
import { PerformanceNumbers } from '@/components/landing/PerformanceNumbers';
import { ToughQuestions } from '@/components/landing/ToughQuestions';
import { SecuritySection } from '@/components/landing/SecuritySection';

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

        {/* 1. Hero */}
        <Hero />

        {/* 2. Problem Section */}
        <ProblemSection />

        {/* 3. Products */}
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

        {/* 4. What We Replace */}
        <WhatWeReplace />

        {/* 5. Time to Value */}
        <TimeToValue />

        {/* 6. Performance Numbers */}
        <PerformanceNumbers />

        {/* 7. Tough Questions */}
        <ToughQuestions />

        {/* 8. Security Section */}
        <SecuritySection />

        {/* 9. Pricing */}
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

        {/* 10. Final CTA */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">
                Ready to replace your entire data stack?
              </h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">
                One platform. One price. No data leaves your network. Deploy a pilot in an afternoon and bring us your toughest question.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all"
                >
                  Start a Pilot
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/technical-brief"
                  className="inline-flex items-center gap-2 border border-cyan-500/30 text-cyan-400 px-8 py-3 rounded-lg font-semibold hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all"
                >
                  Read the Technical Brief
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
