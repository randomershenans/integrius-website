'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, Key, FileText, Users, LogOut } from 'lucide-react'

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/portal/login')
      } else {
        setEmail(session.user.email ?? null)
        setChecking(false)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/portal/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const nav = [
    { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/dashboard/licenses', label: 'Licenses', icon: Key },
    { href: '/portal/dashboard/invoices', label: 'Invoices', icon: FileText },
    { href: '/portal/dashboard/team', label: 'Team', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="w-56 bg-black border-r border-white/10 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <img src="/logo-dark.png" alt="Integrius" className="h-8 w-auto mb-1.5" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#00B8D4]/70">Portal</span>
          <p className="text-xs text-white/30 mt-1 truncate">{email}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(n => {
            const Icon = n.icon
            const active = pathname === n.href
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#00B8D4]/15 text-[#00B8D4] border border-[#00B8D4]/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {n.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
