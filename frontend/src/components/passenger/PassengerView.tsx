import React, { useState, useEffect } from 'react';
import { Search, Train, Zap } from 'lucide-react';
import { TrainSummary, TrainETAResponse, ExplanationResponse } from '../../types';
import { api } from '../../api/client';
import { TrainStatusCard } from './TrainStatusCard';
import { UpcomingStationsTable } from './UpcomingStationsTable';
import { ETATimelineChart } from './ETATimelineChart';
import { ExplanationPanel } from './ExplanationPanel';
import { InteractiveCorridorMap } from './InteractiveCorridorMap';

interface PassengerViewProps {
  trains: TrainSummary[];
  selectedTrainNumber: string;
  onSelectTrain: (trainNumber: string) => void;
}

export const PassengerView: React.FC<PassengerViewProps> = ({
  trains,
  selectedTrainNumber,
  onSelectTrain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [etaData, setEtaData] = useState<TrainETAResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [anomalyTriggered, setAnomalyTriggered] = useState(false);

  // Active selected train
  const currentTrain = trains.find((t) => t.train_number === selectedTrainNumber) || trains[0];

  useEffect(() => {
    if (currentTrain) {
      loadTrainDetails(currentTrain.train_number);
    }
  }, [selectedTrainNumber, trains]);

  const loadTrainDetails = async (trainNumber: string) => {
    try {
      setLoading(true);
      const [etaRes, explainRes] = await Promise.all([
        api.getTrainETA(trainNumber),
        api.getTrainExplanation(trainNumber),
      ]);
      setEtaData(etaRes);
      setExplanation(explainRes);
    } catch (err) {
      console.error('Failed to fetch train ETA/explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestDisruption = async () => {
    if (!currentTrain) return;
    try {
      if (!anomalyTriggered) {
        await api.injectAnomaly(currentTrain.train_number, 'EMERGENCY_HALT', 45);
        setAnomalyTriggered(true);
      } else {
        await api.clearAnomaly(currentTrain.train_number);
        setAnomalyTriggered(false);
      }
      setTimeout(() => loadTrainDetails(currentTrain.train_number), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTrains = trains.filter(
    (t) =>
      t.train_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin_station.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination_station.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Train Selector & Search Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#1D1D1F]">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#AAAAAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search train (e.g. 12628, Rajdhani, SBC)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#121214] border border-[#2C2C2E] rounded-xl text-xs text-[#F5F5F7] placeholder-[#AAAAAA] focus:outline-none focus:border-[#007AFF] transition"
          />
        </div>

        {/* Quick Train Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {filteredTrains.slice(0, 5).map((t) => (
            <button
              key={t.train_number}
              onClick={() => onSelectTrain(t.train_number)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                t.train_number === currentTrain?.train_number
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30 font-bold'
                  : 'bg-[#121214] border border-[#2C2C2E] text-[#AAAAAA] hover:text-[#F5F5F7] hover:bg-[#242426]'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>{t.train_number}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                t.delay_minutes > 15 
                  ? 'bg-[#FF453A]/20 text-[#FF453A]' 
                  : t.delay_minutes > 0 
                  ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]'
                  : 'bg-[#30D158]/20 text-[#30D158]'
              }`}>
                {t.delay_minutes > 0 ? `+${t.delay_minutes}m` : '0m'}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive Demo Action */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleTestDisruption}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              anomalyTriggered
                ? 'bg-[#FF453A] hover:bg-[#FF453A]/90 text-white animate-pulse'
                : 'bg-[#121214] hover:bg-[#242426] text-[#007AFF] border border-[#007AFF]/30 shadow-sm'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {anomalyTriggered ? 'Clear Disruption' : 'Trigger Live Disruption'}
          </button>
        </div>
      </div>

      {/* Main Train Status Card */}
      {currentTrain && <TrainStatusCard train={currentTrain} etaData={etaData} />}

      {/* Interactive Corridor Schematic */}
      {currentTrain && etaData && (
        <InteractiveCorridorMap train={currentTrain} stations={etaData.upcoming_stations} />
      )}

      {/* Grid: Upcoming Stations & ETA Evolution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {etaData && <UpcomingStationsTable stations={etaData.upcoming_stations} />}
        {currentTrain && (
          <ETATimelineChart
            currentDelay={currentTrain.delay_minutes}
            recoveredMinutes={etaData?.total_recovered_minutes || 4.5}
          />
        )}
      </div>

      {/* Explainable AI Panel (SHAP Waterfall) */}
      <ExplanationPanel explanation={explanation} isLoading={loading} />
    </div>
  );
};
