'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Zap, Building2, Key, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(async r => {
        if (!r.ok) {
          router.replace('/admin/login');
        } else {
          const d = await r.json() as { email: string };
          setAdminEmail(d.email);
          setChecking(false);
        }
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

  const websiteNav = [
    { href: '/admin',          label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/articles', label: 'Articles',  icon: FileText,        exact: false },
    { href: '/admin/generate', label: 'Generate',  icon: Zap,             exact: false },
  ];

  const clientNav = [
    { href: '/admin/clients',  label: 'Clients',  icon: Building2, exact: false },
    { href: '/admin/licenses', label: 'Licenses', icon: Key,       exact: false },
  ];

  const sectionLabelClass = 'text-[10px] font-semibold uppercase tracking-widest text-white/20 px-3 mb-1 mt-4';

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-black border-r border-white/10 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <img src="/logo-dark.png" alt="Integrius" className="h-8 w-auto mb-1.5" />
          <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#00B8D4]/70">Admin</span>
          {adminEmail && (
            <p className="text-xs text-white/30 mt-1 truncate">{adminEmail}</p>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className={sectionLabelClass}>Website &amp; Blog</p>
          <div className="space-y-1">
            {websiteNav.map(n => {
              const Icon = n.icon;
              const active = isActive(n.href, n.exact);
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
              );
            })}
          </div>

          <p className={sectionLabelClass}>Client Management</p>
          <div className="space-y-1">
            {clientNav.map(n => {
              const Icon = n.icon;
              const active = isActive(n.href, n.exact);
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
              );
            })}
          </div>
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

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
