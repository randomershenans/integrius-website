'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { BurgerMenu } from './BurgerMenu';
import { ProductsDropdown } from './ProductsDropdown';

export function SiteHeader() {
  return (
    <header className="fixed top-0 w-full px-4 lg:px-6 h-16 flex items-center justify-between z-[60] bg-black/50 backdrop-blur-md">
      <Logo />
      <nav className="hidden md:flex gap-4 sm:gap-6 items-center">
        <Link className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="/">
          Home
        </Link>
        <ProductsDropdown />
        <Link className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="/blog">
          Blog
        </Link>
        <Link className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors" href="/contact">
          Contact
        </Link>
      </nav>
      <BurgerMenu />
    </header>
  );
}
