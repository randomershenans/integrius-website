'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Clock } from 'lucide-react'

interface Invoice {
  id: string
  amount: string
  currency: string
  status: string
  period: string
  paid_at: string | null
  due_at: string
  created_at: string
}

const STATUS_STYLES: Record<string, string> = {
  PAID:      'bg-green-500/15 text-green-400 border-green-500/30',
  PENDING:   'bg-white/10 text-white/50 border-white/20',
  OVERDUE:   'bg-red-500/15 text-red-400 border-red-500/30',
  CANCELLED: 'bg-white/5 text-white/30 border-white/10',
}

const fmt = (d: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/portal/client/invoices', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? 'Failed to load invoices')
        setLoading(false)
        return
      }
      setInvoices(await res.json() as Invoice[])
      setLoading(false)
    }
    load()
  }, [])

  const paid = invoices.filter(i => i.status === 'PAID')
  const outstanding = invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-white/40 text-sm mt-1">Your billing history</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-red-400 text-sm">{error}</p>
      ) : invoices.length === 0 ? (
        <div className="bg-black/40 rounded-xl border border-white/10 px-6 py-16 text-center">
          <FileText size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No invoices yet.</p>
        </div>
      ) : (
        <>
          {outstanding.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">Outstanding</h2>
              <div className="bg-black/40 rounded-xl border border-white/10 divide-y divide-white/5">
                {outstanding.map(inv => (
                  <InvoiceRow key={inv.id} inv={inv} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-medium text-white/50 mb-3 uppercase tracking-wider">History</h2>
            <div className="bg-black/40 rounded-xl border border-white/10 divide-y divide-white/5">
              {(outstanding.length > 0 ? paid : invoices).map(inv => (
                <InvoiceRow key={inv.id} inv={inv} />
              ))}
              {paid.length === 0 && outstanding.length > 0 && (
                <p className="px-6 py-6 text-center text-white/30 text-sm">No payment history yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function InvoiceRow({ inv }: { inv: Invoice }) {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))

  return (
    <div className="px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white/90">{inv.period}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {inv.paid_at ? (
            <span className="text-xs text-white/30">Paid {fmt(inv.paid_at)}</span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-white/30">
              <Clock size={10} /> Due {fmt(inv.due_at)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-sm font-semibold text-white">
          {inv.currency} {Number(inv.amount).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
        </span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_STYLES[inv.status] ?? STATUS_STYLES.PENDING}`}>
          {inv.status}
        </span>
      </div>
    </div>
  )
}
