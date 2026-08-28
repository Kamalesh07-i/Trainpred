import React, { useState } from 'react';
import { SlidersHorizontal, Play, Sparkles, RotateCcw } from 'lucide-react';
import { TrainSummary, WhatIfResponse } from '../../types';
import { api } from '../../api/client';
import { ImpactComparison } from './ImpactComparison';

interface WhatIfSandboxProps {
  trains: TrainSummary[];
}

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({ trains }) => {
  const [selectedTrain, setSelectedTrain] = useState<string>(trains[0]?.train_number || '12628');
  const [scenarioName, setScenarioName] = useState<string>('Torrential Monsoon Rain in Katpadi Section');
  const [disruptionType, setDisruptionType] = useState<string>('WEATHER_DISRUPTION');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [duration, setDuration] = useState<number>(25);
  const [weatherType, setWeatherType] = useState<string>('HEAVY_RAIN');
  const [speedLimit, setSpeedLimit] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.runSimulation({
        scenario_name: scenarioName,
        train_number: selectedTrain,
        disruption_type: disruptionType,
        severity: severity,
        duration_minutes: duration,
        weather_type: weatherType,
        speed_limit_kmh: speedLimit,
      });
      setResult(res);
    } catch (err) {
      console.error('Simulation run failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const presetScenarios = [
    {
      name: 'Monsoon Downpour in Katpadi',
      type: 'WEATHER_DISRUPTION',
      weather: 'HEAVY_RAIN',
      dur: 30,
      sev: 'HIGH'
    },
    {
      name: 'Temporary Speed Restriction (TSR 30 km/h)',
      type: 'SPEED_RESTRICTION',
      speed: 30,
      dur: 20,
      sev: 'HIGH'
    },
    {
      name: 'Signal Red Halt at Interlocking Junction',
      type: 'SIGNAL_HALT',
      dur: 15,
      sev: 'MEDIUM'
    },
    {
      name: 'Critical Freight Preemption & Track Hold',
      type: 'JUNCTION_BLOCK',
      dur: 25,
      sev: 'CRITICAL'
    },
  ];

  const applyPreset = (preset: any) => {
    setScenarioName(preset.name);
    setDisruptionType(preset.type);
    setSeverity(preset.sev);
    setDuration(preset.dur);
    if (preset.weather) setWeatherType(preset.weather);
    if (preset.speed) setSpeedLimit(preset.speed);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Sandbox Form */}
      <div className="glass-panel p-6 bg-[#1D1D1F]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#2C2C2E]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#007AFF]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F5F7]">
                What-If Disruption & Cascading Delay Simulator
              </h3>
              <p className="text-xs text-[#AAAAAA]">
                Simulate weather disruptions, speed restrictions, and track blocks to observe downstream delay propagation
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {presetScenarios.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-[#121214] hover:bg-[#242426] border border-[#2C2C2E] text-[#AAAAAA] hover:text-[#F5F5F7] whitespace-nowrap transition"
              >
                {p.name.split(' ')[0]} {p.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunSimulation} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Train Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Target Train
              </label>
              <select
                value={selectedTrain}
                onChange={(e) => setSelectedTrain(e.target.value)}
                className="w-full px-3 py-2 bg-[#121214] border border-[#2C2C2E] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#007AFF]"
              >
                {trains.map((t) => (
                  <option key={t.train_number} value={t.train_number}>
                    {t.train_number} - {t.name} ({t.origin_station}➔{t.destination_station})
                  </option>
                ))}
              </select>
            </div>

            {/* Disruption Type */}
            <div>
              <label className="block text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Disruption Category
              </label>
              <select
                value={disruptionType}
                onChange={(e) => setDisruptionType(e.target.value)}
                className="w-full px-3 py-2 bg-[#121214] border border-[#2C2C2E] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#007AFF]"
              >
                <option value="WEATHER_DISRUPTION">Monsoon / Severe Weather</option>
                <option value="SPEED_RESTRICTION">Temporary Speed Restriction (TSR)</option>
                <option value="SIGNAL_HALT">Signal / Interlocking Failure</option>
                <option value="JUNCTION_BLOCK">Junction Preemption / Track Block</option>
                <option value="ROLLING_STOCK">Loco / Traction Anomaly</option>
              </select>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 bg-[#121214] border border-[#2C2C2E] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#007AFF]"
              >
                <option value="LOW">Low (Minor Delay Buffer)</option>
                <option value="MEDIUM">Medium (Moderate Congestion)</option>
                <option value="HIGH">High (Section Blockage Risk)</option>
                <option value="CRITICAL">Critical (Severe Corridor Halt)</option>
              </select>
            </div>
          </div>

          {/* Sliders & Context Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-[#121214] border border-[#2C2C2E]">
            {/* Disruption Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-[#AAAAAA] mb-2">
                <span>Injected Halt / Delay Duration</span>
                <span className="font-mono font-bold text-[#007AFF] text-sm">{duration} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-[#007AFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#AAAAAA] mt-1 font-mono">
                <span>5m</span>
                <span>30m</span>
                <span>60m</span>
                <span>90m</span>
              </div>
            </div>

            {/* Speed Limit / Weather Condition Parameter */}
            {disruptionType === 'SPEED_RESTRICTION' ? (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-[#AAAAAA] mb-2">
                  <span>Imposed Speed Limit (TSR)</span>
                  <span className="font-mono font-bold text-[#FF9F0A] text-sm">{speedLimit} km/h</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="75"
                  step="5"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(Number(e.target.value))}
                  className="w-full accent-[#FF9F0A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#AAAAAA] mt-1 font-mono">
                  <span>15 km/h</span>
                  <span>45 km/h</span>
                  <span>75 km/h</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                  Weather Multiplier
                </label>
                <select
                  value={weatherType}
                  onChange={(e) => setWeatherType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1D1D1F] border border-[#2C2C2E] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#007AFF]"
                >
                  <option value="CLEAR">Clear Skies (1.0x)</option>
                  <option value="MODERATE_RAIN">Moderate Rain (1.15x)</option>
                  <option value="HEAVY_RAIN">Heavy Torrential Monsoon (1.35x)</option>
                  <option value="DENSE_FOG">Dense Winter Fog (1.50x)</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#AAAAAA] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#007AFF]" />
              <span>Evaluates in &lt;300ms using full corridor physics simulation</span>
            </div>

            <div className="flex items-center gap-3">
              {result && (
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-[#121214] hover:bg-[#242426] border border-[#2C2C2E] text-[#AAAAAA] hover:text-[#F5F5F7] rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-[#007AFF]/30 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                {loading ? 'Computing Cascade Model...' : 'Run What-If Simulation'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Comparison View */}
      {result && <ImpactComparison result={result} />}
    </div>
  );
};
