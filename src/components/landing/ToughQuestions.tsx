'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FloatingElement } from '@/components/landing/FloatingElement';

const questions = [
  {
    q: '"How do we know this scales? You\'re a small company."',
    a: 'We tested it. 405 requests across 4 scale levels (2K to 44K records), 100% pass rate, linear degradation. Materialized snapshots serve at 33ms p50. The architecture is stateless — add API pods behind a load balancer and throughput scales horizontally. Kubernetes HPA is built in.',
  },
  {
    q: '"What if you go out of business?"',
    a: 'You have the platform running inside YOUR infrastructure. No SaaS dependency. No phone-home. No license server. The Docker images, Helm charts, and source code run independently. Your data products, governance rules, and configurations are yours — they live in your Postgres instance.',
  },
  {
    q: '"Our data absolutely cannot leave our network."',
    a: 'It never does. Zero outbound API calls. No telemetry. No CDN. No external font loading. Air-gapped deployment is documented and tested. Even the AI in Optic runs locally via Ollama — no OpenAI, no Anthropic, no cloud inference. If you unplug the network cable, it still works.',
  },
  {
    q: '"We already have Collibra / Snowflake / Tableau."',
    a: "You're spending €750K–2M+ on tools that don't talk to each other. Collibra catalogs but can't serve data. Fivetran moves but doesn't govern. Tableau visualises but needs cloud. Run a pilot alongside your existing stack — we don't ask you to rip and replace. We ask you to compare.",
  },
  {
    q: '"What about SOC 2?"',
    a: '40 controls mapped, 15 fully implemented, audit-ready evidence for all of them. 73-question security questionnaire pre-filled with file references. We\'ll hand your security team a completed document before the first meeting ends.',
  },
  {
    q: '"Can the AI hallucinate wrong answers?"',
    a: 'Schema resolution means the LLM only sees real field names from governed data products — it cannot invent columns that don\'t exist. Temperature is set to 0 (deterministic output). Every answer traces back to specific data products with full lineage. If the data is wrong, the lineage tells you exactly which source is responsible.',
  },
  {
    q: '"This seems too good to be true."',
    a: 'We have 850+ automated tests. Run them yourself: npm test. Deploy the demo: ./scripts/demo.sh. Connect your own sources. Ask your own questions. We don\'t ask you to trust a slide deck. We ask you to try it.',
  },
];

export function ToughQuestions() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text mb-4">
              Questions every CTO and CISO asks. Answered.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              We&apos;ve heard every objection. Here are honest answers — no marketing copy.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {questions.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-200 ${
                  open === i
                    ? 'bg-white/8 border-cyan-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 p-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className={`font-semibold text-sm md:text-base leading-snug transition-colors ${
                    open === i ? 'text-cyan-400' : 'text-white/90'
                  }`}>
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`shrink-0 h-5 w-5 text-white/40 mt-0.5 transition-transform duration-200 ${
                      open === i ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-white/70 leading-relaxed border-t border-white/10 pt-4">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FloatingElement>
      </div>
    </section>
  );
}
