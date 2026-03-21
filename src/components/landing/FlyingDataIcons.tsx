'use client';
import { useEffect, useState } from 'react';
import { Database, FileSpreadsheet, Workflow, Server, HardDrive, Cloud, Globe, Boxes, Container, Box } from 'lucide-react';
import { motion } from 'framer-motion';

const icons = [Database, FileSpreadsheet, Workflow, Server, HardDrive, Cloud, Globe, Boxes, Container, Box];

interface FlyingIcon {
  id: number;
  Icon: typeof Database;
  duration: number;
  delay: number;
  yPosition: number;
  size: number;
}

export function FlyingDataIcons() {
  const [flyingIcons, setFlyingIcons] = useState<FlyingIcon[]>([]);

  useEffect(() => {
    const getRandomY = () => Math.random() * window.innerHeight;

    const initial: FlyingIcon[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 8,
      yPosition: getRandomY(),
      size: 24 + Math.random() * 16,
    }));

    setFlyingIcons(initial);

    const interval = setInterval(() => {
      setFlyingIcons(prev => [
        ...prev.slice(-11),
        {
          id: Date.now(),
          Icon: icons[Math.floor(Math.random() * icons.length)],
          duration: 15 + Math.random() * 10,
          delay: 0,
          yPosition: getRandomY(),
          size: 24 + Math.random() * 16,
        },
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {flyingIcons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute opacity-20"
          style={{ top: `${item.yPosition}px` }}
          initial={{ x: '-100px', rotate: 0 }}
          animate={{ x: 'calc(100vw + 100px)', rotate: 360 }}
          transition={{ duration: item.duration, delay: item.delay, ease: 'linear', repeat: Infinity }}
        >
          <item.Icon size={item.size} className="text-[#00B8D4]/50" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}
