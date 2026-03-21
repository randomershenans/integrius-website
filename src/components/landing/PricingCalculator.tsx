'use client';
import { ArrowRight, Check, Box } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Pilot',
    price: '€5,000',
    period: '/ month',
    billing: '6-month commitment · self-hosted',
    description: 'Prove the value of a unified data layer in your environment. Scoped to get you live fast, and leave you wanting more.',
    cta: 'Start a Pilot',
    ctaLink: '/contact',
    highlight: false,
    features: [
      'Up to 20 Data Sources',
      'Unlimited Data Products',
      'Full dependency graph & blast radius',
      'Standard field mapping & transformation',
      'Governance (warn mode)',
      'Audit history',
      'Self-hosted on your infrastructure',
      'Onboarding support',
      '90-day value review included',
    ],
  },
  {
    name: 'Enterprise',
    price: '€18,000',
    period: '/ month',
    billing: '(billed annually)',
    description: 'For organisations running Integrius as a core data platform across multiple domains',
    cta: 'Talk to Sales',
    ctaLink: '/contact',
    highlight: true,
    features: [
      'Unlimited Data Sources',
      'Unlimited Data Products',
      'Full dependency graph & blast radius',
      'Governance modes (warn + enforce)',
      'Override reasoning & audit trail',
      'Org scopes (domains, environments, teams)',
      'SSO / SCIM',
      'Self-hosted',
      'Standard SLA',
    ],
  },
  {
    name: 'Platform',
    price: 'From €320,000',
    period: '/ year',
    billing: '(custom contract)',
    description: 'For organisations where data changes can halt operations, trigger compliance incidents, or impact revenue',
    cta: 'Contact Us',
    ctaLink: '/contact',
    highlight: false,
    features: [
      'Scales with your organisation',
      'Multi-domain, multi-region setups',
      'Search API included',
      'Advanced impact simulation',
      'Extended audit & compliance exports',
      'Dedicated support & SLA',
    ],
  },
];

export default function PricingCalculator() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 rounded-lg relative z-10">
      <div className="text-center mb-12 p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Box className="w-6 h-6 text-cyan-400" />
          <span className="text-lg font-semibold text-white">Start with a Pilot. Expand When You&apos;re Ready.</span>
        </div>
        <p className="text-lg text-white">
          <strong>The pilot is deliberately scoped: 20 data sources, self-hosted, 6 months. Enough to prove the value. Not enough to satisfy it.</strong>
        </p>
        <p className="mt-2 text-white/70">Enterprise and Platform are unlimited. When you hit the ceiling, the upgrade conversation starts itself.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
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

      <div className="text-center p-6 rounded-xl mb-16 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/10">
        <p className="text-base font-medium text-white/90">
          Every customer starts with a pilot. Most hit the 20-source ceiling before month 4 and expand. That&apos;s the point.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-2xl font-bold text-center mb-2 text-white">Decision-Layer Capabilities</h3>
        <p className="text-center mb-8 text-white/60">Built on top of unified data</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Integrius SDK</h4>
              <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Live on npm</span>
            </div>
            <p className="text-sm text-white/60">For developers building products on your unified data layer. Auto-mapping, schema management, and API generation.</p>
          </div>
          <div className="p-6 rounded-xl opacity-60 bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white/70">Integrius Data Consumer</h4>
              <span className="px-2 py-1 rounded-full text-xs bg-white/10 text-white/50">Coming Soon</span>
            </div>
            <p className="text-sm text-white/50">For analytics teams and BI tools. Feed unified datasets directly into your reporting stack.</p>
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-b from-cyan-500/10 to-purple-500/5 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Unified Search API</h4>
              <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Available</span>
            </div>
            <p className="text-sm font-medium mb-2 text-white/80">Real-time search across all your governed data products.</p>
            <div className="mb-4">
              <p className="text-2xl font-bold text-cyan-400 mb-1">€8,000<span className="text-sm font-normal text-white/50">/month</span></p>
              <p className="text-xs text-white/50">Add-on for Enterprise & Platform Lite</p>
              <p className="text-xs text-emerald-400 mt-2">✓ Included with Platform tier</p>
            </div>
            <Link
              href="/products/search"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-all"
            >
              Learn More
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
