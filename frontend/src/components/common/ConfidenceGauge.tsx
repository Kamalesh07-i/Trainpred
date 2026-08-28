import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ConfidenceGaugeProps {
  score: number; // e.g. 92.4
  p10_p90_window?: string; // e.g. "14:45 - 14:52"
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  score,
  p10_p90_window
}) => {
  const getColor = (val: number) => {
    if (val >= 90) return { text: 'text-[#30D158]', stroke: 'stroke-[#30D158]', bg: 'bg-[#30D158]/10', border: 'border-[#30D158]/30' };
    if (val >= 75) return { text: 'text-[#007AFF]', stroke: 'stroke-[#007AFF]', bg: 'bg-[#007AFF]/10', border: 'border-[#007AFF]/30' };
    if (val >= 60) return { text: 'text-[#FF9F0A]', stroke: 'stroke-[#FF9F0A]', bg: 'bg-[#FF9F0A]/10', border: 'border-[#FF9F0A]/30' };
    return { text: 'text-[#FF453A]', stroke: 'stroke-[#FF453A]', bg: 'bg-[#FF453A]/10', border: 'border-[#FF453A]/30' };
  };

  const style = getColor(score);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${style.bg} ${style.border}`}>
      {/* Circular Progress Gauge */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            className="stroke-[#2C2C2E]"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            className={`transition-all duration-1000 ease-out ${style.stroke}`}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className={`absolute text-xs font-black font-mono ${style.text}`}>
          {Math.round(score)}%
        </span>
      </div>

      <div>
        <div className="flex items-center gap-1">
          <ShieldCheck className={`w-3.5 h-3.5 ${style.text}`} />
          <span className="text-[11px] font-bold tracking-wide uppercase text-[#F5F5F7]">
            Calibrated Confidence
          </span>
        </div>
        {p10_p90_window && (
          <div className="text-[10px] font-mono text-[#AAAAAA] mt-0.5">
            P10-P90 Window: <span className="text-[#F5F5F7] font-semibold">{p10_p90_window}</span>
          </div>
        )}
        <div className="text-[9px] text-[#AAAAAA]">
          ECE &lt; 0.05 Isotonic Regression
        </div>
      </div>
    </div>
  );
};
