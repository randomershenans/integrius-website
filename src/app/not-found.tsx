import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/blog" className="font-bold text-xl text-gray-900 tracking-tight">Integrius</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="https://integri.us" className="hover:text-gray-900">Product</a>
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <Link href="/blog/about" className="hover:text-gray-900">About</Link>
            <a
              href="https://integri.us/demo"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Book a demo
            </a>
          </nav>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">404</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page not found</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            This page does not exist or has been moved. The articles below might be what you were looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/blog"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Browse all articles
            </Link>
            <a
              href="https://integri.us"
              className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-gray-400 transition-colors"
            >
              Visit Integrius.us
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} Integrius</span>
          <div className="flex items-center gap-6">
            <Link href="/blog" className="hover:text-gray-600">Blog</Link>
            <a href="/feed.xml" className="hover:text-gray-600">RSS</a>
            <Link href="/blog/about" className="hover:text-gray-600">About</Link>
            <a href="https://integri.us" className="hover:text-gray-600">Product</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
