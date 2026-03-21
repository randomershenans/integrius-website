'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageSquare, FileText, Bell, Zap, Eye, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { FloatingElement } from '@/components/landing/FloatingElement';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

const modes = [
  {
    icon: MessageSquare,
    title: 'Ask',
    description: 'One question. One answer. Instant. Type anything about your business and get a direct, accurate answer from every system you have connected.',
  },
  {
    icon: Eye,
    title: 'Explore',
    description: 'Conversational drill-down. Follow-up questions hold context. Go from a top-level number to the individual account that moved it in the same conversation.',
  },
  {
    icon: FileText,
    title: 'Report',
    description: 'Freeze any conversation into a formatted deliverable. PDF, PPTX, or shareable link. Schedule it to run on live data every Friday at 8am.',
  },
  {
    icon: Bell,
    title: 'Monitor',
    description: 'Set watchers on your data. Get found when something matters — before you have to go looking. PagerDuty for business metrics.',
  },
  {
    icon: Zap,
    title: 'Act',
    description: 'Coming in Phase 3. Identify something in your data, trigger an action. The boundary between insight and response disappears.',
  },
  {
    icon: Shield,
    title: 'Governed',
    description: 'Every answer respects the permissions from Core. You cannot ask about data you are not allowed to see. Governance is automatic, not optional.',
  },
];

const conversation = [
  { role: 'user', text: 'What was our revenue last quarter?' },
  { role: 'optic', text: '12.4M across all regions. EMEA is your strongest at 6.1M, up 18% vs Q3.' },
  { role: 'user', text: 'Which customers drove the EMEA growth?' },
  { role: 'optic', text: 'Top 3: Acme Corp (+340k), GlobalTech (+280k), NordCo (+210k). All enterprise tier.' },
  { role: 'user', text: 'Are any of them at churn risk?' },
  { role: 'optic', text: 'NordCo has had no logins in 14 days and 2 open support tickets. Worth flagging.' },
  { role: 'user', text: 'Turn this into a board slide.' },
  { role: 'optic', text: 'Done. Downloading PPTX.' },
];

const monitors = [
  'Alert me when MRR drops more than 5% month over month',
  'Tell me if any enterprise customer has zero logins for 7 days',
  'Flag any invoice over 50k unpaid for 45 days',
  'Notify me if pipeline coverage drops below 3x',
  'Alert the sales team if a deal has had no activity in 14 days',
];

export default function IntegriusOpticPage() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center relative">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/60 text-sm font-medium mb-2">
                  Coming Soon
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white">Integrius Optic</h1>
                <p className="text-2xl font-semibold text-[#00B8D4]">See Everything. Ask Anything. Know What Matters.</p>
                <p className="mx-auto max-w-[700px] text-white/80 text-lg md:text-xl">
                  The conversational data interface for the enterprise. Every business question, answered in plain English, from every system you have connected. Not a dashboard. Not a BI tool. The answer.
                </p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Join the Waitlist <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Conversation demo */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                This Is What It Looks Like
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                One conversation. CRM, ERP, billing, and support data. No SQL. No exports. No waiting.
              </p>
              <div className="max-w-2xl mx-auto space-y-4">
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.08 }}
                    viewport={{ once: true }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-[#00B8D4]/20 border border-[#00B8D4]/30 text-white'
                        : 'bg-white/5 border border-white/10 text-white/80'
                    }`}>
                      {msg.role === 'optic' && (
                        <span className="text-xs font-semibold text-[#00B8D4] block mb-1">Optic</span>
                      )}
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Modes */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.2}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Five Ways to Work With Your Data
              </h2>
              <p className="text-lg text-center mb-12 max-w-3xl mx-auto text-white/80">
                Not one tool with one use case. Five interaction modes on one unified data layer.
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {modes.map((mode, index) => (
                  <motion.div key={mode.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }} className="p-6 rounded-xl border bg-black/30 border-white/10">
                    <mode.icon className="w-8 h-8 mb-4 text-[#00B8D4]" />
                    <h3 className="text-xl font-semibold mb-2 text-white">{mode.title}</h3>
                    <p className="text-white/70">{mode.description}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Monitor mode spotlight */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 border border-cyan-500/20 backdrop-blur-lg rounded-xl" delay={0.3}>
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="lg:w-1/2 space-y-4">
                  <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                    Stop Checking Dashboards
                  </h2>
                  <p className="text-lg text-white/80">
                    Set conditions on your data. Optic finds you when something matters. Not after you log in and go looking. The moment it happens.
                  </p>
                  <p className="text-white/60">
                    PagerDuty for business metrics. Your data has always-on watchers. You get notified when they fire.
                  </p>
                </div>
                <div className="lg:w-1/2 space-y-3">
                  {monitors.map((monitor, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }} viewport={{ once: true }} className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
                      <Bell className="w-4 h-4 mt-0.5 flex-shrink-0 text-cyan-400" />
                      <p className="text-sm text-white/70 font-mono">{monitor}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* Why it's different */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="p-8 bg-black/50 backdrop-blur-lg rounded-xl" delay={0.3}>
              <h2 className="text-3xl font-bold tracking-tighter text-center mb-12 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text">
                Why Not Just Use ChatGPT With a CSV?
              </h2>
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  'Optic already knows your entire unified schema — every field, every mapping, every data contract across every connected system',
                  'One question spans CRM, ERP, billing, and support simultaneously. Not one database.',
                  'Governance inherited from Core — you cannot ask about data you are not permitted to see',
                  'Live data, not a snapshot you uploaded yesterday',
                  'Reports and monitors run on current data, not a static file',
                  'Context-aware — Optic knows what your field names mean, not just what they are called',
                ].map((point, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.08 }} viewport={{ once: true }} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-cyan-400" />
                    <p className="text-white/80">{point}</p>
                  </motion.div>
                ))}
              </div>
            </FloatingElement>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <FloatingElement className="flex flex-col items-center justify-center space-y-4 bg-black/50 backdrop-blur-lg p-8 rounded-xl" delay={0.5}>
              <h3 className="text-2xl font-bold text-center text-white">Be First When Optic Launches</h3>
              <p className="text-lg text-white/80 text-center max-w-2xl">Join the waitlist and get early access for your pilot deployment.</p>
              <div className="mt-8">
                <Link href="/contact" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all">
                  Join the Waitlist <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FloatingElement>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
