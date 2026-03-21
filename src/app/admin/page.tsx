import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [total, published, draft, scheduled, pending_gen, linkedin_queue] = await Promise.all([
    prisma.cms_articles.count(),
    prisma.cms_articles.count({ where: { status: 'published' } }),
    prisma.cms_articles.count({ where: { status: 'draft' } }),
    prisma.cms_articles.count({ where: { status: 'scheduled' } }),
    prisma.cms_generation_queue.count({ where: { status: 'pending' } }),
    prisma.cms_articles.count({ where: { status: 'published', linkedin_shared: false } }),
  ]);
  return { total, published, draft, scheduled, pending_gen, linkedin_queue };
}

async function getRecentArticles() {
  return prisma.cms_articles.findMany({
    orderBy: { updated_at: 'desc' },
    take: 8,
    select: { id: true, title: true, slug: true, status: true, published_at: true, ai_generated: true, linkedin_shared: true },
  });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: 'bg-green-500/15 text-green-400 border-green-500/30',
    draft:     'bg-white/5 text-white/50 border-white/10',
    scheduled: 'bg-[#00B8D4]/15 text-[#00B8D4] border-[#00B8D4]/30',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  );
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentArticles()]);

  const statCards = [
    { label: 'Published',     value: stats.published,     color: 'text-green-600' },
    { label: 'Drafts',        value: stats.draft,         color: 'text-gray-600'  },
    { label: 'Scheduled',     value: stats.scheduled,     color: 'text-blue-600'  },
    { label: 'Gen. queue',    value: stats.pending_gen,   color: 'text-purple-600' },
    { label: 'LinkedIn queue',value: stats.linkedin_queue,color: 'text-orange-600' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-3">
          <Link href="/admin/generate" className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all">
            Generate article
          </Link>
          <Link href="/admin/articles/new" className="border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors">
            Write manually
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-10">
        {statCards.map(s => (
          <div key={s.label} className="bg-black/40 rounded-xl border border-white/10 p-5">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent articles */}
      <div className="bg-black/40 rounded-xl border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent articles</h2>
          <Link href="/admin/articles" className="text-sm text-[#00B8D4] hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-white/5">
          {recent.map(a => (
            <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Link href={`/admin/articles/${a.id}`} className="font-medium text-white/90 hover:text-[#00B8D4] truncate block transition-colors">
                  {a.title}
                </Link>
                <p className="text-xs text-white/40 mt-0.5">
                  {a.published_at
                    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(a.published_at)
                    : 'Not published'}
                  {a.ai_generated && ' · AI'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={a.status} />
                {a.status === 'published' && !a.linkedin_shared && (
                  <span className="text-xs text-orange-400 font-medium">LinkedIn pending</span>
                )}
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="px-6 py-8 text-center text-white/30 text-sm">No articles yet. Generate your first one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
