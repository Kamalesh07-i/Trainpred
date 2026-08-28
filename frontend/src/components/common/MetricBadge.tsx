import React from 'react';

interface MetricBadgeProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
  icon?: React.ReactNode;
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  label,
  value,
  unit,
  color = 'blue',
  icon
}) => {
  const colorMap = {
    blue: 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]',
    cyan: 'bg-[#007AFF]/10 border-[#007AFF]/30 text-[#007AFF]',
    emerald: 'bg-[#30D158]/10 border-[#30D158]/30 text-[#30D158]',
    amber: 'bg-[#FF9F0A]/10 border-[#FF9F0A]/30 text-[#FF9F0A]',
    rose: 'bg-[#FF453A]/10 border-[#FF453A]/30 text-[#FF453A]',
    purple: 'bg-[#BF5AF2]/10 border-[#BF5AF2]/30 text-[#BF5AF2]',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} bg-[#1D1D1F] backdrop-blur-sm transition-all hover:border-opacity-60 shadow-lg`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider">{label}</span>
        {icon && <div className="text-[#AAAAAA]">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono tracking-tight text-[#F5F5F7]">{value}</span>
        {unit && <span className="text-xs font-semibold text-[#AAAAAA]">{unit}</span>}
      </div>
    </div>
  );
};
