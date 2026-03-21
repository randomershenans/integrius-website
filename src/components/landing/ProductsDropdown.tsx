'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const products = [
  { href: '/products/core', title: 'Integrius Core', sub: 'Unified Enterprise Data Layer' },
  { href: '/products/sdk', title: 'Integrius SDK', sub: 'Build Faster With Unified Data' },
  { href: '/products/optic', title: 'Integrius Optic', sub: 'See Everything. Ask Anything.' },
  { href: '/products/search', title: 'Unified Search API', sub: 'Schema-Aware Search Endpoints' },
];

export function ProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button className="text-sm font-medium text-white/80 hover:text-[#00B8D4] transition-colors flex items-center gap-1 py-2">
        Products
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[100]">
          <div className="w-56 rounded-lg shadow-xl bg-black/95 border border-white/10 backdrop-blur-lg">
            <div className="py-2">
              {products.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-[#00B8D4] transition-colors"
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-white/60">{p.sub}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
