'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Users, Key, Activity, Plus } from 'lucide-react'

interface DashboardData {
  mrr: number
  arr: number
  totalClients: number
  activeClients: number
  activeLicenses: number
  churnRate: number
}

interface OrgRow {
  id: string
  name: string
  email: string
  status: string
  activeLicenseCount: number
  mrrContribution: number
  healthScore: number
  createdAt: string
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/30',
  TRIAL: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  SUSPENDED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  CHURNED: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function PortalAdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/portal/admin/dashboard').then(r => r.json()),
      fetch('/api/portal/admin/organizations').then(r => r.json()),
    ]).then(([d, o]) => {
      setStats(d as DashboardData)
      setOrgs((o as OrgRow[]).slice(0, 10))
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: 'MRR', value: `£${(stats?.mrr ?? 0).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'ARR', value: `£${(stats?.arr ?? 0).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Active Clients', value: String(stats?.activeClients ?? 0), icon: Users, color: 'text-[#00B8D4]' },
    { label: 'Active Licenses', value: String(stats?.activeLicenses ?? 0), icon: Key, color: 'text-purple-400' },
    { label: 'Churn Rate', value: `${stats?.churnRate ?? 0}%`, icon: Activity, color: stats?.churnRate ?? 0 > 10 ? 'text-red-400' : 'text-white' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Portal Dashboard</h1>
        <Link
          href="/portal/admin/clients/new"
          className="flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all"
        >
          <Plus size={15} />
          New client
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-10">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-black/40 rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className="text-white/30" />
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-black/40 rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Clients</h2>
          <Link href="/portal/admin/clients" className="text-sm text-[#00B8D4] hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-white/5">
          {orgs.map(org => (
            <div key={org.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/portal/admin/clients/${org.id}`}
                  className="font-medium text-white/90 hover:text-[#00B8D4] transition-colors"
                >
                  {org.name}
                </Link>
                <p className="text-xs text-white/40 mt-0.5">{org.email}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    £{org.mrrContribution.toLocaleString('en-GB', { minimumFractionDigits: 0 })}/mo
                  </p>
                  <p className="text-xs text-white/40">{org.activeLicenseCount} license{org.activeLicenseCount !== 1 ? 's' : ''}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[org.status] ?? STATUS_STYLES.SUSPENDED}`}>
                  {org.status}
                </span>
              </div>
            </div>
          ))}
          {orgs.length === 0 && (
            <p className="px-6 py-8 text-center text-white/30 text-sm">No clients yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
