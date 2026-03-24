'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PortalAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
