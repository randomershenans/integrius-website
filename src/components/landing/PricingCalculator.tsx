'use client';
import { ArrowRight, Check, Search, MessageSquare, Layers } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Pilot',
    price: '€5,000',
    period: '/ month',
    billing: '6-month commitment · self-hosted',
    description: 'Prove the value of a unified data layer in your environment. Deliberately scoped to get you live fast.',
    cta: 'Start a Pilot',
    ctaLink: '/contact',
    highlight: false,
    features: [
      'Up to 20 data sources',
      'Single domain',
      'Full dependency graph & blast radius',
      'Standard field mapping & transformation',
      'Governance (warn mode)',
      'Audit history',
      'Self-hosted on your infrastructure',
      'Onboarding support',
      '90-day value review included',
      'Optic Lite bundled — no extra charge',
    ],
  },
  {
    name: 'Enterprise',
    price: '€18,000',
    period: '/ month',
    billing: 'billed annually',
    description: 'For organisations running Integrius as a core data platform across multiple domains.',
    cta: 'Talk to Sales',
    ctaLink: '/contact',
    highlight: true,
    features: [
      'Up to 50 data products',
      'Full dependency graph & blast radius',
      'Governance (warn + enforce modes)',
      'Override reasoning & audit trail',
      'Org scopes — domains, environments, teams',
      'SSO / SCIM',
      'Self-hosted',
      'Standard SLA',
      'Search API available as add-on',
      'Optic available as add-on',
    ],
  },
  {
    name: 'Platform',
    price: 'From €320,000',
    period: '/ year',
    billing: 'custom contract',
    description: 'For organisations where data changes can halt operations, trigger compliance incidents, or impact revenue.',
    cta: 'Contact Us',
    ctaLink: '/contact',
    highlight: false,
    features: [
      '100+ data products',
      'Scales with your organisation',
      'Multi-domain, multi-environment',
      'Advanced governance & compliance',
      'Extended audit & compliance exports',
      'Dedicated support & SLA',
      'Search API — included',
      'Optic — included',
    ],
  },
];

const bundles = [
  {
    icon: Layers,
    name: 'Core',
    tagline: 'The unified data layer',
    description: 'Governed data products, dependency graph, blast radius, full audit trail. The foundation everything else builds on.',
    included: ['Pilot · Enterprise · Platform'],
  },
  {
    icon: Search,
    name: 'Core + Search',
    tagline: 'Core · Integrius Search',
    description: 'Real-time unified search across all your governed data products. No indexing. One API call. Complete picture.',
    included: ['Search API available on Enterprise', 'Included with Platform'],
  },
  {
    icon: MessageSquare,
    name: 'Core + Optic',
    tagline: 'Core · Integrius Optic',
    description: 'Ask anything. Monitor everything. Your business users query your governed data in plain English — on-prem, no data leaving your network.',
    included: ['Optic available on Enterprise', 'Included with Platform'],
  },
  {
    icon: MessageSquare,
    name: 'Core + Search + Optic',
    tagline: 'The full platform',
    description: 'The complete Integrius stack. Every governed data product queryable in real-time, and accessible to every person in your organisation through a conversational interface.',
    included: ['Available on Enterprise (add-ons)', 'Both included with Platform'],
    highlight: true,
  },
];

export default function PricingCalculator() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 rounded-lg relative z-10">
      <div className="text-center mb-12 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
        <p className="text-lg font-semibold text-white mb-2">
          Priced on governed data products in production — not connectors, API calls, or seats.
        </p>
        <p className="text-white/70">
          Start with a Pilot. Most customers hit the ceiling before month 4 and want more. That&apos;s the point.
        </p>
      </div>

      {/* Tiers */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl p-6 flex flex-col ${
              tier.highlight
                ? 'bg-gradient-to-b from-cyan-500/20 to-purple-500/10 border-2 border-cyan-500/50'
                : 'bg-white/5 border border-white/10'
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500 text-white">Most Popular</span>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2 text-white">{tier.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${tier.highlight ? 'text-cyan-400' : 'text-white'}`}>{tier.price}</span>
                <span className="text-sm text-white/60">{tier.period}</span>
              </div>
              <p className="text-xs mt-1 text-white/50">{tier.billing}</p>
              <p className="mt-3 text-sm text-white/70">{tier.description}</p>
            </div>
            <ul className="space-y-3 mb-6 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.highlight ? 'text-cyan-400' : 'text-emerald-400'}`} />
                  <span className="text-sm text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={tier.ctaLink}
              className={`w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                tier.highlight
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {tier.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      {/* Product bundles */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-2 text-white">How Customers Buy</h3>
        <p className="text-center mb-8 text-white/60">Core is the foundation. Search and Optic extend it.</p>
        <div className="grid md:grid-cols-2 gap-5">
          {bundles.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.name}
                className={`p-6 rounded-xl border flex flex-col gap-3 ${
                  b.highlight
                    ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/5 border-cyan-500/30'
                    : 'bg-white/[0.04] border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${b.highlight ? 'bg-cyan-500/20' : 'bg-white/10'}`}>
                      <Icon className={`w-4 h-4 ${b.highlight ? 'text-cyan-400' : 'text-white/60'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{b.name}</p>
                      <p className="text-xs text-white/40">{b.tagline}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/70">{b.description}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {b.included.map(tag => (
                    <span key={tag} className="text-xs text-white/50 bg-white/5 border border-white/10 rounded px-2 py-0.5">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center p-6 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/10">
          <p className="text-sm text-white/70 mb-3">
            Enterprise customers who add both Search and Optic are often better served by Platform — all-in at a lower total cost.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Talk to us about the right fit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
