'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Key, FileText, Plus, Trash2 } from 'lucide-react'

interface License {
  id: string
  licenseKey: string
  product: string
  tier: string
  status: string
  seats: number
  monthlyValue: string
  startsAt: string
  expiresAt: string | null
  revokedAt: string | null
  revokedReason: string | null
}

interface Invoice {
  id: string
  amount: string
  currency: string
  status: string
  period: string
  dueAt: string
  paidAt: string | null
}

interface Org {
  id: string
  name: string
  slug: string
  email: string
  phone: string | null
  website: string | null
  status: string
  healthScore: number
  notes: string | null
  createdAt: string
  licenses: License[]
  invoices: Invoice[]
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400 border-green-500/30',
  TRIAL: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  SUSPENDED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  CHURNED: 'bg-red-500/15 text-red-400 border-red-500/30',
  EXPIRED: 'bg-red-500/15 text-red-400 border-red-500/30',
  REVOKED: 'bg-red-500/15 text-red-400 border-red-500/30',
  PENDING: 'bg-white/10 text-white/50 border-white/10',
  PAID: 'bg-green-500/15 text-green-400 border-green-500/30',
  OVERDUE: 'bg-red-500/15 text-red-400 border-red-500/30',
  CANCELLED: 'bg-white/10 text-white/50 border-white/10',
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [org, setOrg] = useState<Org | null>(null)
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [showNewLicense, setShowNewLicense] = useState(false)

  // New license form state
  const [newProduct, setNewProduct] = useState('CORE')
  const [newTier, setNewTier] = useState('STARTER')
  const [newSeats, setNewSeats] = useState(1)
  const [newMonthlyValue, setNewMonthlyValue] = useState('')
  const [newMaxApi, setNewMaxApi] = useState('')
  const [newMaxDs, setNewMaxDs] = useState('')
  const [newExpiresAt, setNewExpiresAt] = useState('')
  const [licenseError, setLicenseError] = useState('')
  const [licenseLoading, setLicenseLoading] = useState(false)

