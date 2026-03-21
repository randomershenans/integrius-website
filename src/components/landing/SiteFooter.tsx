'use client';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="relative z-10 w-full py-6 border-t border-white/10 bg-black/50 backdrop-blur-lg">
      <div className="container px-4 md:px-6 mx-auto flex flex-col sm:flex-row justify-between items-center">
        <p className="text-xs text-white/60">© {new Date().getFullYear()} Integrius. All rights reserved.</p>
        <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link href="/" className="text-xs hover:underline underline-offset-4 text-white/60 hover:text-white/80">Home</Link>
          <Link href="/blog" className="text-xs hover:underline underline-offset-4 text-white/60 hover:text-white/80">Blog</Link>
          <Link href="/contact" className="text-xs hover:underline underline-offset-4 text-white/60 hover:text-white/80">Contact</Link>
          <a href="#" className="text-xs hover:underline underline-offset-4 text-white/60 hover:text-white/80">Privacy</a>
        </nav>
      </div>
    </footer>
  );
}
