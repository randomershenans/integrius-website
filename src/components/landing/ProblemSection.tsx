import { FloatingElement } from '@/components/landing/FloatingElement';

const problems = [
  {
    number: '01',
    title: 'No common language across systems',
    body: 'Salesforce calls it AccountId. Shopify calls it customer.id. HubSpot calls it vid. Same concept, different names, no common language — and nobody owns the translation.',
  },
  {
    number: '02',
    title: '4-month "unified view" projects that go stale',
    body: 'Every attempt at a unified customer view produces a brittle CSV export and point-to-point pipelines. Each new consumer needs a new integration. The last one finished six months ago. It&apos;s already wrong.',
  },
  {
    number: '03',
    title: 'Permissions are a maze',
    body: 'Nobody knows who has access to what. Field-level controls are non-existent. Audit trails are incomplete. Companies don&apos;t share data internally because they can&apos;t prove who can see it.',
  },
  {
    number: '04',
    title: 'BI tools require the cloud',
    body: 'Tableau, ThoughtSpot, and Power BI Copilot all send data to external servers. For regulated industries — finance, healthcare, defence — this is a non-starter, not a risk to manage.',
  },
  {
    number: '05',
    title: 'Analytics is a bolt-on afterthought',
    body: 'Separate SDKs for Mixpanel, Amplitude, and Segment. Each with its own data silo. None of them governed. Tracking plans drift. Attribution breaks. Nobody trusts the numbers.',
  },
  {
    number: '06',
    title: 'Competing dashboards with conflicting numbers',
    body: 'Teams maintain their own dashboards. The sales team shows one MRR number. Finance shows another. Reconciliation consumes weeks per quarter. There is no single source of truth.',
  },
  {
    number: '07',
    title: 'Business users wait days for reports',
    body: 'Every question goes through the data team backlog. "I need to know how many customers churned last month" becomes a ticket that lands in two weeks, answered in a spreadsheet that doesn&apos;t update.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text mb-4">
              Every enterprise faces the same data reality.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Seven problems. Every one of them costs you time, money, and credibility. All seven are solved by one platform.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {problems.slice(0, 6).map((problem) => (
              <div
                key={problem.number}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors group"
              >
                <span className="text-xs font-mono text-cyan-500/60 mb-3 block">{problem.number}</span>
                <h3 className="text-base font-semibold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {problem.title}
                </h3>
                <p
                  className="text-sm text-white/60 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: problem.body }}
                />
              </div>
            ))}
          </div>

          {/* Problem 7 — full width, highlighted */}
          <div className="mt-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 border border-cyan-500/20">
              <span className="text-xs font-mono text-cyan-500/60 mb-3 block">{problems[6].number}</span>
              <h3 className="text-base font-semibold text-white mb-3">{problems[6].title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{problems[6].body}</p>
            </div>
          </div>
        </FloatingElement>
      </div>
    </section>
  );
}
