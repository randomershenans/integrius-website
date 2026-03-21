'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => {
        if (!r.ok) router.replace('/admin/login');
        else setChecking(false);
      })
      .catch(() => router.replace('/admin/login'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // intentionally run once — router is unstable in App Router

  if (pathname === '/admin/login') return <>{children}</>;
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#00B8D4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nav = [
    { href: '/admin',          label: 'Dashboard' },
    { href: '/admin/articles', label: 'Articles'  },
    { href: '/admin/generate', label: 'Generate'  },
  ];

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-black border-r border-white/10 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <span className="font-bold text-white">Integrius CMS</span>
          <p className="text-xs text-white/40 mt-0.5">Content admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === n.href
                  ? 'bg-[#00B8D4]/15 text-[#00B8D4] border border-[#00B8D4]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
