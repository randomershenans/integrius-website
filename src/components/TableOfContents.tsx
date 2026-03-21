'use client';

import { useEffect, useState } from 'react';

interface Heading { id: string; text: string; level: number }

function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split('\n');
  return lines
    .filter(l => /^#{2,3}\s/.test(l))
    .map(l => {
      const match = l.match(/^(#{2,3})\s+(.+)/);
      if (!match) return null;
      const level = match[1].length;
      const text  = match[2].replace(/[*_`]/g, '').trim();
      const id    = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return { id, text, level };
    })
    .filter(Boolean) as Heading[];
}

export default function TableOfContents({ content }: { content: string }) {
  const [active, setActive] = useState('');
  const headings = extractHeadings(content);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0.1 }
    );
    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (headings.length < 3) return null;

  return (
    <nav className="bg-white/5 border border-white/10 rounded-xl p-5 mb-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">In this article</p>
      <ol className="space-y-1.5">
        {headings.map(h => (
          <li key={h.id} className={h.level === 3 ? 'pl-4' : ''}>
            <a
              href={`#${h.id}`}
              className={`text-sm block leading-snug transition-colors ${
                active === h.id
                  ? 'text-[#00B8D4] font-medium'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
