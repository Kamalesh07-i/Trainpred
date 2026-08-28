import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, CheckCircle2, Clock, Cpu } from 'lucide-react';
import { AlertItem } from '../../types';

interface AnomalyAlertCenterProps {
  alerts: AlertItem[];
  onResolveAlert: (alertId: string) => void;
}

export const AnomalyAlertCenter: React.FC<AnomalyAlertCenterProps> = ({ alerts, onResolveAlert }) => {
  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#FF453A]" />
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7] tracking-wide">
              Real-Time AI Anomaly & Disruption Dispatch Feed
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              Isolation Forest + Z-score ensemble detections across the national network
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#FF453A]/15 border border-[#FF453A]/40 text-[#FF453A] font-bold">
          {alerts.length} ACTIVE DISRUPTIONS
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="p-8 text-center bg-[#121214] rounded-2xl border border-[#2C2C2E] text-[#AAAAAA] text-xs">
          <CheckCircle2 className="w-8 h-8 text-[#30D158] mx-auto mb-2 opacity-80" />
          All corridors operating within normal statistical telemetry bounds. No active disruptions.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alt) => {
            const isCritical = alt.severity === 'CRITICAL' || alt.severity === 'HIGH';
            return (
              <div
                key={alt.alert_id}
                className={`p-4 rounded-xl border transition-all bg-[#121214] ${
                  isCritical
                    ? 'border-[#FF453A]/40 shadow-sm shadow-[#FF453A]/10'
                    : 'border-[#FF9F0A]/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {isCritical ? (
                      <AlertCircle className="w-4 h-4 text-[#FF453A] flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#FF9F0A] flex-shrink-0" />
                    )}
                    <span className="font-bold text-[#F5F5F7] text-xs tracking-wide">
                      {alt.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1D1D1F] text-[#AAAAAA] border border-[#2C2C2E]">
                      {alt.train_number ? `Train ${alt.train_number}` : 'Section Alert'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-[#AAAAAA] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alt.created_at).toLocaleTimeString()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCritical ? 'bg-[#FF453A]/20 text-[#FF453A]' : 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
                    }`}>
                      {alt.severity}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#AAAAAA] mb-3 font-sans">
                  {alt.message}
                </p>

                {alt.recommendation && (
                  <div className="p-2.5 rounded-lg bg-[#1D1D1F] border border-[#007AFF]/30 text-xs text-[#007AFF] flex items-start gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-[#007AFF] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#F5F5F7]">AI Dispatch Advisory:</span> {alt.recommendation}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => onResolveAlert(alt.alert_id)}
                    className="px-3.5 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-xs font-semibold transition shadow-md shadow-[#007AFF]/20"
                  >
                    Authorize Dispatch Resolution
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
