// src/components/Dashboard/StatsCard.tsx
import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: 'green' | 'blue' | 'indigo' | 'amber';
}

const accentMap = {
  green:  { bar: 'bg-seagrass',     icon: 'bg-seagrass/10 text-seagrass',     text: 'text-seagrass' },
  blue:   { bar: 'bg-steel-blue',   icon: 'bg-steel-blue/10 text-steel-blue', text: 'text-steel-blue' },
  indigo: { bar: 'bg-space-indigo', icon: 'bg-space-indigo/20 text-alice-blue',text: 'text-alice-blue' },
  amber:  { bar: 'bg-yellow-500',   icon: 'bg-yellow-500/10 text-yellow-400', text: 'text-yellow-400' },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, accent = 'green' }) => {
  const a = accentMap[accent];
  return (
    <div className="bg-dark-surface rounded-xl p-5 border border-dark-border relative overflow-hidden hover:border-seagrass/30 transition-colors">
      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${a.bar}`} />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-alice-blue/40 uppercase tracking-wider">{title}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.icon}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="font-display text-3xl text-alice-blue">{value}</div>

      {subtitle && (
        <div className="text-xs text-yellow-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

export default StatsCard;