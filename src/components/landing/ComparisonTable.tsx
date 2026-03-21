'use client';
import { Check, X } from 'lucide-react';

type FeatureValue = boolean | { partial: boolean; label: string };

const features: { name: string; etl: FeatureValue; integration: FeatureValue; mdm: FeatureValue; integrius: FeatureValue }[] = [
  { name: 'Real-Time Data Processing', etl: false, integration: false, mdm: false, integrius: true },
  { name: 'AI-Powered Field Mapping', etl: false, integration: false, mdm: false, integrius: true },
  { name: 'Zero Data Storage', etl: false, integration: true, mdm: false, integrius: true },
  { name: 'System Change Resilience', etl: false, integration: false, mdm: false, integrius: true },
  { name: 'Unified Standardized Data Layer', etl: { partial: true, label: 'with effort' }, integration: false, mdm: true, integrius: true },
  { name: 'Easy Onboarding', etl: false, integration: true, mdm: false, integrius: true },
  { name: 'Cost Efficiency', etl: false, integration: false, mdm: false, integrius: true },
  { name: 'Adaptability Across Use Cases', etl: false, integration: true, mdm: false, integrius: true },
];

function Cell({ value, highlight = false }: { value: FeatureValue; highlight?: boolean }) {
  if (typeof value === 'object' && value.partial) {
    return (
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 text-sm ${highlight ? 'text-cyan-400' : 'text-white/60'}`}>
          <Check className="h-4 w-4" />
          <span className="text-xs">({value.label})</span>
        </span>
      </td>
    );
  }
  return (
    <td className="px-4 py-3 text-center">
      {value
        ? <Check className={`h-5 w-5 mx-auto ${highlight ? 'text-cyan-400' : 'text-white/60'}`} />
        : <X className="h-5 w-5 mx-auto text-white/20" />
      }
    </td>
  );
}

export function ComparisonTable() {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left font-semibold text-white/70 w-1/3">Feature</th>
            <th className="px-4 py-3 text-center font-semibold text-white/70">ETL Tools</th>
            <th className="px-4 py-3 text-center font-semibold text-white/70">Integration Platforms</th>
            <th className="px-4 py-3 text-center font-semibold text-white/70">MDM Platforms</th>
            <th className="px-4 py-3 text-center font-semibold text-cyan-400">Integrius</th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={f.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
              <td className="px-4 py-3 text-white/80 font-medium">{f.name}</td>
              <Cell value={f.etl} />
              <Cell value={f.integration} />
              <Cell value={f.mdm} />
              <Cell value={f.integrius} highlight />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
