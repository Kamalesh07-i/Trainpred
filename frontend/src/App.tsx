import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { AlertToast } from './components/common/AlertToast';
import { PassengerView } from './components/passenger/PassengerView';
import { ControllerView } from './components/controller/ControllerView';
import { WhatIfSandbox } from './components/simulation/WhatIfSandbox';
import { ModelMetricsView } from './components/metrics/ModelMetricsView';
import { TrainSummary, NetworkStatus, RouteSectionRisk, AlertItem } from './types';
import { api } from './api/client';
import { wsClient } from './api/websocket';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'passenger' | 'controller' | 'simulation' | 'metrics'>('passenger');
  const [trains, setTrains] = useState<TrainSummary[]>([]);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [riskSections, setRiskSections] = useState<RouteSectionRisk[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('12628');

  useEffect(() => {
    loadInitialData();

    const unsubTelemetry = wsClient.onTelemetry((payload) => {
      if (payload.type === 'TELEMETRY_UPDATE' && payload.trains) {
        setTrains((prev) => {
          const map = new Map<string, any>(payload.trains.map((t: any) => [t.train_number, t]));
          return prev.map((item) => {
            const update: any = map.get(item.train_number);
            if (update) {
              return {
                ...item,
                latitude: update.latitude,
                longitude: update.longitude,
                current_speed: update.speed,
                delay_minutes: update.delay,
                status: update.status,
                next_station: update.next_station,
                eta_next_station: update.eta_next,
                risk_level: update.delay >= 25 ? 'CRITICAL' : update.delay >= 15 ? 'HIGH' : update.delay >= 5 ? 'MODERATE' : 'LOW'
              };
            }
            return item;
          });
        });
      }
    });

    const unsubAlerts = wsClient.onAlert((payload) => {
      if (payload.type === 'NEW_ALERT') {
        const newAlt: AlertItem = {
          id: Date.now(),
          alert_id: payload.alert_id,
          train_number: payload.train_number,
          alert_type: 'ANOMALY',
          severity: payload.severity,
          title: payload.title,
          message: payload.message,
          is_active: true,
          created_at: payload.timestamp
        };
        setAlerts((prev) => [newAlt, ...prev]);
      }
    });

    return () => {
      unsubTelemetry();
      unsubAlerts();
    };
  }, []);

  const loadInitialData = async () => {
    try {
      const [trainsData, netData, riskData, alertsData] = await Promise.all([
        api.getTrains(),
        api.getNetworkStatus(),
        api.getRiskMap(),
        api.getAlerts()
      ]);
      setTrains(trainsData);
      setNetworkStatus(netData);
      setRiskSections(riskData.sections || []);
      setAlerts(alertsData);
      if (trainsData.length > 0 && !selectedTrainNumber) {
        setSelectedTrainNumber(trainsData[0].train_number);
      }
    } catch (e) {
      console.error('Initial fetch failed:', e);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await api.resolveAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.alert_id !== alertId));
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-12 selection:bg-[#007AFF] selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={alerts.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {activeTab === 'passenger' && (
          <PassengerView
            trains={trains}
            selectedTrainNumber={selectedTrainNumber}
            onSelectTrain={setSelectedTrainNumber}
          />
        )}

        {activeTab === 'controller' && (
          <ControllerView
            trains={trains}
            networkStatus={networkStatus}
            riskSections={riskSections}
            alerts={alerts}
            onSelectTrain={(num) => {
              setSelectedTrainNumber(num);
              setActiveTab('passenger');
            }}
            onResolveAlert={handleResolveAlert}
          />
        )}

        {activeTab === 'simulation' && (
          <WhatIfSandbox trains={trains} />
        )}

        {activeTab === 'metrics' && (
          <ModelMetricsView />
        )}
      </main>

      <AlertToast alerts={alerts} onResolve={handleResolveAlert} />
    </div>
  );
};

export default App;
