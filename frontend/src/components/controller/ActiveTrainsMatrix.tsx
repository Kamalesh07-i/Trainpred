import React from 'react';
import { Train, ArrowRight } from 'lucide-react';
import { TrainSummary } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ActiveTrainsMatrixProps {
  trains: TrainSummary[];
  onSelectTrain: (trainNumber: string) => void;
}

export const ActiveTrainsMatrix: React.FC<ActiveTrainsMatrixProps> = ({ trains, onSelectTrain }) => {
  const { t } = useLanguage();

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/40 text-[10px] font-bold">{t('riskCritical')}</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40 text-[10px] font-bold">{t('riskHigh')}</span>;
      case 'MODERATE':
        return <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF] border border-[#007AFF]/40 text-[10px] font-bold">{t('riskModerate')}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/40 text-[10px] font-bold">{t('riskOnSchedule')}</span>;
    }
  };

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#F5F5F7] tracking-wide">
            {t('activeFleetRiskMatrix')}
          </h3>
          <p className="text-xs text-[#AAAAAA]">
            {t('telemetryPriorityDesc')}
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#121214] border border-[#2C2C2E] text-[#007AFF] font-bold">
          {trains.length} {t('activeTrainsLabel')}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2C2C2E] text-[#AAAAAA] font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">{t('colTrainType')}</th>
              <th className="py-3 px-3">{t('colPriority')}</th>
              <th className="py-3 px-3">{t('colOriginDestination')}</th>
              <th className="py-3 px-3">{t('colLiveVelocity')}</th>
              <th className="py-3 px-3">{t('colDelayStatus')}</th>
              <th className="py-3 px-3">{t('colNextWaypoint')}</th>
              <th className="py-3 px-3">{t('colRiskAssessment')}</th>
              <th className="py-3 px-3 text-right">{t('colDispatchActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2C2E]/60 font-mono">
            {trains.map((train) => {
              const isDelayed = train.delay_minutes > 5.0;
              return (
                <tr
                  key={train.train_number}
                  className="hover:bg-[#242426]/60 transition-colors"
                >
                  <td className="py-3.5 px-3 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#121214] border border-[#2C2C2E] text-[#007AFF]">
                        <Train className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-[#F5F5F7] text-xs">
                          {train.train_number}
                        </div>
                        <div className="text-[11px] text-[#AAAAAA]">
                          {train.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#121214] border border-[#2C2C2E] text-[#AAAAAA] text-[10px] font-bold">
                      {t('classLabel')} {train.priority_level}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-sans">
                    <div className="flex items-center gap-1 text-[#F5F5F7] text-[11px]">
                      <span>{train.origin_station}</span>
                      <ArrowRight className="w-3 h-3 text-[#AAAAAA]" />
                      <span>{train.destination_station}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-bold text-[#F5F5F7] text-xs">
                      {train.current_speed}
                    </span>
                    <span className="text-[10px] text-[#AAAAAA] ml-1">km/h</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`font-bold ${isDelayed ? 'text-[#FF9F0A]' : 'text-[#30D158]'}`}>
                      {train.delay_minutes > 0 ? `+${train.delay_minutes}m` : '0m'}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-sans">
                    <div className="text-[#F5F5F7] text-xs font-semibold">
                      {train.next_station || t('inTransit')}
                    </div>
                    <div className="text-[10px] text-[#007AFF] font-mono">
                      {t('etaLabel')} {train.eta_next_station || '--:--'}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-sans">
                    {getRiskBadge(train.risk_level)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-sans">
                    <button
                      onClick={() => onSelectTrain(train.train_number)}
                      className="px-3 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] text-white text-[11px] font-semibold transition shadow-md shadow-[#007AFF]/20"
                    >
                      {t('inspectXaiEta')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
