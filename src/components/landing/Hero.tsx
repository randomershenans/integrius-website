'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const heroStats = [
  { value: '16', label: 'source connector types' },
  { value: '<50ms', label: 'p95 from materialized snapshots' },
  { value: '0', label: 'data leaves your network' },
  { value: '18', label: 'compliance standards mapped' },
];

const lines = ['Connect once.', 'Use everywhere.', 'Know everything.'];

export function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center relative">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-10 text-center max-w-5xl mx-auto">

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-xs md:text-sm font-mono uppercase tracking-[0.3em] text-cyan-400/80"
          >
            The self-hosted data product platform
          </motion.p>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white leading-[1.05]">
            {lines.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.35, ease: [0.21, 0.6, 0.35, 1] }}
                className={`block ${i === 2 ? 'bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text pb-2' : ''}`}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.5 }}
            className="mx-auto max-w-2xl text-white/65 text-lg md:text-xl leading-relaxed"
          >
            Integrius turns data scattered across every system into governed data products:
            one API per business concept, a tamper-evident audit trail, and AI answers.
            All inside your own infrastructure. Nothing leaves your network.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-base transition-all shadow-lg shadow-cyan-500/20"
            >
              Start a Pilot
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#story"
              className="inline-flex items-center gap-2 border border-cyan-500/30 text-cyan-400 px-8 py-3 rounded-lg font-semibold hover:border-cyan-500/60 hover:bg-cyan-500/5 transition-all"
            >
              See how it works
              <ChevronDown className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.6 }}
            className="w-full mt-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm">
              {heroStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center ${i < heroStats.length - 1 ? 'md:border-r md:border-white/10' : ''}`}
                >
                  <p className="text-2xl md:text-3xl font-bold text-cyan-400">{stat.value}</p>
                  <p className="text-sm text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 2.8, duration: 2.4, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
        aria-hidden
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
