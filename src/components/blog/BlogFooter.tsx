'use client';
import Link from 'next/link';

export function BlogFooter() {
  return (
    <footer className="w-full bg-black border-t border-white/10 mt-16 py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
        <span>© {new Date().getFullYear()} Integrius. All rights reserved.</span>
        <nav className="flex items-center gap-6">
          <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
          <Link href="/blog" className="hover:text-white/80 transition-colors">Blog</Link>
          <Link href="/blog/about" className="hover:text-white/80 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white/80 transition-colors">Contact</Link>
          <a href="/feed.xml" className="hover:text-white/80 transition-colors">RSS</a>
        </nav>
      </div>
    </footer>
  );
}
