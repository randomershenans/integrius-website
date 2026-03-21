'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  content: string;
  excerpt: string;
  status: string;
  article_type: string;
  scheduled_for: string | null;
  linkedin_shared: boolean;
  ai_generated: boolean;
}

export default function ArticleEditor() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const isNew   = id === 'new';

  const [article, setArticle] = useState<Partial<Article>>({
    title: '', slug: '', meta_title: '', meta_description: '', content: '', excerpt: '',
    status: 'draft', article_type: 'pillar',
  });
  const [loading,  setLoading]  = useState(!isNew);
  const [saving,   setSaving]   = useState(false);
  const [sharing,  setSharing]  = useState(false);
  const [tab,      setTab]      = useState<'content' | 'meta'>('content');
  const [message,  setMessage]  = useState('');

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/admin/articles/${id}`)
      .then(r => r.json())
      .then((data: { article: Article }) => { setArticle(data.article); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, isNew]);

  function set(field: string, value: string) {
    setArticle(prev => ({ ...prev, [field]: value }));
  }

  async function save(publish = false) {
    setSaving(true);
    setMessage('');
    const body = publish ? { ...article, status: 'published' } : article;
    const url  = isNew ? '/api/admin/articles' : `/api/admin/articles/${id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      const data = await res.json() as { article: Article };
      if (isNew) router.replace(`/admin/articles/${data.article.id}`);
      else { setArticle(data.article); setMessage(publish ? 'Published.' : 'Saved.'); }
    } else {
      setMessage('Error saving. Check required fields.');
    }
  }

  async function shareLinkedIn() {
    setSharing(true);
    const res = await fetch(`/api/admin/articles/${id}/share`, { method: 'POST' });
    const data = await res.json() as { post_url?: string; error?: string };
    setSharing(false);
    if (res.ok) {
      setMessage(`Shared to LinkedIn${data.post_url ? ': ' + data.post_url : ''}`);
      setArticle(prev => ({ ...prev, linkedin_shared: true }));
    } else {
      setMessage(`LinkedIn error: ${data.error}`);
    }
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#00B8D4]/50 focus:border-[#00B8D4]/50';
  const labelCls = 'block text-sm font-medium text-white/60 mb-1';

  if (loading) return <div className="p-8 text-white/40">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{isNew ? 'New article' : 'Edit article'}</h1>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-white/50">{message}</span>}
          {!isNew && article.status === 'published' && !article.linkedin_shared && (
            <button
              onClick={shareLinkedIn}
              disabled={sharing}
              className="border border-white/20 text-white/70 px-4 py-2 rounded-lg text-sm font-semibold hover:border-white/40 hover:text-white disabled:opacity-40 transition-colors"
            >
              {sharing ? 'Sharing...' : 'Share to LinkedIn'}
            </button>
          )}
          <button onClick={() => save(false)} disabled={saving} className="border border-white/20 text-white/70 px-4 py-2 rounded-lg text-sm font-semibold hover:border-white/40 hover:text-white disabled:opacity-40 transition-colors">
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          {article.status !== 'published' && (
            <button onClick={() => save(true)} disabled={saving} className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-all">
              Publish
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {(['content', 'meta'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-[#00B8D4] text-[#00B8D4]' : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Title *</label>
            <input
              value={article.title ?? ''}
              onChange={e => set('title', e.target.value)}
              className={inputCls}
              placeholder="Article title"
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              value={article.slug ?? ''}
              onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className={`${inputCls} font-mono`}
              placeholder="url-slug"
            />
          </div>
          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea
              value={article.excerpt ?? ''}
              onChange={e => set('excerpt', e.target.value)}
              rows={2}
              className={inputCls}
              placeholder="1-2 sentence summary for listing page and LinkedIn"
            />
          </div>
          <div>
            <label className={labelCls}>Content (Markdown) *</label>
            <textarea
              value={article.content ?? ''}
              onChange={e => set('content', e.target.value)}
              rows={30}
              className={`${inputCls} font-mono`}
              placeholder="# Article title&#10;&#10;## First H2..."
            />
          </div>
        </div>
      )}

      {tab === 'meta' && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Meta title (under 60 chars)</label>
            <input
              value={article.meta_title ?? ''}
              onChange={e => set('meta_title', e.target.value)}
              maxLength={70}
              className={inputCls}
            />
            <p className="text-xs text-white/30 mt-1">{(article.meta_title ?? '').length}/60</p>
          </div>
          <div>
            <label className={labelCls}>Meta description (under 155 chars)</label>
            <textarea
              value={article.meta_description ?? ''}
              onChange={e => set('meta_description', e.target.value)}
              rows={3}
              maxLength={160}
              className={inputCls}
            />
            <p className="text-xs text-white/30 mt-1">{(article.meta_description ?? '').length}/155</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={article.status ?? 'draft'}
                onChange={e => set('status', e.target.value)}
                className={inputCls}
              >
                <option value="draft" className="bg-gray-900">Draft</option>
                <option value="scheduled" className="bg-gray-900">Scheduled</option>
                <option value="published" className="bg-gray-900">Published</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Article type</label>
              <select
                value={article.article_type ?? 'pillar'}
                onChange={e => set('article_type', e.target.value)}
                className={inputCls}
              >
                <option value="pillar" className="bg-gray-900">Pillar article</option>
                <option value="faq" className="bg-gray-900">FAQ / Glossary</option>
              </select>
            </div>
          </div>
          {article.status === 'scheduled' && (
            <div>
              <label className={labelCls}>Schedule for</label>
              <input
                type="datetime-local"
                value={article.scheduled_for?.slice(0, 16) ?? ''}
                onChange={e => set('scheduled_for', e.target.value)}
                className={inputCls}
              />
            </div>
          )}
          {!isNew && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/30">
                {article.ai_generated ? 'AI-generated article.' : 'Manually written article.'}
                {article.linkedin_shared ? ' Shared to LinkedIn.' : ' Not yet shared to LinkedIn.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
