'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [notes, setNotes] = useState('')
  const [healthScore, setHealthScore] = useState(100)

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    setName(value)
    if (!slug || slug === nameToSlug(name)) {
      setSlug(nameToSlug(value))
    }
  }

  function nameToSlug(n: string): string {
    return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/portal/admin/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
        healthScore,
      }),
    })

    if (res.ok) {
      const org = await res.json() as { id: string }
      router.replace(`/admin/clients/${org.id}`)
    } else {
      const d = await res.json() as { error?: string }
      setError(d.error ?? 'Failed to create client')
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50 focus:border-[#00B8D4]/50'
  const labelClass = 'block text-sm font-medium text-white/70 mb-1'

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/clients" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-white">New Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-black/40 rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Organisation Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Company Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                required
                autoFocus
                placeholder="Acme Corp"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                required
                placeholder="acme-corp"
                pattern="^[a-z0-9\-]+$"
                className={inputClass}
              />
              <p className="text-xs text-white/30 mt-1">Lowercase letters, numbers and hyphens only</p>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="CHURNED">Churned</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Billing Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="billing@acmecorp.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+44 20 1234 5678"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://acmecorp.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Health Score</label>
              <input
                type="number"
                min={0}
                max={100}
                value={healthScore}
                onChange={e => setHealthScore(Number(e.target.value))}
                className={inputClass}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Internal Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Any relevant context..."
                className={inputClass + ' resize-none'}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
            ) : (
              'Create client'
            )}
          </button>
          <Link
            href="/admin/clients"
            className="border border-white/10 text-white/50 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
