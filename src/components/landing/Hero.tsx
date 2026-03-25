import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const tags = ['Data Products', 'Governance', 'Search', 'Optic', 'Self-Hosted', 'Air-Gapped'];

const heroStats = [
  { value: '33ms', label: 'p50 response time' },
  { value: '5 min', label: 'Docker to live platform' },
  { value: '5–10 tools', label: 'replaced by one platform' },
];

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-10 text-center max-w-4xl mx-auto">

          {/* Tag pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
              The last data platform{' '}
              <span className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                you&apos;ll ever need.
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-white/70 text-lg md:text-xl leading-relaxed">
              The self-hosted platform that replaces your data catalog, ETL pipelines, enterprise
              search, BI tools, and product analytics — with governed data products, event-driven
              intelligence, AI-powered analytics, and zero data leakage.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-base transition-all shadow-lg shadow-cyan-500/20"
            >
              Start a Pilot
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/technical-brief"
              className="inline-flex items-center gap-2 border border-cyan-500/30 text-cyan-400 px-8 py-3 rounded-lg font-semibold text-base hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all"
            >
              Read the Technical Brief
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full mt-4"
          >
            <div className="grid grid-cols-3 gap-4 p-6 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
              {heroStats.map((stat, i) => (
                <div key={stat.label} className={`text-center ${i < heroStats.length - 1 ? 'border-r border-white/10' : ''}`}>
                  <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</p>
                  <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
