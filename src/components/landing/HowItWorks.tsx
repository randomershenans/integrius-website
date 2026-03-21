'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Database, Layers, GitBranch, Box, Shield } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: Database,
    title: 'Connect Your Data Sources',
    description: 'Databases, APIs, SaaS tools. Connect them all. We auto-discover fields and relationships. Your systems stay running exactly as they are. No migrations, no rewrites.',
    highlight: 'Works with legacy and modern systems alike.',
  },
  {
    icon: Layers,
    title: 'Define Standard Fields',
    description: '"customer_email", "user_email", "Email". Define once what these mean in your organisation. This becomes your single source of truth.',
    highlight: 'One definition. Used everywhere. No more naming chaos.',
  },
  {
    icon: GitBranch,
    title: 'Map Source Fields to Standards',
    description: 'Connect each source\'s messy field names to your standard definitions. When a source changes, you update one mapping, not fifty downstream reports.',
    highlight: 'Standardize once, benefit everywhere.',
  },
  {
    icon: Box,
    title: 'Build Data Products',
    description: 'Create governed APIs that expose your standardised data. Select which standard fields to include, choose your sources, and deploy. Dependencies tracked automatically.',
    highlight: 'Clean APIs built on your canonical schema.',
  },
  {
    icon: Shield,
    title: 'Know What Breaks Before You Break It',
    description: 'Every connection is tracked. Click any source or product and instantly see its blast radius: what depends on it, what would break if it changed.',
    highlight: 'The dependency graph that makes enterprises agile again.',
  },
];

export default function HowItWorks() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-transparent bg-clip-text"
        >
          How It Works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg max-w-3xl mx-auto text-white/80"
        >
          Five steps to finally making changes without fear.
        </motion.p>
      </div>

      <div className="space-y-24">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            <div className="w-full md:w-1/2">
              <h3 className="text-2xl font-semibold mb-4 text-white flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#00B8D4]/10 to-[#0091EA]/10">
                  <step.icon className="w-6 h-6 text-[#00B8D4]" />
                </div>
                Step {index + 1}: {step.title}
              </h3>
              <p className="mb-4 text-white/80">{step.description}</p>
              <div className="p-4 rounded-lg bg-[#00B8D4]/10">
                <p className="text-sm font-medium text-[#00B8D4]">{step.highlight}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-24"
      >
        <h3 className="text-2xl font-bold text-white mb-8">Ready to Experience the Power of Unified Data?</h3>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-8 py-3 rounded-lg font-semibold text-base transition-all"
        >
          Book a Demo
          <ArrowRight className="h-5 w-5" />
        </Link>
      </motion.div>
    </div>
  );
}
