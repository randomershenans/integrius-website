'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Key, AlertTriangle, Search } from 'lucide-react'

interface License {
  id: string
  license_key: string
  product: string
  tier: string
  status: string
  seats: number
  max_api_calls: number | null
  max_data_sources: number | null
  monthly_value: string
  starts_at: string
  expires_at: string | null
  revoked_at: string | null
  revoked_reason: string | null
  portal_organizations: { id: string; name: string; email: string; slug: string } | null
}

const PRODUCT_LABELS: Record<string, string> = {
  CORE: 'Core', OPTIC: 'Optic', SEARCH: 'Search', SDK: 'SDK', PLATFORM: 'Platform',
}

const TIER_STYLES: Record<string, string> = {
  STARTER:    'bg-white/10 text-white/50 border-white/20',
  GROWTH:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ENTERPRISE: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  PLATFORM:   'bg-[#00B8D4]/15 text-[#00B8D4] border-[#00B8D4]/30',
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-green-500/15 text-green-400 border-green-500/30',
  EXPIRED:   'bg-red-500/15 text-red-400 border-red-500/30',
  REVOKED:   'bg-red-500/15 text-red-400 border-red-500/30',
  SUSPENDED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

function fmt(d: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

const FILTERS = ['ALL', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'REVOKED', 'SUSPENDED'] as const
type Filter = typeof FILTERS[number]

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/portal/admin/licenses')
      .then(r => r.json())
      .then(d => { setLicenses(d as License[]); setLoading(false) })
  }, [])

  const filtered = licenses.filter(l => {
    if (filter === 'EXPIRING') {
      return l.status === 'ACTIVE' && l.expires_at && daysUntil(l.expires_at) <= 60
    }
    if (filter !== 'ALL') return l.status === filter
    return true
  }).filter(l => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      l.portal_organizations?.name.toLowerCase().includes(q) ||
      l.license_key.toLowerCase().includes(q) ||
      l.product.toLowerCase().includes(q)
    )
  })

  const expiringSoon = licenses.filter(l =>
    l.status === 'ACTIVE' && l.expires_at && daysUntil(l.expires_at) <= 60
  ).length

  const totalMrr = licenses
    .filter(l => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + Number(l.monthly_value), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Licenses</h1>
          <p className="text-white/40 text-sm mt-1">
            {licenses.filter(l => l.status === 'ACTIVE').length} active &middot; £{totalMrr.toLocaleString('en-GB', { minimumFractionDigits: 0 })}/mo
          </p>
        </div>
        {expiringSoon > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
            <AlertTriangle size={14} className="text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">{expiringSoon} expiring within 60 days</span>
          </div>
        )}
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-[#00B8D4]/20 text-[#00B8D4] border border-[#00B8D4]/30'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {f === 'EXPIRING' ? '⚠ Expiring' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client or key..."
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
          />
        </div>
      </div>

      <div className="bg-black/40 rounded-xl border border-white/10">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/10 grid grid-cols-12 gap-4 text-xs font-medium text-white/30 uppercase tracking-wide">
              <div className="col-span-3">Client</div>
              <div className="col-span-2">Product / Tier</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Renewal</div>
              <div className="col-span-1">MRR</div>
              <div className="col-span-2">Key</div>
            </div>
            <div className="divide-y divide-white/5">
              {filtered.map(l => {
                const days = l.expires_at ? daysUntil(l.expires_at) : null
                const isWarn = days !== null && days <= 60 && l.status === 'ACTIVE'
                const isOverdue = days !== null && days < 0

                return (
                  <div key={l.id} className={`grid grid-cols-12 gap-4 px-6 py-4 items-center ${isWarn ? 'bg-yellow-500/[0.03]' : ''}`}>
                    <div className="col-span-3 min-w-0">
                      {l.portal_organizations ? (
                        <Link
                          href={`/admin/clients/${l.portal_organizations.id}`}
                          className="font-medium text-white/90 hover:text-[#00B8D4] transition-colors truncate block"
                        >
                          {l.portal_organizations.name}
                        </Link>
                      ) : (
                        <span className="text-white/30 text-sm">—</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-white/80">Integrius {PRODUCT_LABELS[l.product] ?? l.product}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${TIER_STYLES[l.tier] ?? TIER_STYLES.STARTER}`}>
                        {l.tier.charAt(0) + l.tier.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[l.status] ?? STATUS_STYLES.SUSPENDED}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      {l.expires_at ? (
                        <div>
                          <p className={`text-xs font-medium ${isOverdue ? 'text-red-400' : isWarn ? 'text-yellow-400' : 'text-white/60'}`}>
                            {isOverdue ? 'Expired' : `${days}d`}
                          </p>
                          <p className="text-xs text-white/30">{fmt(l.expires_at)}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-white/30">Ongoing</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-semibold text-white">
                        £{Number(l.monthly_value).toLocaleString('en-GB', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-xs font-mono text-white/25 truncate">{l.license_key}</p>
                    </div>
                  </div>
                )
              })}
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Key size={28} className="text-white/20 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">
                    {search || filter !== 'ALL' ? 'No licenses match your filters.' : 'No licenses yet.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
