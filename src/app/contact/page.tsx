'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Building, User, MessageSquare, ArrowRight } from 'lucide-react';
import { SpaceBackground } from '@/components/landing/SpaceBackground';
import { FlyingDataIcons } from '@/components/landing/FlyingDataIcons';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmitted(true);
    } catch {
      setError('Failed to send message. Please try again or email us at contact@integri.us');
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex flex-col min-h-screen text-white">
      <SpaceBackground />
      <FlyingDataIcons />
      <SiteHeader />

      <main className="flex-1 pt-16">
        <section className="min-h-screen flex items-center justify-center relative py-24">
          <div className="container px-4 md:px-6 relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="p-8 bg-black/50 backdrop-blur-lg rounded-xl"
            >
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4 text-center text-white">
                Let&apos;s Talk
              </h1>
              <p className="text-xl text-center mb-12 text-white/80">
                Ready to transform your data infrastructure? Get in touch with our team.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                      <User className="w-4 h-4" /> Name
                    </label>
                    <input
                      type="text" id="name" name="name" required
                      value={formData.name} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#00B8D4] transition-colors placeholder:text-white/30"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                      <Mail className="w-4 h-4" /> Email
                    </label>
                    <input
                      type="email" id="email" name="email" required
                      value={formData.email} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#00B8D4] transition-colors placeholder:text-white/30"
                      placeholder="your.email@company.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                      <Building className="w-4 h-4" /> Company
                    </label>
                    <input
                      type="text" id="company" name="company" required
                      value={formData.company} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#00B8D4] transition-colors placeholder:text-white/30"
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="flex items-center gap-2 mb-2 text-sm font-medium text-white">
                      <MessageSquare className="w-4 h-4" /> Message
                    </label>
                    <textarea
                      id="message" name="message" required rows={6}
                      value={formData.message} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white focus:outline-none focus:border-[#00B8D4] transition-colors resize-none placeholder:text-white/30"
                      placeholder="Tell us about your data integration challenges..."
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white py-4 text-lg rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? 'Sending...' : 'Send Message'}
                    {!sending && <ArrowRight className="h-5 w-5" />}
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-white">Thanks for reaching out!</h2>
                  <p className="text-lg mb-8 text-white/80">
                    We&apos;ll get back to you within 24 hours to discuss how Integrius can transform your data infrastructure.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Back to Home
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
