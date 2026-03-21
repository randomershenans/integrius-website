'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';

export function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => setIsAnimating(true));
  }, [isOpen]);

  const close = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const scrollTo = (id: string) => {
    close();
    setTimeout(() => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }), 400);
  };

  const menuContent = (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, backgroundColor: '#000000', opacity: isAnimating ? 1 : 0, transition: 'opacity 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Logo />
        <button onClick={close} style={{ padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X style={{ width: '24px', height: '24px', color: 'white' }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 180px)', padding: '0 32px', transform: isAnimating ? 'translateY(0)' : 'translateY(20px)', opacity: isAnimating ? 1 : 0, transition: 'transform 0.4s ease-out, opacity 0.4s ease-out', transitionDelay: '0.1s' }}>
        <nav style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(0,184,212,0.6)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '24px' }}>Products</p>
          <Link href="/products/core" onClick={close} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '16px', textDecoration: 'none' }}>Integrius Core</Link>
          <Link href="/products/sdk" onClick={close} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '16px', textDecoration: 'none' }}>Integrius SDK</Link>
          <Link href="/products/optic" onClick={close} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '16px', textDecoration: 'none' }}>Integrius Optic</Link>
          <Link href="/products/search" onClick={close} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '20px', marginBottom: '32px', textDecoration: 'none' }}>Unified Search API</Link>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
            <a href="#how-it-works" onClick={() => scrollTo('#how-it-works')} style={{ display: 'block', color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textDecoration: 'none' }}>How It Works</a>
            <a href="#pricing" onClick={() => scrollTo('#pricing')} style={{ display: 'block', color: 'white', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }}>Pricing</a>
          </div>
        </nav>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', transform: isAnimating ? 'translateY(0)' : 'translateY(20px)', opacity: isAnimating ? 1 : 0, transition: 'transform 0.4s ease-out, opacity 0.4s ease-out', transitionDelay: '0.2s' }}>
        <Link href="/contact" onClick={close} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', background: 'linear-gradient(to right, #00B8D4, #0091EA)', color: 'white', fontSize: '18px', fontWeight: 600, borderRadius: '12px', textDecoration: 'none' }}>
          Contact Us
          <ArrowRight style={{ width: '20px', height: '20px' }} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button onClick={() => setIsOpen(true)} className="p-2">
        <Menu className="w-6 h-6 text-white" />
      </button>
      {mounted && isOpen && createPortal(menuContent, document.body)}
    </div>
  );
}
