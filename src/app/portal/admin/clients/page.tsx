'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

interface OrgRow {
  id: string
  name: string
  slug: string
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

export default function ClientsListPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [filtered, setFiltered] = useState<OrgRow[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portal/admin/organizations')
      .then(r => r.json())
      .then(d => {
        setOrgs(d as OrgRow[])
        setFiltered(d as OrgRow[])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(orgs)
    } else {
      const q = search.toLowerCase()
      setFiltered(orgs.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.slug.toLowerCase().includes(q)
      ))
    }
  }, [search, orgs])

  const totalMrr = orgs.reduce((sum, o) => sum + o.mrrContribution, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-white/40 text-sm mt-1">
            {orgs.length} client{orgs.length !== 1 ? 's' : ''} &middot; £{totalMrr.toLocaleString('en-GB', { minimumFractionDigits: 0 })}/mo total MRR
          </p>
        </div>
        <Link
          href="/portal/admin/clients/new"
          className="flex items-center gap-2 bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all"
        >
          <Plus size={15} />
          New client
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or slug..."
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50 focus:border-[#00B8D4]/50"
          />
        </div>
      </div>

      <div className="bg-black/40 rounded-xl border border-white/10">
        {loading ? (
          <div className="px-6 py-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/10 grid grid-cols-12 gap-4 text-xs font-medium text-white/30 uppercase tracking-wide">
              <div className="col-span-4">Client</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Licenses</div>
              <div className="col-span-2">MRR</div>
              <div className="col-span-2">Health</div>
            </div>
            <div className="divide-y divide-white/5">
              {filtered.map(org => (
                <Link
                  key={org.id}
                  href={`/portal/admin/clients/${org.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="col-span-4 min-w-0">
                    <p className="font-medium text-white/90 truncate">{org.name}</p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{org.email}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[org.status] ?? STATUS_STYLES.SUSPENDED}`}>
                      {org.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-white/70">{org.activeLicenseCount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-semibold text-white">
                      £{org.mrrContribution.toLocaleString('en-GB', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${org.healthScore >= 80 ? 'bg-green-500' : org.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${org.healthScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/40 w-8">{org.healthScore}%</span>
                    </div>
                  </div>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="px-6 py-8 text-center text-white/30 text-sm">
                  {search ? 'No clients match your search.' : 'No clients yet.'}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
