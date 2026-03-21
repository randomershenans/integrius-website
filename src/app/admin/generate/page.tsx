'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Spec {
  id: string;
  title: string;
  slug: string;
  article_type: string;
  primary_keyword: string;
  word_count_min: number;
  word_count_max: number;
  cluster: { name: string } | null;
}

export default function GeneratePage() {
  const router  = useRouter();
  const [specs,     setSpecs]     = useState<Spec[]>([]);
  const [selected,  setSelected]  = useState<string>('');
  const [loading,   setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message,   setMessage]   = useState('');
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    fetch('/api/admin/specs')
      .then(r => r.json())
      .then((data: { specs: Spec[] }) => { setSpecs(data.specs); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? specs : specs.filter(s => s.article_type === filter);

  async function pollStatus(queueId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/generate/status/${queueId}`);
        if (!res.ok) return;
        const data = await res.json() as { status: string; article_id?: string; error?: string };
        if (data.status === 'done' && data.article_id) {
          clearInterval(interval);
          router.push(`/admin/articles/${data.article_id}`);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setGenerating(false);
          setMessage(`Generation failed: ${data.error ?? 'unknown error'}`);
        }
      } catch {
        // ignore transient poll errors
      }
    }, 3000);
  }

  async function generate() {
    if (!selected) { setMessage('Select a spec first.'); return; }
    setGenerating(true);
    setMessage('');

    const res = await fetch('/api/admin/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spec_id: selected }),
    });

    if (res.status === 202) {
      // Async path (production): poll for completion
      const data = await res.json() as { queue_id: string };
      setMessage('Generating with Claude — this takes 20-40 seconds. You\'ll be redirected automatically.');
      await pollStatus(data.queue_id);
    } else if (res.status === 201) {
      // Sync path (local dev): redirect immediately
      const data = await res.json() as { article: { id: string } };
      router.push(`/admin/articles/${data.article.id}`);
    } else {
      setGenerating(false);
      const err = await res.json() as { error?: string };
      setMessage(`Generation failed: ${err.error ?? 'unknown error'}`);
    }
  }

  const selectedSpec = specs.find(s => s.id === selected);

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-white mb-2">Generate article</h1>
      <p className="text-white/50 text-sm mb-8">
        Pick a spec from the content bank. Claude writes the article using the keyword brief, H2 structure, and key points.
        Problem-first. No em dashes. UK English. Review and publish from the editor.
      </p>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['all', 'pillar', 'faq'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-[#00B8D4]/20 text-[#00B8D4] border-[#00B8D4]/40'
                : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'All specs' : f === 'pillar' ? 'Pillar articles' : 'FAQ / Glossary'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/30 py-8">Loading specs...</div>
      ) : (
        <div className="space-y-2 mb-8">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left border rounded-xl p-4 transition-all ${
                selected === s.id
                  ? 'border-[#00B8D4]/50 bg-[#00B8D4]/10'
                  : 'border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white text-sm leading-snug">{s.title}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {s.cluster?.name ?? 'Uncategorised'} &middot; {s.article_type} &middot; {s.word_count_min}-{s.word_count_max} words
                  </p>
                  <p className="text-xs text-[#00B8D4] mt-0.5 font-mono">{s.primary_keyword}</p>
                </div>
                {selected === s.id && (
                  <span className="text-[#00B8D4] text-lg shrink-0">&#10003;</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedSpec && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-white mb-1">Selected: {selectedSpec.title}</p>
          <p className="text-xs text-white/40">Target: {selectedSpec.word_count_min}-{selectedSpec.word_count_max} words &middot; {selectedSpec.article_type}</p>
        </div>
      )}

      {message && (
        <p className={`text-sm mb-4 ${message.includes('failed') ? 'text-red-400' : 'text-white/60'}`}>
          {message}
        </p>
      )}

      <button
        onClick={generate}
        disabled={!selected || generating}
        className="bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-6 py-3 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {generating ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating...
          </span>
        ) : 'Generate with Claude'}
      </button>
    </div>
  );
}
