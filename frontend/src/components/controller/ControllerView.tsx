import React from 'react';
import { ShieldCheck, AlertTriangle, Gauge, Train } from 'lucide-react';
import { TrainSummary, NetworkStatus, RouteSectionRisk, AlertItem } from '../../types';
import { MetricBadge } from '../common/MetricBadge';
import { ActiveTrainsMatrix } from './ActiveTrainsMatrix';
import { CorridorRiskMap } from './CorridorRiskMap';
import { AnomalyAlertCenter } from './AnomalyAlertCenter';
import { SectionAnalytics } from './SectionAnalytics';

interface ControllerViewProps {
  trains: TrainSummary[];
  networkStatus: NetworkStatus | null;
  riskSections: RouteSectionRisk[];
  alerts: AlertItem[];
  onSelectTrain: (trainNumber: string) => void;
  onResolveAlert: (alertId: string) => void;
}

export const ControllerView: React.FC<ControllerViewProps> = ({
  trains,
  networkStatus,
  riskSections,
  alerts,
  onSelectTrain,
  onResolveAlert,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Network KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBadge
          label="Network Punctuality Rate"
          value={networkStatus?.network_punctuality_rate || 88.5}
          unit="%"
          color={networkStatus && networkStatus.network_punctuality_rate >= 80 ? 'emerald' : 'amber'}
          icon={<ShieldCheck className="w-4 h-4 text-[#30D158]" />}
        />
        <MetricBadge
          label="Active Fleet Density"
          value={networkStatus?.total_active_trains || trains.length}
          unit="Trains"
          color="blue"
          icon={<Train className="w-4 h-4 text-[#007AFF]" />}
        />
        <MetricBadge
          label="Active Disruption Alerts"
          value={alerts.length}
          unit="Events"
          color={alerts.length > 0 ? 'rose' : 'emerald'}
          icon={<AlertTriangle className="w-4 h-4 text-[#FF453A]" />}
        />
        <MetricBadge
          label="Fleet Velocity Average"
          value={networkStatus?.avg_network_speed_kmh || 92.0}
          unit="km/h"
          color="blue"
          icon={<Gauge className="w-4 h-4 text-[#007AFF]" />}
        />
      </div>

      {/* Fleet Risk & Delay Matrix */}
      <ActiveTrainsMatrix trains={trains} onSelectTrain={onSelectTrain} />

      {/* Corridor Section Risk Map */}
      <CorridorRiskMap sections={riskSections} />

      {/* Two Column Layout: Anomaly Center & Section Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomalyAlertCenter alerts={alerts} onResolveAlert={onResolveAlert} />
        <SectionAnalytics sections={riskSections} />
      </div>
    </div>
  );
};
