'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Key, AlertTriangle, FileText, Zap, Plus, ArrowRight } from 'lucide-react'

interface BizStats {
  mrr: number
  arr: number
  totalClients: number
  activeClients: number
  activeLicenses: number
  churnRate: number
}

interface License {
  id: string
  license_key: string
  product: string
  tier: string
  status: string
  monthly_value: string
  expires_at: string | null
  portal_organizations: { id: string; name: string } | null
}

interface OrgRow {
  id: string
  name: string
  status: string
  mrrContribution: number
  createdAt: string
}

interface CmsStats {
  published: number
  draft: number
  scheduled: number
  pending_gen: number
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000)
}

const PRODUCT_LABELS: Record<string, string> = {
  CORE: 'Core', OPTIC: 'Optic', SEARCH: 'Search', SDK: 'SDK', PLATFORM: 'Platform',
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    'bg-green-500/15 text-green-400 border-green-500/30',
  TRIAL:     'bg-blue-500/15 text-blue-400 border-blue-500/30',
  SUSPENDED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  CHURNED:   'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function AdminDashboard() {
  const [biz, setBiz] = useState<BizStats | null>(null)
  const [licenses, setLicenses] = useState<License[]>([])
  const [clients, setClients] = useState<OrgRow[]>([])
  const [cms, setCms] = useState<CmsStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/portal/admin/licenses').then(r => r.ok ? r.json() : []),
      fetch('/api/portal/admin/organizations').then(r => r.ok ? r.json() : []),
      fetch('/api/admin/stats').then(r => r.ok ? r.json() : null),
    ]).then(([bizData, licData, orgData, cmsData]) => {
      setBiz(bizData)
      setLicenses(licData ?? [])
      setClients(orgData ?? [])
      setCms(cmsData)
      setLoading(false)
    })
  }, [])

  const expiring = licenses
    .filter(l => l.status === 'ACTIVE' && l.expires_at && daysUntil(l.expires_at) <= 60)
    .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())
    .slice(0, 6)

  const recentClients = [...clients]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all"
        >
          <Plus size={14} />
          New client
        </Link>
      </div>

      {/* Business metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-black/40 rounded-xl border border-white/10 p-5 lg:col-span-1">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5"><TrendingUp size={11} />MRR</p>
          <p className="text-2xl font-bold text-white">
            £{biz ? biz.mrr.toLocaleString('en-GB') : '—'}
          </p>
          <p className="text-xs text-white/30 mt-0.5">per month</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <p className="text-xs text-white/40 mb-1">ARR</p>
          <p className="text-2xl font-bold text-white">
            £{biz ? biz.arr.toLocaleString('en-GB') : '—'}
          </p>
          <p className="text-xs text-white/30 mt-0.5">annualised</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5"><Users size={11} />Clients</p>
          <p className="text-2xl font-bold text-white">{biz?.activeClients ?? '—'}</p>
          <p className="text-xs text-white/30 mt-0.5">of {biz?.totalClients ?? '—'} total</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5"><Key size={11} />Licenses</p>
          <p className="text-2xl font-bold text-white">{biz?.activeLicenses ?? '—'}</p>
          <p className="text-xs text-white/30 mt-0.5">active</p>
        </div>
        <div className={`rounded-xl border p-5 ${expiring.length > 0 ? 'bg-yellow-500/[0.06] border-yellow-500/20' : 'bg-black/40 border-white/10'}`}>
          <p className={`text-xs mb-1 flex items-center gap-1.5 ${expiring.length > 0 ? 'text-yellow-400/70' : 'text-white/40'}`}>
            <AlertTriangle size={11} />Expiring soon
          </p>
          <p className={`text-2xl font-bold ${expiring.length > 0 ? 'text-yellow-400' : 'text-white'}`}>{expiring.length}</p>
          <p className={`text-xs mt-0.5 ${expiring.length > 0 ? 'text-yellow-400/50' : 'text-white/30'}`}>within 60 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Expiring licenses */}
        <div className="bg-black/40 rounded-xl border border-white/10">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Expiring licenses</h2>
            <Link href="/admin/licenses?filter=EXPIRING" className="text-xs text-[#00B8D4] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {expiring.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Key size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No licenses expiring in the next 60 days</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {expiring.map(l => {
                const days = daysUntil(l.expires_at!)
                return (
                  <Link
                    key={l.id}
                    href={l.portal_organizations ? `/admin/clients/${l.portal_organizations.id}` : '/admin/licenses'}
                    className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">
                        {l.portal_organizations?.name ?? 'Unassigned'}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Integrius {PRODUCT_LABELS[l.product] ?? l.product} · {l.tier.charAt(0) + l.tier.slice(1).toLowerCase()}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold shrink-0 ${days <= 14 ? 'text-red-400' : days <= 30 ? 'text-orange-400' : 'text-yellow-400'}`}>
                      {days}d
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent clients */}
        <div className="bg-black/40 rounded-xl border border-white/10">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Recent clients</h2>
            <Link href="/admin/clients" className="text-xs text-[#00B8D4] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Users size={24} className="text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">No clients yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentClients.map(org => (
                <Link
                  key={org.id}
                  href={`/admin/clients/${org.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-white/50">{org.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="text-sm font-medium text-white/90 truncate">{org.name}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold text-white">
                      £{org.mrrContribution.toLocaleString('en-GB')}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[org.status] ?? STATUS_STYLES.SUSPENDED}`}>
                      {org.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CMS quick stats */}
      <div className="bg-black/40 rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm flex items-center gap-2">
            <FileText size={14} className="text-white/40" />
            Website &amp; Blog
          </h2>
          <div className="flex items-center gap-3">
            <Link href="/admin/generate" className="text-xs text-[#00B8D4] hover:underline flex items-center gap-1">
              <Zap size={11} />Generate
            </Link>
            <Link href="/admin/articles" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1">
              Articles <ArrowRight size={11} />
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-4 divide-x divide-white/5">
          {[
            { label: 'Published', value: cms?.published ?? '—', color: 'text-green-400' },
            { label: 'Drafts',    value: cms?.draft ?? '—',      color: 'text-white/50' },
            { label: 'Scheduled', value: cms?.scheduled ?? '—',  color: 'text-[#00B8D4]' },
            { label: 'Gen queue', value: cms?.pending_gen ?? '—', color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="px-6 py-4">
              <p className="text-xs text-white/30 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
