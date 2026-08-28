import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { AlertItem } from '../../types';

interface AlertToastProps {
  alerts: AlertItem[];
  onDismiss?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ alerts, onResolve }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full">
      {alerts.slice(0, 3).map((alt) => {
        const isCritical = alt.severity === 'CRITICAL' || alt.severity === 'HIGH';
        return (
          <div
            key={alt.alert_id}
            className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all bg-[#1D1D1F]/95 ${
              isCritical
                ? 'border-[#FF453A]/50 shadow-[#FF453A]/20'
                : 'border-[#FF9F0A]/50 shadow-[#FF9F0A]/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isCritical ? (
                  <XCircle className="w-5 h-5 text-[#FF453A] animate-pulse" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#FF9F0A]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F7]">
                    {alt.title}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#121214] text-[#AAAAAA] border border-[#2C2C2E]">
                    {alt.train_number ? `Train ${alt.train_number}` : 'Network Alert'}
                  </span>
                </div>
                <p className="text-xs text-[#AAAAAA] mt-1">{alt.message}</p>
                {alt.recommendation && (
                  <div className="mt-2 text-[11px] p-2 rounded bg-[#121214] text-[#007AFF] border border-[#007AFF]/30">
                    <span className="font-semibold">AI Recommendation:</span> {alt.recommendation}
                  </div>
                )}
                {onResolve && (
                  <button
                    onClick={() => onResolve(alt.alert_id)}
                    className="mt-2.5 px-3 py-1 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-lg text-[11px] font-semibold transition shadow-md shadow-[#007AFF]/20"
                  >
                    Acknowledge & Dispatch Action
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
