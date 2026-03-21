'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
}

export function FloatingElement({ children, delay = 0, direction = 'up', className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0, x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0 }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.25, 0.25, 0.75] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
