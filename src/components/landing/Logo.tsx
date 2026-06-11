'use client';
import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center group">
      <Image
        src="/logo-dark.png"
        alt="Integrius Logo"
        width={1000}
        height={202}
        priority
        className="h-10 w-auto"
      />
    </Link>
  );
}