  async function load() {
    const r = await fetch(`/api/portal/admin/organizations/${id}`)
    if (!r.ok) { router.replace('/portal/admin/clients'); return }
    setOrg(await r.json() as Org)
    setLoading(false)
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRevoke(licenseId: string) {
    const reason = prompt('Reason for revocation (optional):')
    if (reason === null) return // cancelled
    setRevoking(licenseId)
    const r = await fetch(`/api/portal/admin/organizations/${id}/licenses/${licenseId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revokedReason: reason }),
    })
    if (r.ok) await load()
    setRevoking(null)
  }

  async function handleChurn() {
    if (!confirm(`Mark ${org?.name} as churned? This is a soft-delete.`)) return
    await fetch(`/api/portal/admin/organizations/${id}`, { method: 'DELETE' })
    router.replace('/portal/admin/clients')
  }

  async function handleNewLicense(e: React.FormEvent) {
    e.preventDefault()
    setLicenseError('')
    if (!newMonthlyValue || isNaN(Number(newMonthlyValue))) {
      setLicenseError('Monthly value is required')
      return
    }
    setLicenseLoading(true)
    const r = await fetch(`/api/portal/admin/organizations/${id}/licenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: newProduct,
        tier: newTier,
        seats: newSeats,
        monthlyValue: Number(newMonthlyValue),
        maxApiCalls: newMaxApi ? Number(newMaxApi) : undefined,
        maxDataSources: newMaxDs ? Number(newMaxDs) : undefined,
        expiresAt: newExpiresAt || undefined,
      }),
    })
    if (!r.ok) {
      const d = await r.json() as { error?: string }
      setLicenseError(d.error ?? 'Failed to create license')
      setLicenseLoading(false)
      return
    }
    setShowNewLicense(false)
    setNewMonthlyValue('')
    setNewMaxApi('')
    setNewMaxDs('')
    setNewExpiresAt('')
    setLicenseLoading(false)
    await load()
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!org) return null

  const activeLicenses = org.licenses.filter(l => l.status === 'ACTIVE')
  const mrr = activeLicenses.reduce((s, l) => s + Number(l.monthlyValue), 0)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/portal/admin/clients" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{org.name}</h1>
          <p className="text-white/40 text-sm mt-0.5">{org.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded border ${STATUS_STYLES[org.status] ?? STATUS_STYLES.SUSPENDED}`}>
            {org.status}
          </span>
          {org.status !== 'CHURNED' && (
            <button
              onClick={handleChurn}
              className="text-xs text-red-400/70 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors"
            >
              Mark churned
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-black/40 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">MRR</p>
          <p className="text-xl font-bold text-green-400">£{mrr.toLocaleString('en-GB', { minimumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Active Licenses</p>
          <p className="text-xl font-bold text-[#00B8D4]">{activeLicenses.length}</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Health Score</p>
          <p className="text-xl font-bold text-white">{org.healthScore}%</p>
        </div>
        <div className="bg-black/40 rounded-xl border border-white/10 p-4">
          <p className="text-xs text-white/40 mb-1">Client since</p>
          <p className="text-sm font-semibold text-white">
            {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(org.createdAt))}
          </p>
        </div>
      </div>

      {/* Org details */}
      <div className="bg-black/40 rounded-xl border border-white/10 p-5 mb-6 grid grid-cols-2 gap-4">
        {org.phone && (
          <div>
            <p className="text-xs text-white/30 mb-0.5">Phone</p>
            <p className="text-sm text-white/80">{org.phone}</p>
          </div>
        )}
        {org.website && (
          <div>
            <p className="text-xs text-white/30 mb-0.5">Website</p>
            <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00B8D4] hover:underline">{org.website}</a>
          </div>
        )}
        {org.notes && (
          <div className="col-span-2">
            <p className="text-xs text-white/30 mb-0.5">Notes</p>
            <p className="text-sm text-white/60">{org.notes}</p>
          </div>
        )}
      </div>

      {/* Licenses */}
      <div className="bg-black/40 rounded-xl border border-white/10 mb-6">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key size={15} className="text-white/40" />
            <h2 className="font-semibold text-white">Licenses</h2>
          </div>
          <button
            onClick={() => setShowNewLicense(!showNewLicense)}
            className="flex items-center gap-1.5 text-xs text-[#00B8D4] hover:text-white border border-[#00B8D4]/30 hover:border-[#00B8D4]/60 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Add license
          </button>
        </div>

        {showNewLicense && (
          <form onSubmit={handleNewLicense} className="px-6 py-4 border-b border-white/10 bg-white/[0.02] space-y-3">
            <p className="text-sm font-medium text-white">New License</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1">Product</label>
                <select
                  value={newProduct}
                  onChange={e => setNewProduct(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                >
                  {['CORE', 'OPTIC', 'SEARCH', 'SDK', 'PLATFORM'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Tier</label>
                <select
                  value={newTier}
                  onChange={e => setNewTier(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                >
                  {['STARTER', 'GROWTH', 'ENTERPRISE', 'PLATFORM'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Seats</label>
                <input
                  type="number"
                  min={1}
                  value={newSeats}
                  onChange={e => setNewSeats(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Monthly Value (£) *</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={newMonthlyValue}
                  onChange={e => setNewMonthlyValue(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Max API Calls/mo</label>
                <input
                  type="number"
                  min={0}
                  value={newMaxApi}
                  onChange={e => setNewMaxApi(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Max Data Sources</label>
                <input
                  type="number"
                  min={0}
                  value={newMaxDs}
                  onChange={e => setNewMaxDs(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Expires At</label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={e => setNewExpiresAt(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50"
                />
              </div>
            </div>
            {licenseError && <p className="text-xs text-red-400">{licenseError}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={licenseLoading}
                className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all"
              >
                {licenseLoading ? 'Creating...' : 'Create license'}
              </button>
              <button
                type="button"
                onClick={() => setShowNewLicense(false)}
                className="border border-white/10 text-white/50 px-4 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-white/5">
          {org.licenses.map(l => (
            <div key={l.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-white/90">{l.product}</span>
                  <span className="text-xs text-white/40">{l.tier}</span>
                </div>
                <p className="text-xs text-white/30 font-mono mt-0.5">{l.licenseKey}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm font-semibold text-white">
                  £{Number(l.monthlyValue).toLocaleString('en-GB', { minimumFractionDigits: 0 })}/mo
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[l.status] ?? STATUS_STYLES.SUSPENDED}`}>
                  {l.status}
                </span>
                {l.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevoke(l.id)}
                    disabled={revoking === l.id}
                    className="text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30"
                    title="Revoke license"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {org.licenses.length === 0 && (
            <p className="px-6 py-6 text-center text-white/30 text-sm">No licenses yet.</p>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-black/40 rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <FileText size={15} className="text-white/40" />
          <h2 className="font-semibold text-white">Invoices</h2>
        </div>
        <div className="divide-y divide-white/5">
          {org.invoices.map(inv => (
            <div key={inv.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/80">{inv.period}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Due {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(inv.dueAt))}
                  {inv.paidAt && ` · Paid ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(inv.paidAt))}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-white">
                  {inv.currency} {Number(inv.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[inv.status] ?? STATUS_STYLES.PENDING}`}>
                  {inv.status}
                </span>
              </div>
            </div>
          ))}
          {org.invoices.length === 0 && (
            <p className="px-6 py-6 text-center text-white/30 text-sm">No invoices yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
