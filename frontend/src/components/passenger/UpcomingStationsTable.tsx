import React from 'react';
import { MapPin } from 'lucide-react';
import { StationETA } from '../../types';

interface UpcomingStationsTableProps {
  stations: StationETA[];
}

export const UpcomingStationsTable: React.FC<UpcomingStationsTableProps> = ({ stations }) => {
  if (!stations || stations.length === 0) {
    return (
      <div className="glass-panel p-6 text-center text-[#AAAAAA] text-sm bg-[#1D1D1F]">
        No upcoming stations data available.
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#007AFF]" />
          <h3 className="text-base font-bold text-[#F5F5F7] tracking-wide">
            Upcoming Stations & Dynamic ETA Schedule
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#121214] text-[#AAAAAA] border border-[#2C2C2E] font-mono">
          {stations.length} STATIONS IN ROUTE
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2C2C2E] text-[#AAAAAA] font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">Station</th>
              <th className="py-3 px-3">Distance</th>
              <th className="py-3 px-3">Timetable Arrival</th>
              <th className="py-3 px-3">RAIL-CAST Dynamic ETA</th>
              <th className="py-3 px-3">Delay & Recovery</th>
              <th className="py-3 px-3">Confidence (P10-P90)</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2C2E]/60 font-mono">
            {stations.map((stn) => {
              const isDeparted = stn.status === 'DEPARTED';
              const isDelayed = stn.delay_minutes > 4.0;
              const hasRecovery = stn.natural_recovery_minutes > 0.5;

              return (
                <tr
                  key={stn.station_code}
                  className={`hover:bg-[#242426]/60 transition-colors ${
                    isDeparted ? 'opacity-40 bg-[#121214]/50' : ''
                  }`}
                >
                  {/* Station Name & Code */}
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#007AFF] bg-[#007AFF]/10 px-1.5 py-0.5 rounded text-[11px] border border-[#007AFF]/30">
                        {stn.station_code}
                      </span>
                      <span className="font-semibold text-[#F5F5F7]">
                        {stn.station_name}
                      </span>
                    </div>
                  </td>

                  {/* Distance */}
                  <td className="py-3 px-3 text-[#AAAAAA]">
                    {stn.distance_from_origin_km} km
                  </td>

                  {/* Scheduled Time */}
                  <td className="py-3 px-3 text-[#AAAAAA] font-semibold">
                    {stn.scheduled_arrival}
                  </td>

                  {/* Predicted ETA */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className={isDelayed ? 'text-[#FF9F0A]' : 'text-[#30D158]'}>
                        {stn.predicted_eta}
                      </span>
                      {!isDeparted && (
                        <span className="text-[10px] text-[#007AFF] bg-[#007AFF]/15 px-1 rounded font-normal font-sans border border-[#007AFF]/30">
                          AI Live
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Delay & Recovery Breakdown */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {stn.delay_minutes > 0 ? (
                        <span className="text-[#FF9F0A] font-bold">
                          +{stn.delay_minutes}m
                        </span>
                      ) : (
                        <span className="text-[#30D158] font-bold">
                          0m
                        </span>
                      )}
                      {hasRecovery && (
                        <span className="text-[10px] text-[#007AFF] bg-[#007AFF]/15 px-1.5 py-0.5 rounded font-bold">
                          -{stn.natural_recovery_minutes}m Rec
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Confidence Window */}
                  <td className="py-3 px-3">
                    <div className="text-[11px] text-[#F5F5F7]">
                      {stn.confidence_window_p10_p90}
                    </div>
                    <div className="text-[10px] text-[#AAAAAA]">
                      {stn.confidence_percentage}% Calibrated
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDeparted
                        ? 'bg-[#2C2C2E] text-[#AAAAAA]'
                        : isDelayed
                        ? 'bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30'
                        : 'bg-[#30D158]/15 text-[#30D158] border border-[#30D158]/30'
                    }`}>
                      {stn.status}
                    </span>
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
