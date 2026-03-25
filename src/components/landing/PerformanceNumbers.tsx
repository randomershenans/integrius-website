import { FloatingElement } from '@/components/landing/FloatingElement';

const stats = [
  { value: '835+', label: 'automated tests across 61 files', color: 'text-cyan-400' },
  { value: '100%', label: 'pass rate across all scale levels', color: 'text-emerald-400' },
  { value: '33ms', label: 'p50 with materialization', color: 'text-cyan-400' },
  { value: '2.6x', label: 'faster with materialized snapshots', color: 'text-purple-400' },
  { value: '5 min', label: 'Docker to live platform', color: 'text-emerald-400' },
  { value: '0 errors', label: 'across 405 requests tested', color: 'text-cyan-400' },
];

const benchmarks = [
  { scenario: 'Cold query', live: '146ms', materialized: '57ms', speedup: '2.6x' },
  { scenario: 'Paginated', live: '216ms', materialized: '58ms', speedup: '3.7x' },
  { scenario: 'Sequential burst', live: '33ms', materialized: '33ms', speedup: 'Baseline' },
];

export function PerformanceNumbers() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text mb-4">
              Production-tested at scale.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Not benchmarked on a laptop. Tested under load, across scale levels, with real query patterns.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors text-center"
              >
                <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
                <p className="text-xs text-white/50 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Benchmark table */}
          <div className="max-w-2xl mx-auto">
            <h3 className="text-sm font-mono text-white/40 text-center mb-4 uppercase tracking-widest">
              Benchmark results — live vs. materialized
            </h3>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-4 text-white/50 font-medium">Scenario</th>
                    <th className="text-center py-3 px-4 text-white/50 font-medium">Live</th>
                    <th className="text-center py-3 px-4 text-white/50 font-medium">Materialized</th>
                    <th className="text-center py-3 px-4 text-cyan-400/70 font-medium">Speedup</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarks.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 text-white/80">{row.scenario}</td>
                      <td className="py-3 px-4 text-center text-red-400/70 font-mono">{row.live}</td>
                      <td className="py-3 px-4 text-center text-emerald-400 font-mono">{row.materialized}</td>
                      <td className="py-3 px-4 text-center text-cyan-400 font-bold">{row.speedup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-xs text-white/30 mt-3">
              Tests run across 2K–44K records. Linear degradation confirmed at all scale levels.
            </p>
          </div>
        </FloatingElement>
      </div>
    </section>
  );
}
