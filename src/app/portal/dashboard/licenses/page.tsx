'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CalendarClock, Clock, Copy, CheckCheck, ShieldCheck, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react'

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
  CORE:     'Integrius Core',
  OPTIC:    'Integrius Optic',
  SEARCH:   'Integrius Search',
  SDK:      'Integrius SDK',
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

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 text-xs transition-colors ${className ?? 'text-white/40 hover:text-white/70'}`}
      title="Copy to clipboard"
    >
      {copied
        ? <><CheckCheck size={13} className="text-green-400" /> Copied</>
        : <><Copy size={13} /> Copy</>
      }
    </button>
  )
}

const INTEGRATION_STEPS = [
  'In your Integrius deployment, open Settings → License',
  'Paste your license key into the License Key field',
  'Click Activate — your entitlements will apply immediately',
  'If activating offline, contact support for a signed license token',
]

function LicenseCard({ license }: { license: License }) {
  const [open, setOpen] = useState(false)
  const tier = TIER_STYLES[license.tier] ?? TIER_STYLES.STARTER

  return (
    <div className="bg-black/40 rounded-xl border border-white/10">
      {/* Main card body */}
      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h3 className="font-semibold text-white">{PRODUCT_LABELS[license.product] ?? license.product}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${tier.className}`}>
                {tier.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[license.status] ?? STATUS_STYLES.SUSPENDED}`}>
              {license.status}
            </span>
          </div>
        </div>

        {/* Entitlements */}
        {(license.max_data_sources != null || license.max_api_calls != null || license.seats > 1) && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {license.max_data_sources != null && (
              <div className="bg-white/5 rounded-lg px-4 py-3">
                <p className="text-xs text-white/40 mb-0.5">Data Sources</p>
                <p className="text-lg font-semibold text-white">{license.max_data_sources.toLocaleString()}</p>
              </div>
            )}
            {license.max_api_calls != null && (
              <div className="bg-white/5 rounded-lg px-4 py-3">
                <p className="text-xs text-white/40 mb-0.5">API Calls / mo</p>
                <p className="text-lg font-semibold text-white">{license.max_api_calls.toLocaleString()}</p>
              </div>
            )}
            {license.seats > 1 && (
              <div className="bg-white/5 rounded-lg px-4 py-3">
                <p className="text-xs text-white/40 mb-0.5">Seats</p>
                <p className="text-lg font-semibold text-white">{license.seats}</p>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <span className="text-xs text-white/30">
            Active since {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(license.starts_at))}
          </span>
          <RenewalBadge expiresAt={license.expires_at} />
        </div>
      </div>

      {/* Integration collapsible */}
      <div className="border-t border-white/10">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-6 py-3 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors rounded-b-xl"
        >
          <span className="font-medium">Integration</span>
          {open
            ? <ChevronDown size={15} className="text-white/40" />
            : <ChevronRight size={15} className="text-white/40" />
          }
        </button>

        {open && (
          <div className="px-6 pb-6 space-y-5">
            {/* License key */}
            <div>
              <p className="text-xs text-white/40 mb-2">License Key</p>
              <div className="bg-white/5 rounded-lg border border-white/10 px-4 py-3 flex items-center justify-between gap-4">
                <code className="font-mono text-xs text-[#00B8D4] break-all leading-relaxed flex-1 select-all">
                  {license.license_key}
                </code>
                <CopyButton text={license.license_key} className="text-white/40 hover:text-white/70 shrink-0" />
              </div>
            </div>

            {/* Steps */}
            <div>
              <p className="text-xs text-white/40 mb-3">Activation Steps</p>
              <ol className="space-y-2">
                {INTEGRATION_STEPS.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-semibold text-white/40 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
              <AlertTriangle size={13} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-400/80">
                Your license key is sensitive. Do not commit it to source control.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LicensesPage() {
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

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Licenses</h1>
        <p className="text-white/40 text-sm mt-1">Manage your Integrius license keys and integration instructions</p>
      </div>

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
          {licenses.map(l => (
            <LicenseCard key={l.id} license={l} />
          ))}
        </div>
      )}
    </div>
  )
}
