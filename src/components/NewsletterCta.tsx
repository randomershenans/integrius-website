'use client';

import { useState } from 'react';

// Configure your newsletter platform URL in NEXT_PUBLIC_NEWSLETTER_FORM_URL
// Works with ConvertKit, Loops, Beehiiv, or any POST form endpoint.
// Expected POST body: { email: string }

export default function NewsletterCta() {
  const [email,     setEmail]    = useState('');
  const [status,    setStatus]   = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const formUrl = process.env.NEXT_PUBLIC_NEWSLETTER_FORM_URL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formUrl || !email) return;
    setStatus('submitting');

    try {
      const res = await fetch(formUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="my-12 bg-gray-900 text-white rounded-2xl p-8">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-2">
          The Integrius Data Brief
        </p>
        <h3 className="text-xl font-bold mb-2">
          Data integration insights, twice a week.
        </h3>
        <p className="text-gray-400 text-sm mb-6">
          Problem-first thinking on data products, enterprise architecture, and AI readiness.
          No vendor fluff. Direct to your inbox.
        </p>

        {status === 'done' ? (
          <p className="text-green-400 font-medium text-sm">You are in. Check your inbox.</p>
        ) : !formUrl ? (
          <p className="text-gray-500 text-xs italic">Newsletter coming soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@company.com"
              className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="bg-brand-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {status === 'submitting' ? 'Subscribing...' : 'Subscribe free'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-400 text-xs mt-2">Something went wrong. Try again.</p>
        )}
      </div>
    </div>
  );
}
