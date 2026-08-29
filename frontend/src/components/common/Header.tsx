import React, { useState, useEffect } from 'react';
import { Activity, Train, Navigation, SlidersHorizontal, BarChart3, Settings, Wifi, RefreshCw, Sun, Moon, Languages } from 'lucide-react';
import { wsClient, ConnectionStatus } from '../../api/websocket';
import { getApiBaseUrl, setCustomApiUrl } from '../../api/client';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../i18n/translations';

interface HeaderProps {
  activeTab: 'passenger' | 'controller' | 'simulation' | 'metrics';
  setActiveTab: (tab: 'passenger' | 'controller' | 'simulation' | 'metrics') => void;
  activeAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, activeAlertsCount }) => {
  const [time, setTime] = useState<string>('');
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('WS_CONNECTED');
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(getApiBaseUrl());
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const unsubStatus = wsClient.onStatusChange((status) => {
      setConnStatus(status);
    });

    return () => {
      clearInterval(interval);
      unsubStatus();
    };
  }, []);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomApiUrl(customUrl);
    setShowConfig(false);
    window.location.reload();
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'hi', label: 'हिंदी' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-[#2C2C2E] px-6 py-3 mb-6 bg-[#1D1D1F]/90">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#007AFF] flex items-center justify-center shadow-lg shadow-[#007AFF]/30 transition-transform hover:scale-105">
            <Train className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                RAIL<span className="text-[#007AFF]">-CAST</span> <span className="text-[#007AFF] font-extrabold">AI</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/15 border border-[#007AFF]/40 text-[#007AFF] font-mono font-semibold tracking-wider">
                v2.0 PROD
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center bg-[var(--bg-base)] p-1 rounded-xl border border-[var(--border-c)]">
          <button
            onClick={() => setActiveTab('passenger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'passenger'
                ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {t('navPassengerEta')}
          </button>

          <button
            onClick={() => setActiveTab('controller')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
              activeTab === 'controller'
                ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {t('navControlDispatch')}
            {activeAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-ping absolute top-1.5 right-1.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'simulation'
                ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t('navWhatIfSandbox')}
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              activeTab === 'metrics'
                ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {t('navMlMetrics')}
          </button>
        </nav>

        {/* Right: Live Telemetry Status & Endpoint Config */}
        <div className="flex items-center gap-3">
          {connStatus === 'WS_CONNECTED' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#30D158]/10 border border-[#30D158]/30">
              <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
              <span className="text-[11px] font-medium text-[#30D158] flex items-center gap-1">
                <Wifi className="w-3 h-3" /> {t('liveWs')}
              </span>
            </div>
          ) : connStatus === 'HTTP_POLLING' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#007AFF]/10 border border-[#007AFF]/30">
              <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
              <span className="text-[11px] font-medium text-[#007AFF] flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> {t('liveSync')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF9F0A]/10 border border-[#FF9F0A]/30">
              <span className="w-2 h-2 rounded-full bg-[#FF9F0A] animate-ping" />
              <span className="text-[11px] font-medium text-[#FF9F0A]">{t('syncing')}</span>
            </div>
          )}

          <div className="text-right font-mono hidden sm:block">
            <div className="text-xs font-bold text-[var(--text-primary)] tracking-wider">{time} IST</div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              {connStatus === 'WS_CONNECTED' ? 'SUB-50ms WS' : 'RESILIENT HTTP'}
            </div>
          </div>

          {/* Language Switcher — separate section */}
          <div className="flex items-center gap-1 bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-c)]">
            <Languages className="w-3.5 h-3.5 text-[var(--text-secondary)] ml-1" />
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                title={l.label}
                className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                  language === l.code
                    ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Dark / Light Theme Toggle */}
          <div className="flex items-center bg-[var(--bg-base)] p-1 rounded-lg border border-[var(--border-c)]">
            <button
              onClick={() => setTheme('dark')}
              title="Dark mode"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('themeDark')}</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              title="Light mode"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/30'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t('themeLight')}</span>
            </button>
          </div>

          {/* API Settings Trigger */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            title="Backend API Configuration"
            className="p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--border-c)] text-[var(--text-secondary)] hover:text-[#007AFF] hover:border-[#007AFF]/40 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Backend API Configuration Modal / Dropdown */}
      {showConfig && (
        <div className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[#007AFF]/40 shadow-2xl max-w-xl mx-auto text-left">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#007AFF]" />
              Backend API Connection & Vercel Settings
            </h4>
            <button
              onClick={() => setShowConfig(false)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSaveUrl} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                API Base URL (FastAPI Endpoint)
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="http://localhost:8000/api or https://your-backend.railway.app/api"
                className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--bg-base)] border border-[var(--border-c)] text-[var(--text-primary)] focus:outline-none focus:border-[#007AFF]"
              />
              <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                When deploying on Vercel, leave empty to use relative <code className="text-[#007AFF]">/api</code> or enter your hosted backend URL.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomUrl('http://localhost:8000/api');
                  setCustomApiUrl('');
                  window.location.reload();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-base)] border border-[var(--border-c)]"
              >
                Reset to Default
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#007AFF] text-white hover:bg-[#0062CC] transition-colors"
              >
                Apply & Connect
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
};
