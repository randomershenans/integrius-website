import { FloatingElement } from '@/components/landing/FloatingElement';

const rows = [
  {
    tool: 'Collibra / Atlan',
    category: 'catalog + governance',
    cost: '€200–500K',
    replacement: 'Core: governed data products with lineage, ownership, approval workflows',
  },
  {
    tool: 'Fivetran / Airbyte',
    category: 'ETL/ELT',
    cost: '€100–300K',
    replacement: 'Core: 13 connectors + transform pipeline + materialization',
  },
  {
    tool: 'Elasticsearch',
    category: 'search infrastructure',
    cost: '€50–150K + infra team',
    replacement: 'Search: federated, semantic, entity resolution — no separate infra',
  },
  {
    tool: 'Tableau / Power BI',
    category: 'BI dashboards',
    cost: '€100–300K',
    replacement: 'Optic: AI-powered, self-hosted, governed, no per-seat fees',
  },
  {
    tool: 'ThoughtSpot',
    category: 'AI BI',
    cost: '€200–500K',
    replacement: 'Optic: same NLP capability, on-prem, fraction of cost',
  },
  {
    tool: 'Mixpanel / Amplitude / Segment',
    category: 'product analytics',
    cost: '€50–200K',
    replacement: 'Core: event-driven architecture — analytics is a byproduct, no SDK',
  },
  {
    tool: 'Custom middleware / API gateway',
    category: 'engineering cost',
    cost: '2–4 engineers FTE',
    replacement: 'Core: API gateway with rate limiting, caching, auth, versioning',
  },
  {
    tool: 'Security questionnaire completion',
    category: 'compliance overhead',
    cost: 'Weeks of back-and-forth',
    replacement: '73-question questionnaire pre-filled, SOC 2 controls mapped',
  },
];

export function WhatWeReplace() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text mb-4">
              What Integrius replaces — and what it costs you not to.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Your current stack is a collection of tools that don&apos;t talk to each other. Here&apos;s the honest math.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/50 font-medium">What you have today</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">Typical annual cost</th>
                  <th className="text-left py-3 px-4 text-white/50 font-medium">What Integrius replaces it with</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{row.tool}</span>
                      <span className="text-white/40 text-xs ml-2">({row.category})</span>
                    </td>
                    <td className="py-4 px-4 text-red-400 font-mono font-medium">{row.cost}</td>
                    <td className="py-4 px-4 text-white/70">{row.replacement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total row — highlighted */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-cyan-500/15 via-emerald-500/10 to-cyan-500/15 border border-cyan-500/30 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-500/70 block mb-1">TOTAL ANNUAL SPEND</span>
              <p className="text-2xl font-bold text-white">
                <span className="line-through text-red-400/80 mr-3">€750K – €2M+</span>
              </p>
            </div>
            <div className="text-right sm:text-left">
              <span className="text-xs font-mono text-emerald-400/70 block mb-1">WITH INTEGRIUS</span>
              <p className="text-2xl font-bold text-emerald-400">€60K – €320K+/yr</p>
            </div>
            <div className="hidden sm:block text-white/30 text-3xl font-thin">→</div>
            <div>
              <span className="text-xs font-mono text-cyan-400/70 block mb-1">TYPICAL SAVING</span>
              <p className="text-2xl font-bold text-cyan-400">Up to 90% cost reduction</p>
            </div>
          </div>

          <p className="text-center text-xs text-white/30 mt-4">
            Costs based on typical enterprise contracts. Your actual savings depend on your current vendor mix. We&apos;ll do the maths with you.
          </p>
        </FloatingElement>
      </div>
    </section>
  );
}
