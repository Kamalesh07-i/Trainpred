import React from 'react';
import { ShieldCheck, AlertTriangle, Gauge, Train } from 'lucide-react';
import { TrainSummary, NetworkStatus, RouteSectionRisk, AlertItem } from '../../types';
import { MetricBadge } from '../common/MetricBadge';
import { ActiveTrainsMatrix } from './ActiveTrainsMatrix';
import { CorridorRiskMap } from './CorridorRiskMap';
import { AnomalyAlertCenter } from './AnomalyAlertCenter';
import { SectionAnalytics } from './SectionAnalytics';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Top Network KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBadge
          label={t('networkPunctualityRate')}
          value={networkStatus?.network_punctuality_rate || 88.5}
          unit="%"
          color={networkStatus && networkStatus.network_punctuality_rate >= 80 ? 'emerald' : 'amber'}
          icon={<ShieldCheck className="w-4 h-4 text-[#30D158]" />}
        />
        <MetricBadge
          label={t('activeFleetDensity')}
          value={networkStatus?.total_active_trains || trains.length}
          unit={t('trainsUnit')}
          color="blue"
          icon={<Train className="w-4 h-4 text-[#007AFF]" />}
        />
        <MetricBadge
          label={t('activeDisruptionAlerts')}
          value={alerts.length}
          unit={t('eventsUnit')}
          color={alerts.length > 0 ? 'rose' : 'emerald'}
          icon={<AlertTriangle className="w-4 h-4 text-[#FF453A]" />}
        />
        <MetricBadge
          label={t('fleetVelocityAverage')}
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
