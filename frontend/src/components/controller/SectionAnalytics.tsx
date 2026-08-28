import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { RouteSectionRisk } from '../../types';

interface SectionAnalyticsProps {
  sections: RouteSectionRisk[];
}

export const SectionAnalytics: React.FC<SectionAnalyticsProps> = ({ sections }) => {
  const chartData = sections.slice(0, 8).map((sec) => ({
    name: `${sec.from_station}-${sec.to_station}`,
    congestion: Math.round(sec.congestion_score * 100),
    speed: sec.max_speed_kmh,
    activeTrains: sec.active_trains
  }));

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#007AFF]" />
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7] tracking-wide">
              Corridor Section Throughput & Headway Load
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              Sectional capacity percentage vs speed performance envelope
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
            <XAxis
              dataKey="name"
              stroke="#AAAAAA"
              tick={{ fill: '#AAAAAA', fontSize: 10, angle: -25, textAnchor: 'end' }}
            />
            <YAxis
              stroke="#AAAAAA"
              tick={{ fill: '#AAAAAA', fontSize: 11 }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1D1D1F',
                borderColor: '#2C2C2E',
                borderRadius: '12px',
                color: '#F5F5F7',
                fontSize: '12px'
              }}
              formatter={(value: any) => [`${value}% Load`, 'Section Congestion']}
            />
            <Bar dataKey="congestion" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.congestion >= 70 ? '#FF453A' : entry.congestion >= 40 ? '#FF9F0A' : '#007AFF'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
