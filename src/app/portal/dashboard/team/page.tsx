'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Mail } from 'lucide-react'

interface Member {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

const ROLE_STYLES: Record<string, string> = {
  admin:  'bg-[#00B8D4]/15 text-[#00B8D4] border-[#00B8D4]/30',
  member: 'bg-white/10 text-white/50 border-white/20',
  viewer: 'bg-white/5 text-white/30 border-white/10',
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/portal/client/team', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        setError(((await res.json()) as { error?: string }).error ?? 'Failed to load team')
        setLoading(false)
        return
      }
      setMembers(await res.json() as Member[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-white/40 text-sm mt-1">People with access to your Integrius portal</p>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-red-400 text-sm">{error}</p>
      ) : (
        <div className="bg-black/40 rounded-xl border border-white/10 divide-y divide-white/5">
          {members.map(m => (
            <div key={m.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white/60">
                    {(m.full_name ?? m.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  {m.full_name && (
                    <p className="text-sm font-medium text-white/90 truncate">{m.full_name}</p>
                  )}
                  <p className="text-xs text-white/40 flex items-center gap-1 truncate">
                    <Mail size={10} />{m.email}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${ROLE_STYLES[m.role] ?? ROLE_STYLES.member}`}>
                {m.role}
              </span>
            </div>
          ))}
          {members.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No team members yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
