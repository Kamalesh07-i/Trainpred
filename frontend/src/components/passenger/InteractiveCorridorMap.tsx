import React from 'react';
import { Navigation, Train, Radio } from 'lucide-react';
import { TrainSummary, StationETA } from '../../types';

interface InteractiveCorridorMapProps {
  train: TrainSummary;
  stations: StationETA[];
}

export const InteractiveCorridorMap: React.FC<InteractiveCorridorMapProps> = ({ train, stations }) => {
  if (!stations || stations.length === 0) return null;

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F] relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#007AFF]" />
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7] tracking-wide">
              Live Corridor Track & Telemetry Schematic
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              Real-time spatial progression across block sections & signal nodes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-[#121214] border border-[#2C2C2E] text-[11px] font-mono text-[#007AFF] flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#007AFF] animate-pulse" />
            <span>GPS: {train.latitude.toFixed(4)}° N, {train.longitude.toFixed(4)}° E</span>
          </div>
        </div>
      </div>

      {/* Schematic Track Diagram */}
      <div className="relative py-8 px-4 bg-[#121214] rounded-2xl border border-[#2C2C2E] overflow-x-auto">
        <div className="min-w-[700px] relative">
          {/* Main Track Line */}
          <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-[#2C2C2E] rounded-full -translate-y-1/2" />
          {/* Active Track Highlight */}
          <div
            className="absolute top-1/2 left-4 h-1.5 bg-[#007AFF] rounded-full -translate-y-1/2 transition-all duration-700 shadow-md shadow-[#007AFF]/40"
            style={{ width: '48%' }}
          />

          {/* Station Nodes */}
          <div className="relative flex justify-between items-center z-10">
            {stations.slice(0, 8).map((stn, idx) => {
              const isPast = stn.status === 'DEPARTED';
              const isCurrent = idx === 3;

              return (
                <div key={stn.station_code} className="flex flex-col items-center group cursor-pointer">
                  {/* Station Marker */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#007AFF] border-4 border-[#121214] ring-4 ring-[#007AFF]/30 scale-125'
                        : isPast
                        ? 'bg-[#2C2C2E] border-2 border-[#1D1D1F]'
                        : 'bg-[#1D1D1F] border-2 border-[#007AFF]/60 group-hover:border-[#007AFF]'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isCurrent ? 'bg-white' : isPast ? 'bg-[#AAAAAA]' : 'bg-[#007AFF]'
                      }`}
                    />
                  </div>

                  {/* Station Code & Name */}
                  <div className="mt-3 text-center">
                    <span className="font-mono text-xs font-bold text-[#F5F5F7] block">
                      {stn.station_code}
                    </span>
                    <span className="text-[10px] text-[#AAAAAA] max-w-[80px] truncate block">
                      {stn.station_name}
                    </span>
                    <span className="text-[9px] font-mono text-[#007AFF] block mt-0.5 font-semibold">
                      {stn.predicted_eta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pulsing Live Train Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-linear flex flex-col items-center"
            style={{ left: '46%' }}
          >
            {/* Pulsing Radar Rings */}
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-[#007AFF]/30 animate-ping" />
              <span className="absolute w-6 h-6 rounded-full bg-[#007AFF]/40 animate-pulse" />
              <div className="w-8 h-8 rounded-full bg-[#007AFF] border-2 border-white flex items-center justify-center text-white shadow-lg shadow-[#007AFF]/60 z-30">
                <Train className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 px-2 py-0.5 rounded-full bg-[#1D1D1F] border border-[#007AFF]/50 text-[9px] font-mono font-bold text-[#007AFF] whitespace-nowrap shadow-md">
              Train {train.train_number} ({train.current_speed} km/h)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
