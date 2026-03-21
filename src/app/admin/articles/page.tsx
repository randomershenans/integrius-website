'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  article_type: string;
  ai_generated: boolean;
  linkedin_shared: boolean;
  published_at: string | null;
  word_count: number | null;
  cluster: { name: string } | null;
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

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    fetch('/api/admin/articles')
      .then(r => r.json())
      .then((data: { articles: Article[] }) => { setArticles(data.articles); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? articles : articles.filter(a => a.status === filter);

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  async function publish(id: string) {
    const res = await fetch(`/api/admin/articles/${id}/publish`, { method: 'POST' });
    if (res.ok) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, status: 'published', published_at: new Date().toISOString() } : a));
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <div className="flex gap-3">
          <Link href="/admin/generate" className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-[#0091EA] hover:to-[#0288D1] transition-all">
            Generate
          </Link>
          <Link href="/admin/articles/new" className="border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors">
            New article
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'published', 'draft', 'scheduled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === f
                ? 'bg-[#00B8D4]/20 text-[#00B8D4] border-[#00B8D4]/40'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/30">Loading...</div>
      ) : (
        <div className="bg-black/40 rounded-xl border border-white/10 divide-y divide-white/5">
          {filtered.map(a => (
            <div key={a.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link href={`/admin/articles/${a.id}`} className="font-medium text-white/90 hover:text-[#00B8D4] truncate transition-colors">
                    {a.title}
                  </Link>
                  {a.ai_generated && <span className="text-xs text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30">AI</span>}
                </div>
                <p className="text-xs text-white/40">
                  {a.cluster?.name ?? 'Uncategorised'} &middot; {a.article_type}
                  {a.word_count && ` · ${a.word_count} words`}
                  {a.published_at && ` · ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(a.published_at))}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={a.status} />
                {a.status === 'published' && !a.linkedin_shared && (
                  <span className="text-xs text-orange-400">Not shared</span>
                )}
                {a.status === 'draft' && (
                  <button onClick={() => publish(a.id)} className="text-xs text-[#00B8D4] hover:underline font-medium">
                    Publish
                  </button>
                )}
                <Link href={`/admin/articles/${a.id}`} className="text-xs text-white/40 hover:text-white/70">
                  Edit
                </Link>
                <button onClick={() => deleteArticle(a.id)} className="text-xs text-red-400/70 hover:text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-6 py-12 text-center text-white/30 text-sm">No articles found.</p>
          )}
        </div>
      )}
    </div>
  );
}
