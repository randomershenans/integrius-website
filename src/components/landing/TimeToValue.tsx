import { FloatingElement } from '@/components/landing/FloatingElement';

const timeline = [
  { time: 'Minute 1–5', event: 'Docker running. Setup wizard complete. Platform live.' },
  { time: 'Minute 10', event: 'First 3 data sources connected: Salesforce, Postgres, S3. No code.' },
  { time: 'Minute 20', event: 'First unified data product serving a live API endpoint. Entity resolution matching customers across sources.' },
  { time: 'Minute 30', event: 'Search returns results from all connected sources. Autocomplete working.' },
  { time: 'Minute 35', event: 'First question answered in Optic: "How many customers do we have?" Returns a KPI card, chart, and narrative.' },
  { time: 'Hour 1', event: 'Dashboard built with 4 tiles. Shared with the team via URL.' },
  { time: 'Hour 2', event: 'Permissions configured. Permission Explorer shows compliance officer exactly who can see what.' },
  { time: 'Day 1', event: 'Production data flowing. Team using it daily.' },
  { time: 'Week 1', event: '"How did we do before this?"' },
];

export function TimeToValue() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white mb-4">
              Not a 6-month implementation.{' '}
              <span className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Not a consultants engagement.
              </span>{' '}
              Not a Phase 2.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              A single engineer deploys it, connects sources, and the business team is self-service within the hour.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/60 via-cyan-500/20 to-transparent hidden sm:block" />

            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-0 sm:gap-6 items-start group">
                  {/* Time label */}
                  <div className="hidden sm:flex flex-col items-end w-28 shrink-0 pt-3">
                    <span className="text-xs font-mono text-cyan-400/80 text-right leading-tight">{item.time}</span>
                  </div>

                  {/* Dot */}
                  <div className="hidden sm:flex flex-col items-center shrink-0 pt-3.5">
                    <div className={`w-3 h-3 rounded-full border-2 transition-colors ${
                      i === timeline.length - 1
                        ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/40'
                        : 'bg-[#050a0f] border-cyan-500/40 group-hover:border-cyan-400'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-8 ${i === timeline.length - 1 ? 'pb-0' : ''}`}>
                    <div className="sm:hidden mb-1">
                      <span className="text-xs font-mono text-cyan-400/80">{item.time}</span>
                    </div>
                    <div className={`p-4 rounded-lg border transition-all ${
                      i === timeline.length - 1
                        ? 'bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 border-cyan-500/30'
                        : 'bg-white/5 border-white/10 group-hover:border-white/20'
                    }`}>
                      <p className={`text-sm leading-relaxed ${
                        i === timeline.length - 1 ? 'text-white font-medium italic text-base' : 'text-white/80'
                      }`}>
                        {item.event}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FloatingElement>
      </div>
    </section>
  );
}
