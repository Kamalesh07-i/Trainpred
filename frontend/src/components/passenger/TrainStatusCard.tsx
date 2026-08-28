import React from 'react';
import { Train, Clock, Gauge, ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { TrainSummary, TrainETAResponse } from '../../types';
import { ConfidenceGauge } from '../common/ConfidenceGauge';

interface TrainStatusCardProps {
  train: TrainSummary;
  etaData: TrainETAResponse | null;
}

export const TrainStatusCard: React.FC<TrainStatusCardProps> = ({ train, etaData }) => {
  const isDelayed = train.delay_minutes > 5.0;
  const isCritical = train.delay_minutes >= 20.0;
  const progressPct = etaData && train.total_distance_km > 0
    ? Math.min(100, Math.round(((train.total_distance_km - (etaData.upcoming_stations[etaData.upcoming_stations.length - 1]?.distance_from_origin_km || 0) + (etaData.upcoming_stations[0]?.distance_from_origin_km || 0)) / train.total_distance_km) * 100))
    : 45;

  return (
    <div className="glass-panel-glow p-6 bg-[#1D1D1F]">
      {/* Top Banner: Train Identity & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2C2C2E]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#121214] border border-[#2C2C2E] flex items-center justify-center text-[#007AFF] shadow-inner">
            <Train className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono tracking-wide text-[#F5F5F7]">
                {train.train_number}
              </span>
              <span className="text-sm font-bold text-[#F5F5F7]">
                {train.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#007AFF]/15 border border-[#007AFF]/40 text-[#007AFF]">
                {train.train_type}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#AAAAAA] mt-1">
              <span className="font-semibold text-[#F5F5F7]">{train.origin_station}</span>
              <ArrowRight className="w-3 h-3 text-[#AAAAAA]" />
              <span className="font-semibold text-[#F5F5F7]">{train.destination_station}</span>
              <span className="text-[#AAAAAA]">•</span>
              <span>Total Distance: {train.total_distance_km} km</span>
            </div>
          </div>
        </div>

        {/* Dynamic Confidence Gauge */}
        <div>
          <ConfidenceGauge
            score={etaData?.overall_confidence_percentage || 92.4}
            p10_p90_window={etaData?.upcoming_stations?.[0]?.confidence_window_p10_p90}
          />
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Speed Card */}
        <div className="p-4 rounded-xl bg-[#121214] border border-[#2C2C2E]">
          <div className="flex items-center justify-between text-xs text-[#AAAAAA] mb-1">
            <span className="font-semibold">CURRENT SPEED</span>
            <Gauge className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-[#F5F5F7]">
              {train.current_speed}
            </span>
            <span className="text-xs font-semibold text-[#AAAAAA]">km/h</span>
          </div>
          <div className="text-[10px] text-[#30D158] flex items-center gap-1 mt-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
            GPS Telemetry Active
          </div>
        </div>

        {/* Delay Status Card */}
        <div className={`p-4 rounded-xl border ${
          isCritical
            ? 'bg-[#FF453A]/10 border-[#FF453A]/40 text-[#FF453A]'
            : isDelayed
            ? 'bg-[#FF9F0A]/10 border-[#FF9F0A]/40 text-[#FF9F0A]'
            : 'bg-[#30D158]/10 border-[#30D158]/40 text-[#30D158]'
        }`}>
          <div className="flex items-center justify-between text-xs text-[#AAAAAA] mb-1">
            <span className="font-semibold">DELAY STATUS</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-[#F5F5F7]">
              {train.delay_minutes > 0 ? `+${train.delay_minutes}` : '0'}
            </span>
            <span className="text-xs font-semibold text-[#AAAAAA]">min</span>
          </div>
          <div className="text-[10px] font-bold mt-1 uppercase tracking-wider">
            {isCritical ? 'Critical Delay' : isDelayed ? 'Moderate Delay' : 'On-Time Schedule'}
          </div>
        </div>

        {/* Natural Delay Recovery Meter (C3 Innovation) */}
        <div className="p-4 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/40">
          <div className="flex items-center justify-between text-xs text-[#007AFF] mb-1">
            <span className="font-semibold">AI NATURAL RECOVERY</span>
            <Sparkles className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono text-[#007AFF]">
              -{etaData?.total_recovered_minutes || '0.0'}
            </span>
            <span className="text-xs font-semibold text-[#007AFF]">min</span>
          </div>
          <div className="text-[10px] text-[#007AFF] flex items-center gap-1 mt-1 font-medium">
            <TrendingDown className="w-3 h-3 text-[#007AFF]" />
            Slack Buffer Absorption
          </div>
        </div>

        {/* Destination ETA */}
        <div className="p-4 rounded-xl bg-[#121214] border border-[#2C2C2E]">
          <div className="flex items-center justify-between text-xs text-[#AAAAAA] mb-1">
            <span className="font-semibold">DESTINATION ETA</span>
            <Clock className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#007AFF]">
              {etaData?.final_destination_eta || '18:00'}
            </span>
            <span className="text-xs line-through text-[#AAAAAA] font-mono">
              {etaData?.final_destination_scheduled || '17:30'}
            </span>
          </div>
          <div className="text-[10px] text-[#AAAAAA] mt-1">
            Scheduled vs Dynamic AI Prediction
          </div>
        </div>
      </div>

      {/* Route Journey Progress Bar */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs text-[#AAAAAA] mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-[#F5F5F7]">Current Section:</span>{' '}
            {train.next_station ? `En route to ${train.next_station}` : 'In Transit'}
          </span>
          <span className="font-mono font-bold text-[#007AFF]">{progressPct}% Complete</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-[#121214] overflow-hidden p-0.5 border border-[#2C2C2E]">
          <div
            className="h-full rounded-full bg-[#007AFF] transition-all duration-700 shadow-sm shadow-[#007AFF]/50"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
