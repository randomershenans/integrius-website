import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { FloatingElement } from '@/components/landing/FloatingElement';

const controls = [
  {
    label: 'Deployment',
    detail: 'Self-hosted only. Air-gapped supported. Zero outbound calls. No SaaS sub-processors.',
  },
  {
    label: 'Encryption at rest',
    detail: 'AES-256-GCM, bcrypt-12 passwords, SHA-256 API keys',
  },
  {
    label: 'RBAC',
    detail: '4 roles (admin / engineer / analyst / viewer) + custom per-permission grants',
  },
  {
    label: 'SSO',
    detail: 'SAML 2.0 + OIDC: Okta, Azure AD, Google Workspace, Auth0',
  },
  {
    label: 'Provisioning',
    detail: 'SCIM 2.0 (RFC 7644), Okta and Azure AD compatible',
  },
  {
    label: 'MFA',
    detail: 'TOTP (RFC 6238), encrypted secret storage',
  },
  {
    label: 'Concurrent sessions',
    detail: 'Per-user cap with oldest-session eviction. Active session list + targeted revoke.',
  },
  {
    label: 'Tamper-evident audit log',
    detail: 'HMAC-chained append-only audit. Append-only DB trigger. Per-org advisory lock. Walkable proof for regulators.',
  },
  {
    label: '21 CFR Part 11 e-signatures',
    detail: 'Re-authentication + reason + HMAC or Ed25519 signature, chained into the audit log. Bulk-sign behind a separate authority gate.',
  },
  {
    label: 'ALCOA+ data integrity',
    detail: 'Attributable, Legible, Contemporaneous, Original, Accurate plus Complete, Consistent, Enduring, Available. All nine attributes enforced.',
  },
  {
    label: 'SIEM export',
    detail: 'JSON/CSV to Splunk, Datadog, ELK, Sumo Logic. Webhook subscriptions for live event streaming.',
  },
  {
    label: 'GDPR',
    detail: 'Atomic erasure in one transaction: delete + anonymise + chained audit row. Article 15 subject-access endpoint included.',
  },
  {
    label: 'HIPAA',
    detail: 'BAA-ready posture. ePHI access logged, encrypted at rest, controlled by RBAC + permissions. Audit trail covers required disclosures.',
  },
  {
    label: 'FISMA / NIST 800-53',
    detail: 'Control families mapped (AC, AU, IA, SC, SI). Audit-ready evidence. FedRAMP-compatible deployment posture.',
  },
  {
    label: 'SOC 2',
    detail: '40 controls mapped, 15 fully in place, audit-ready evidence',
  },
  {
    label: 'Rate limiting',
    detail: 'Auth: 20/15min. Management: 300/min. Runtime: configurable per key',
  },
  {
    label: 'SSRF protection',
    detail: 'Blocks private IPs, loopback, link-local, cloud metadata endpoints. Enforced on connectors and webhook deliveries.',
  },
];

export function SecuritySection() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 md:px-6 mx-auto">
        <FloatingElement
          className="p-8 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 border border-cyan-500/20 backdrop-blur-lg rounded-xl"
          delay={0.1}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheck className="h-7 w-7 text-cyan-400" />
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-white">
              Every security question is pre-answered.
            </h2>
          </div>
          <p className="text-white/60 text-lg max-w-2xl mx-auto text-center mb-12">
            18 regulated-industry standards mapped to specific platform capabilities. SOC 2, HIPAA, GDPR, 21 CFR Part 11, FISMA / NIST 800-53, ALCOA+ and more. Your security team doesn&apos;t start from zero.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {controls.map((control) => (
              <div
                key={control.label}
                className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-cyan-500/30 transition-colors group"
              >
                <p className="text-xs font-mono text-cyan-400/80 mb-1 group-hover:text-cyan-400 transition-colors">
                  {control.label}
                </p>
                <p className="text-sm text-white/70 leading-snug">{control.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
            <div className="px-6 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400/70 font-mono mb-0.5">Compliance standards</p>
              <p className="text-2xl font-bold text-emerald-400">18 mapped</p>
            </div>
            <div className="px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs text-cyan-400/70 font-mono mb-0.5">Security questionnaire</p>
              <p className="text-2xl font-bold text-cyan-400">73 questions pre-filled</p>
            </div>
            <div className="px-6 py-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-xs text-purple-400/70 font-mono mb-0.5">Outbound API calls</p>
              <p className="text-2xl font-bold text-purple-400">Zero</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-cyan-500/20"
            >
              Request the full security questionnaire
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FloatingElement>
      </div>
    </section>
  );
}
