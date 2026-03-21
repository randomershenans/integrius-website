'use client';
import Link from 'next/link';
import { Logo } from '@/components/landing/Logo';
import { ProductsDropdown } from '@/components/landing/ProductsDropdown';
import { BurgerMenu } from '@/components/landing/BurgerMenu';

export function BlogHeader() {
  return (
    <header className="sticky top-0 w-full px-4 lg:px-6 h-16 flex items-center justify-between z-[60] bg-black/95 backdrop-blur-md border-b border-white/10">
      <Logo />
      <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
        <Link className="text-sm font-medium text-white/70 hover:text-[#00B8D4] transition-colors" href="/">
          Home
        </Link>
        <ProductsDropdown />
        <Link className="text-sm font-medium text-white/70 hover:text-[#00B8D4] transition-colors" href="/blog">
          Blog
        </Link>
        <Link
          href="/contact"
          className="text-sm font-semibold bg-gradient-to-r from-[#00B8D4] to-[#0091EA] hover:from-[#0091EA] hover:to-[#0288D1] text-white px-4 py-2 rounded-lg transition-all"
        >
          Book a demo
        </Link>
      </nav>
      <BurgerMenu />
    </header>
  );
}
