'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Key, Database, CalendarClock, Clock, Copy, CheckCheck, ShieldCheck } from 'lucide-react'

interface License {
  id: string
  license_key: string
  product: string
  tier: string
  status: string
  seats: number
  max_api_calls: number | null
  max_data_sources: number | null
  starts_at: string
  expires_at: string | null
}

const PRODUCT_LABELS: Record<string, string> = {
  CORE: 'Integrius Core',
  OPTIC: 'Integrius Optic',
  SEARCH: 'Integrius Search',
  SDK: 'Integrius SDK',
  PLATFORM: 'Integrius Platform',
}

const TIER_STYLES: Record<string, { label: string; className: string }> = {
  STARTER:    { label: 'Starter',    className: 'bg-white/10 text-white/60 border-white/20' },
  GROWTH:     { label: 'Growth',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  ENTERPRISE: { label: 'Enterprise', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  PLATFORM:   { label: 'Platform',   className: 'bg-[#00B8D4]/15 text-[#00B8D4] border-[#00B8D4]/30' },
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-green-500/15 text-green-400 border-green-500/30',
  EXPIRED:   'bg-red-500/15 text-red-400 border-red-500/30',
  REVOKED:   'bg-red-500/15 text-red-400 border-red-500/30',
  SUSPENDED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

function RenewalBadge({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) {
    return <span className="text-xs text-white/30 flex items-center gap-1"><ShieldCheck size={11} /> Ongoing</span>
  }
  const days = daysUntil(expiresAt)
  const formatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(expiresAt))

  if (days < 0) {
    return <span className="text-xs text-red-400 flex items-center gap-1"><Clock size={11} /> Expired {formatted}</span>
  }
  if (days <= 30) {
    return (
      <span className="text-xs text-yellow-400 flex items-center gap-1 font-medium">
        <Clock size={11} /> Renews {formatted} · {days}d left
      </span>
    )
  }
  return (
    <span className="text-xs text-white/40 flex items-center gap-1">
      <CalendarClock size={11} /> Renews {formatted}
    </span>
  )
}

function CopyKey({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(licenseKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs font-mono text-white/30 hover:text-white/60 transition-colors group"
      title="Copy license key"
    >
      <span className="truncate max-w-[200px]">{licenseKey}</span>
      {copied
        ? <CheckCheck size={11} className="text-green-400 shrink-0" />
        : <Copy size={11} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      }
    </button>
  )
}

export default function ClientDashboard() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/portal/client/licenses', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? 'Failed to load licenses')
        setLoading(false)
        return
      }
      setLicenses(await res.json() as License[])
      setLoading(false)
    }
    load()
  }, [])

  const active = licenses.filter(l => l.status === 'ACTIVE')
  const totalDataSources = active.reduce((sum, l) => sum + (l.max_data_sources ?? 0), 0)
  const nextExpiry = active
    .filter(l => l.expires_at)
    .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())[0]

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Your Integrius licenses and entitlements</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Key size={14} className="text-white/40" />
            <p className="text-xs text-white/40">Active Licenses</p>
          </div>
          <p className="text-3xl font-bold text-[#00B8D4]">{active.length}</p>
          <p className="text-xs text-white/20 mt-1">{licenses.length} total</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} className="text-white/40" />
            <p className="text-xs text-white/40">Data Sources</p>
          </div>
          <p className="text-3xl font-bold text-white">{totalDataSources > 0 ? totalDataSources : '—'}</p>
          <p className="text-xs text-white/20 mt-1">across active licenses</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock size={14} className="text-white/40" />
            <p className="text-xs text-white/40">Next Renewal</p>
          </div>
          {nextExpiry?.expires_at ? (
            <>
              <p className={`text-xl font-bold ${daysUntil(nextExpiry.expires_at) <= 30 ? 'text-yellow-400' : 'text-white'}`}>
                {daysUntil(nextExpiry.expires_at)}d
              </p>
              <p className="text-xs text-white/20 mt-1">
                {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(nextExpiry.expires_at))}
              </p>
            </>
          ) : (
            <p className="text-xl font-bold text-white/30">—</p>
          )}
        </div>
      </div>

      {/* License cards */}
      <h2 className="font-semibold text-white mb-4">Your Licenses</h2>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-red-400 text-sm">{error}</p>
      ) : licenses.length === 0 ? (
        <p className="py-8 text-center text-white/30 text-sm">No licenses found. Contact support if this is unexpected.</p>
      ) : (
        <div className="space-y-4">
          {licenses.map(l => {
            const tier = TIER_STYLES[l.tier] ?? TIER_STYLES.STARTER
            return (
              <div key={l.id} className="bg-black/40 rounded-xl border border-white/10 p-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="font-semibold text-white">{PRODUCT_LABELS[l.product] ?? l.product}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${tier.className}`}>
                        {tier.label}
                      </span>
                    </div>
                    <CopyKey licenseKey={l.license_key} />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[l.status] ?? STATUS_STYLES.SUSPENDED}`}>
                      {l.status}
                    </span>
                  </div>
                </div>

                {/* Entitlements */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {l.max_data_sources != null && (
                    <div className="bg-white/5 rounded-lg px-4 py-3">
                      <p className="text-xs text-white/40 mb-0.5">Data Sources</p>
                      <p className="text-lg font-semibold text-white">{l.max_data_sources.toLocaleString()}</p>
                    </div>
                  )}
                  {l.max_api_calls != null && (
                    <div className="bg-white/5 rounded-lg px-4 py-3">
                      <p className="text-xs text-white/40 mb-0.5">API Calls / mo</p>
                      <p className="text-lg font-semibold text-white">{l.max_api_calls.toLocaleString()}</p>
                    </div>
                  )}
                  {l.seats > 1 && (
                    <div className="bg-white/5 rounded-lg px-4 py-3">
                      <p className="text-xs text-white/40 mb-0.5">Seats</p>
                      <p className="text-lg font-semibold text-white">{l.seats}</p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-white/30">
                    Active since {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(l.starts_at))}
                  </span>
                  <RenewalBadge expiresAt={l.expires_at} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
