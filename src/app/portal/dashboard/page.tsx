'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Key, FileText, Activity, CheckCircle, XCircle, Clock } from 'lucide-react'

interface License {
  id: string
  licenseKey: string
  product: string
  tier: string
  status: string
  seats: number
  maxApiCalls: number | null
  maxDataSources: number | null
  startsAt: string
  expiresAt: string | null
  monthlyValue: string
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/30',
  EXPIRED: 'bg-red-500/15 text-red-400 border-red-500/30',
  REVOKED: 'bg-red-500/15 text-red-400 border-red-500/30',
  SUSPENDED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[status] ?? STATUS_STYLES.SUSPENDED}`}>
      {status}
    </span>
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
        const d = await res.json() as { error?: string }
        setError(d.error ?? 'Failed to load licenses')
        setLoading(false)
        return
      }
      setLicenses(await res.json() as License[])
      setLoading(false)
    }
    load()
  }, [])

  const activeLicenses = licenses.filter(l => l.status === 'ACTIVE')
  const totalMrr = licenses
    .filter(l => l.status === 'ACTIVE')
    .reduce((sum, l) => sum + Number(l.monthlyValue), 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Your Integrius licenses and usage overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Key size={14} className="text-white/40" />
            <p className="text-xs text-white/40">Active Licenses</p>
          </div>
          <p className="text-3xl font-bold text-[#00B8D4]">{activeLicenses.length}</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-white/40" />
            <p className="text-xs text-white/40">Monthly Value</p>
          </div>
          <p className="text-3xl font-bold text-white">
            £{totalMrr.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-white/40" />
            <p className="text-xs text-white/40">Total Licenses</p>
          </div>
          <p className="text-3xl font-bold text-white">{licenses.length}</p>
        </div>
      </div>

      {/* Licenses table */}
      <div className="bg-black/40 rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Your Licenses</h2>
        </div>

        {loading ? (
          <div className="px-6 py-12 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="px-6 py-8 text-center text-red-400 text-sm">{error}</p>
        ) : licenses.length === 0 ? (
          <p className="px-6 py-8 text-center text-white/30 text-sm">No licenses found. Contact support if this is unexpected.</p>
        ) : (
          <div className="divide-y divide-white/5">
            {licenses.map(l => (
              <div key={l.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white/90">{l.product}</span>
                    <span className="text-xs text-white/40">{l.tier}</span>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5 font-mono">{l.licenseKey}</p>
                  <div className="flex gap-4 mt-1">
                    {l.seats > 1 && (
                      <span className="text-xs text-white/40">{l.seats} seats</span>
                    )}
                    {l.maxApiCalls && (
                      <span className="text-xs text-white/40">{l.maxApiCalls.toLocaleString()} API calls/mo</span>
                    )}
                    {l.maxDataSources && (
                      <span className="text-xs text-white/40">{l.maxDataSources} data sources</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {l.expiresAt ? (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-white/40">
                        <Clock size={11} />
                        Expires {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(l.expiresAt))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">No expiry</span>
                  )}
                  <StatusBadge status={l.status} />
                  <span className="text-sm font-semibold text-white">
                    £{Number(l.monthlyValue).toLocaleString('en-GB', { minimumFractionDigits: 0 })}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
