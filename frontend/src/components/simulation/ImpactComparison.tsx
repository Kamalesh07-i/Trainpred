import React from 'react';
import { Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { WhatIfResponse } from '../../types';

interface ImpactComparisonProps {
  result: WhatIfResponse;
}

export const ImpactComparison: React.FC<ImpactComparisonProps> = ({ result }) => {
  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      {/* Simulation Result Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2C2C2E] mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-md border border-[#007AFF]/30">
              {result.scenario_id}
            </span>
            <span className="text-sm font-bold text-[#F5F5F7]">
              {result.scenario_name}
            </span>
          </div>
          <p className="text-xs text-[#AAAAAA]">
            Target Train: <span className="text-[#F5F5F7] font-mono font-semibold">{result.train_number}</span> | Severity: <span className="text-[#F5F5F7] font-semibold">{result.impact_severity}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <div className="text-xs text-[#AAAAAA]">Net Destination Delta</div>
            <div className="text-xl font-bold text-[#FF453A]">
              +{result.net_delay_delta_minutes} min
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Baseline Card */}
        <div className="p-4 rounded-xl bg-[#121214] border border-[#2C2C2E]">
          <div className="flex items-center justify-between text-xs text-[#AAAAAA] mb-2">
            <span className="font-semibold">BASELINE SCHEDULED ARRIVAL</span>
            <Clock className="w-4 h-4 text-[#30D158]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#30D158]">
            {result.baseline_final_eta}
          </div>
          <div className="text-[11px] text-[#AAAAAA] mt-1">
            Original timetable trajectory without disruption
          </div>
        </div>

        {/* Simulated Disrupted Card */}
        <div className="p-4 rounded-xl bg-[#121214] border border-[#FF453A]/40">
          <div className="flex items-center justify-between text-xs text-[#AAAAAA] mb-2">
            <span className="font-semibold">SIMULATED DISRUPTED ARRIVAL</span>
            <Clock className="w-4 h-4 text-[#FF453A]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#FF453A]">
            {result.simulated_final_eta}
          </div>
          <div className="text-[11px] text-[#AAAAAA] mt-1">
            Impact cascade across downstream corridor
          </div>
        </div>
      </div>

      {/* AI Mitigation Recommendation */}
      <div className="p-4 rounded-xl bg-[#121214] border border-[#007AFF]/30 mb-6">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#007AFF] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#007AFF] mb-1">
              AI Controller Action Recommendation
            </h4>
            <p className="text-xs text-[#F5F5F7] leading-relaxed">
              {result.mitigation_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Affected Downstream Stations Table */}
      {result.affected_stations && result.affected_stations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-3">
            Downstream Station Cascade Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[#2C2C2E] text-[#AAAAAA] font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-3">Baseline ETA</th>
                  <th className="py-2.5 px-3">Simulated ETA</th>
                  <th className="py-2.5 px-3">Delay Impact</th>
                  <th className="py-2.5 px-3">Cascade Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2C2E]/60">
                {result.affected_stations.map((stn) => (
                  <tr key={stn.station_code} className="hover:bg-[#242426]/60 transition">
                    <td className="py-2.5 px-3 font-sans font-semibold text-[#F5F5F7]">
                      {stn.station_name} ({stn.station_code})
                    </td>
                    <td className="py-2.5 px-3 text-[#AAAAAA]">{stn.baseline_eta}</td>
                    <td className="py-2.5 px-3 font-bold text-[#FF453A]">{stn.simulated_eta}</td>
                    <td className="py-2.5 px-3 font-bold text-[#FF9F0A]">+{stn.delay_delta_minutes}m</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        stn.cascade_risk === 'HIGH'
                          ? 'bg-[#FF453A]/20 text-[#FF453A]'
                          : stn.cascade_risk === 'MEDIUM'
                          ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
                          : 'bg-[#30D158]/20 text-[#30D158]'
                      }`}>
                        {stn.cascade_risk} RISK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
