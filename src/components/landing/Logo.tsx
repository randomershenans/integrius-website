'use client';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center group">
      <img
        src="/logo-dark.png"
        alt="Integrius Logo"
        className="h-10 w-auto"
      />
    </Link>
  );
}
