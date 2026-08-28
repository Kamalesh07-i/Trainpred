import React from 'react';
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  ComposedChart
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ETATimelineChartProps {
  currentDelay: number;
  recoveredMinutes: number;
}

export const ETATimelineChart: React.FC<ETATimelineChartProps> = ({ currentDelay, recoveredMinutes }) => {
  const data = [
    { time: '-120m', scheduled: 0, naiveDelay: 0, dynamicAI: 0, p10: -2, p90: 2 },
    { time: '-90m', scheduled: 0, naiveDelay: 8, dynamicAI: 5, p10: 3, p90: 7 },
    { time: '-60m', scheduled: 0, naiveDelay: 18, dynamicAI: 14, p10: 11, p90: 17 },
    { time: '-30m', scheduled: 0, naiveDelay: 22, dynamicAI: 16, p10: 13, p90: 19 },
    { time: 'NOW', scheduled: 0, naiveDelay: currentDelay, dynamicAI: Math.max(0, currentDelay - recoveredMinutes), p10: Math.max(0, currentDelay - recoveredMinutes - 2.5), p90: currentDelay - recoveredMinutes + 3.0 },
    { time: '+30m', scheduled: 0, naiveDelay: currentDelay, dynamicAI: Math.max(0, currentDelay - recoveredMinutes * 1.2), p10: Math.max(0, currentDelay - recoveredMinutes * 1.2 - 3), p90: currentDelay - recoveredMinutes * 1.2 + 4 },
    { time: '+60m', scheduled: 0, naiveDelay: currentDelay, dynamicAI: Math.max(0, currentDelay - recoveredMinutes * 1.5), p10: Math.max(0, currentDelay - recoveredMinutes * 1.5 - 3.5), p90: currentDelay - recoveredMinutes * 1.5 + 4.5 },
  ];

  return (
    <div className="glass-panel p-6 bg-[#1D1D1F]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#007AFF]" />
          <div>
            <h3 className="text-base font-bold text-[#F5F5F7]">
              Dynamic ETA Evolution & Natural Recovery Trend
            </h3>
            <p className="text-xs text-[#AAAAAA]">
              Comparing Traditional Static Delay vs RAIL-CAST AI Dynamic Prediction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-[#007AFF]">
            <span className="w-2 h-2 rounded-full bg-[#007AFF]" /> RAIL-CAST AI (Dynamic)
          </span>
          <span className="flex items-center gap-1 text-[#FF9F0A]">
            <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" /> Static Delay Rule
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="time"
              stroke="#AAAAAA"
              tick={{ fill: '#AAAAAA', fontSize: 11 }}
            />
            <YAxis
              stroke="#AAAAAA"
              tick={{ fill: '#AAAAAA', fontSize: 11 }}
              unit="m"
              label={{ value: 'Delay (Minutes)', angle: -90, position: 'insideLeft', fill: '#AAAAAA', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1D1D1F',
                borderColor: '#2C2C2E',
                borderRadius: '12px',
                color: '#F5F5F7',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(value: any, name: any) => {
                if (name === 'dynamicAI') return [`+${value} min`, 'RAIL-CAST AI (Dynamic)'];
                if (name === 'naiveDelay') return [`+${value} min`, 'Static Delay Rule'];
                if (name === 'scheduled') return [`0 min`, 'Official Schedule'];
                return [value, name];
              }}
            />
            {/* Confidence Ribbon Area */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="none"
              fill="#007AFF"
              fillOpacity={0.15}
              name="Confidence Range"
            />
            {/* Flat Schedule */}
            <Line
              type="monotone"
              dataKey="scheduled"
              stroke="#AAAAAA"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              name="Official Schedule"
            />
            {/* Naive constant delay line */}
            <Line
              type="monotone"
              dataKey="naiveDelay"
              stroke="#FF9F0A"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3, fill: '#FF9F0A' }}
              name="Static Delay Rule"
            />
            {/* AI Dynamic Curve */}
            <Line
              type="monotone"
              dataKey="dynamicAI"
              stroke="#007AFF"
              strokeWidth={3}
              dot={{ r: 4, fill: '#007AFF' }}
              activeDot={{ r: 6, fill: '#007AFF', stroke: '#F5F5F7', strokeWidth: 2 }}
              name="RAIL-CAST AI (Dynamic)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
