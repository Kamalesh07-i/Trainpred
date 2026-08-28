import React from 'react';
import { BrainCircuit, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { ExplanationResponse } from '../../types';

interface ExplanationPanelProps {
  explanation: ExplanationResponse | null;
  isLoading?: boolean;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ explanation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 bg-[#1D1D1F] animate-pulse">
        <div className="h-6 w-48 bg-[#2C2C2E] rounded mb-4" />
        <div className="h-20 bg-[#2C2C2E] rounded mb-4" />
        <div className="space-y-2">
          <div className="h-8 bg-[#2C2C2E] rounded" />
          <div className="h-8 bg-[#2C2C2E] rounded" />
          <div className="h-8 bg-[#2C2C2E] rounded" />
        </div>
      </div>
    );
  }

  if (!explanation) {
    return null;
  }

  const factors = explanation.explanation.contributing_factors || [];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'CONGESTION': return 'text-[#FF9F0A] bg-[#FF9F0A]/10 border-[#FF9F0A]/30';
      case 'CASCADE': return 'text-[#FF453A] bg-[#FF453A]/10 border-[#FF453A]/30';
      case 'RECOVERY':
      case 'AI_RECOVERY': return 'text-[#007AFF] bg-[#007AFF]/10 border-[#007AFF]/30';
      case 'ENVIRONMENT': return 'text-[#30D158] bg-[#30D158]/10 border-[#30D158]/30';
      default: return 'text-[#AAAAAA] bg-[#121214] border-[#2C2C2E]';
    }
  };

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#2C2C2E]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#007AFF]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7] flex items-center gap-2">
              Explainable AI (XAI) Delay Attribution
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/15 border border-[#007AFF]/40 text-[#007AFF] font-mono font-semibold">
                SHAP Kernel
              </span>
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              Granular decomposition of physical and sectional drivers shaping current ETA
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-[#AAAAAA]">
          Base Run: <span className="text-[#F5F5F7] font-semibold">{explanation.base_travel_time_minutes}m</span> | Net Impact:{' '}
          <span className={`font-bold ${explanation.net_impact_minutes > 0 ? 'text-[#FF9F0A]' : 'text-[#30D158]'}`}>
            {explanation.net_impact_minutes > 0 ? `+${explanation.net_impact_minutes}m` : `${explanation.net_impact_minutes}m`}
          </span>
        </div>
      </div>

      {/* Natural Language AI Summary Box */}
      <div className="p-4 rounded-xl bg-[#121214] border border-[#007AFF]/30 mb-5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#007AFF] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#007AFF] mb-1">
              AI Operational Summary
            </div>
            <p className="text-xs text-[#F5F5F7] leading-relaxed font-sans">
              {explanation.explanation.summary}
            </p>
          </div>
        </div>
      </div>

      {/* SHAP Feature Contribution Waterfall / Bar List */}
      <div>
        <h4 className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-3">
          Ranked Contributing Factors & Minute Attribution
        </h4>

        <div className="space-y-3">
          {factors.map((factor) => {
            const isPositive = factor.impact_minutes > 0;
            const barWidth = Math.min(100, Math.max(8, factor.contribution_percent));

            return (
              <div
                key={factor.feature}
                className="p-3.5 rounded-xl bg-[#121214] border border-[#2C2C2E] hover:border-[#007AFF]/40 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getCategoryColor(factor.category)}`}>
                      {factor.category}
                    </span>
                    <span className="text-xs font-semibold text-[#F5F5F7]">
                      {factor.explanation}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className={`flex items-center gap-1 font-bold ${isPositive ? 'text-[#FF9F0A]' : 'text-[#007AFF]'}`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isPositive ? `+${factor.impact_minutes} min` : `${factor.impact_minutes} min`}
                    </span>
                    <span className="text-[11px] text-[#AAAAAA]">
                      ({factor.contribution_percent}%)
                    </span>
                  </div>
                </div>

                {/* Relative Contribution Bar */}
                <div className="w-full h-1.5 rounded-full bg-[#2C2C2E] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-[#FF9F0A]' : 'bg-[#007AFF]'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
