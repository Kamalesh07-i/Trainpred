import React from 'react';
import { Layers } from 'lucide-react';
import { RouteSectionRisk } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CorridorRiskMapProps {
  sections: RouteSectionRisk[];
}

export const CorridorRiskMap: React.FC<CorridorRiskMapProps> = ({ sections }) => {
  const { t } = useLanguage();

  if (!sections || sections.length === 0) return null;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'SEVERE': return 'bg-[#FF453A]/10 border-[#FF453A]/40 text-[#FF453A]';
      case 'HIGH': return 'bg-[#FF9F0A]/10 border-[#FF9F0A]/40 text-[#FF9F0A]';
      case 'MODERATE': return 'bg-[#007AFF]/10 border-[#007AFF]/40 text-[#007AFF]';
      default: return 'bg-[#30D158]/10 border-[#30D158]/40 text-[#30D158]';
    }
  };

  const getCongestionBarColor = (score: number) => {
    if (score >= 0.7) return 'bg-[#FF453A]';
    if (score >= 0.4) return 'bg-[#FF9F0A]';
    return 'bg-[#30D158]';
  };

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#007AFF]" />
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7] tracking-wide">
              {t('corridorCongestionHeatmap')}
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              {t('liveCapacityDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-[#30D158]">
            <span className="w-2 h-2 rounded-full bg-[#30D158]" /> {t('legendOptimal')}
          </span>
          <span className="flex items-center gap-1 text-[#FF9F0A]">
            <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" /> {t('legendElevated')}
          </span>
          <span className="flex items-center gap-1 text-[#FF453A]">
            <span className="w-2 h-2 rounded-full bg-[#FF453A]" /> {t('legendBottleneck')}
          </span>
        </div>
      </div>

      {/* Grid of Route Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.slice(0, 9).map((sec) => {
          const congPercent = Math.round(sec.congestion_score * 100);
          return (
            <div
              key={sec.section_id}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.01] bg-[#121214] ${getRiskColor(sec.risk_level)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#F5F5F7]">
                  {sec.from_station} ➔ {sec.to_station}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1D1D1F] border border-[#2C2C2E] font-bold">
                  {sec.risk_level}
                </span>
              </div>

              <div className="text-[11px] text-[#AAAAAA] font-sans mb-3">
                {sec.corridor_name} • {sec.distance_km} km (MPS: {sec.max_speed_kmh} km/h)
              </div>

              {/* Congestion Load Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#AAAAAA] mb-1">
                  <span>{t('trackDensityLoad')}</span>
                  <span className="font-bold text-[#F5F5F7]">{congPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1D1D1F] overflow-hidden border border-[#2C2C2E]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${getCongestionBarColor(sec.congestion_score)}`}
                    style={{ width: `${congPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#AAAAAA] font-mono mt-3 pt-2 border-t border-[#2C2C2E]">
                <span>{t('activeTrainsColon')} {sec.active_trains}</span>
                <span className="truncate max-w-[150px]">{sec.signalling}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
