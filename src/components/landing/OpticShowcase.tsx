'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

const QUESTION = 'Which enterprise accounts are at churn risk this quarter?';

const KPIS = [
  { label: 'Accounts at risk', value: '12' },
  { label: 'ARR exposed', value: '€1.4M' },
  { label: 'Trend vs last quarter', value: '+3' },
];

const BARS = [
  { label: 'Logins', height: 38 },
  { label: 'Tickets', height: 86 },
  { label: 'Usage', height: 30 },
  { label: 'NPS', height: 52 },
  { label: 'Invoices', height: 64 },
];

const SAMPLE_QUESTIONS = [
  'Revenue by region, Q3 vs Q2',
  'Build the Monday morning board brief',
  'Forecast MRR with confidence bands',
  'Who queried the revenue product last week?',
];

export function OpticShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-20% 0px' });
  const [typed, setTyped] = useState('');
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(QUESTION);
      setAnswered(true);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTyped(QUESTION.slice(0, i));
      if (i >= QUESTION.length) {
        clearInterval(interval);
        setTimeout(() => setAnswered(true), 450);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section ref={sectionRef} className="py-24 relative z-10">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400/80 mb-4">Integrius Optic</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-4">
            Ask your data anything.
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Optic resolves your question to the right governed data products, fetches live data
            through Core, and answers with charts, KPIs, and a written summary. In seconds, not days.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* The question bar */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-black/60 border border-cyan-500/30 backdrop-blur-lg shadow-lg shadow-cyan-500/10">
            <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
            <p className="font-mono text-sm md:text-base text-white/90 min-h-[1.5em]">
              {typed}
              {!answered && <span className="inline-block w-2 h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle" />}
            </p>
          </div>

          {/* The answer card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={answered ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, ease: [0.21, 0.6, 0.35, 1] }}
            className="mt-4 p-6 rounded-xl bg-black/50 border border-white/10 backdrop-blur-lg"
          >
            <div className="grid grid-cols-3 gap-3 mb-6">
              {KPIS.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={answered ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.12 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 text-center"
                >
                  <p className="text-xl md:text-2xl font-bold text-cyan-400">{kpi.value}</p>
                  <p className="text-xs text-white/50 mt-1">{kpi.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex items-end justify-center gap-4 h-28 mb-2" aria-hidden>
              {BARS.map((bar, i) => (
                <div key={bar.label} className="flex flex-col items-center gap-2 w-12">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={answered ? { height: bar.height } : {}}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className={`w-full rounded-t ${i === 1 ? 'bg-gradient-to-t from-[#0091EA] to-[#00B8D4]' : 'bg-white/15'}`}
                  />
                  <p className="text-[10px] font-mono text-white/40">{bar.label}</p>
                </div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={answered ? { opacity: 1 } : {}}
              transition={{ delay: 1.0 }}
              className="text-sm text-white/70 leading-relaxed border-t border-white/10 pt-4"
            >
              12 enterprise accounts show declining logins and rising support tickets.
              Support volume is the strongest churn signal this quarter. The three largest
              at-risk accounts share an open escalation older than 14 days.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={answered ? { opacity: 1 } : {}}
              transition={{ delay: 1.3 }}
              className="flex items-center gap-2 mt-4 text-xs text-white/40"
            >
              <Lock className="h-3.5 w-3.5 text-emerald-400/70" />
              <span>
                Answered on local inference. Scoped to your permissions before the query ran.
                No data left the network.
              </span>
            </motion.div>
          </motion.div>

          {/* Sample question chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {SAMPLE_QUESTIONS.map((q) => (
              <span
                key={q}
                className="px-3 py-1.5 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-white/50"
              >
                {q}
              </span>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/products/optic"
              className="inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
            >
              Explore Optic
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
