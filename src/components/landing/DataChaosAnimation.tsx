'use client';
import { motion } from 'framer-motion';
import { Database, FileSpreadsheet, Workflow, Zap, Server, HardDrive } from 'lucide-react';

const tools = [
  { icon: Database, label: 'CRM' },
  { icon: FileSpreadsheet, label: 'Spreadsheet' },
  { icon: Workflow, label: 'ERP' },
  { icon: Zap, label: 'API' },
  { icon: Server, label: 'Database' },
  { icon: HardDrive, label: 'Machine' },
];

const positions = [
  { x: 20, y: 10 },
  { x: 70, y: 15 },
  { x: 30, y: 45 },
  { x: 70, y: 55 },
  { x: 20, y: 65 },
  { x: 50, y: 35 },
];

export function DataChaosAnimation() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {tools.map((Tool, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{ top: `${positions[index].y}%`, left: `${positions[index].x}%` }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, x: [0, (index % 2 === 0 ? 4 : -4)], y: [0, (index % 3 === 0 ? 4 : -4)] }}
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 3 + index * 0.4 }}
        >
          <Tool.icon className="w-12 h-12 text-white" />
          <p className="text-xs mt-1 text-center text-white/70">{Tool.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
