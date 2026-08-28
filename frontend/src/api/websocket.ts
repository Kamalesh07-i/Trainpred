import { api, getApiBaseUrl } from './client';

export type ConnectionStatus = 'WS_CONNECTED' | 'HTTP_POLLING' | 'RECONNECTING';
type TelemetryCallback = (data: any) => void;
type AlertCallback = (data: any) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class WebSocketClient {
  private telemetryWs: WebSocket | null = null;
  private alertWs: WebSocket | null = null;
  private telemetryListeners: TelemetryCallback[] = [];
  private alertListeners: AlertCallback[] = [];
  private statusListeners: StatusCallback[] = [];
  private reconnectInterval = 5000;
  private currentStatus: ConnectionStatus = 'RECONNECTING';
  private pollingIntervalId: any = null;
  private isWsSupported = typeof WebSocket !== 'undefined';
  private failedAttempts = 0;

  constructor() {
    this.connect();
  }

  public connect() {
    this.stopPolling();
    this.connectTelemetry();
    this.connectAlerts();
  }

  private setStatus(status: ConnectionStatus) {
    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.statusListeners.forEach((fn) => fn(status));
    }
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  public onStatusChange(cb: StatusCallback) {
    this.statusListeners.push(cb);
    cb(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== cb);
    };
  }

  private getWsBaseUrl(): string {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    
    // Auto convert HTTP API URL to WS URL
    const apiUrl = getApiBaseUrl();
    if (apiUrl.startsWith('http://')) {
      return apiUrl.replace('http://', 'ws://').replace(/\/api\/?$/, '');
    } else if (apiUrl.startsWith('https://')) {
      return apiUrl.replace('https://', 'wss://').replace(/\/api\/?$/, '');
    } else if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}`;
    }
    
    // Default local
    return 'ws://localhost:8000';
  }

  private connectTelemetry() {
    if (!this.isWsSupported) {
      this.startPollingFallback();
      return;
    }

    try {
      const wsUrl = `${this.getWsBaseUrl()}/ws/telemetry`;
      this.telemetryWs = new WebSocket(wsUrl);

      this.telemetryWs.onopen = () => {
        console.log('[WS] Telemetry connected');
        this.failedAttempts = 0;
        this.setStatus('WS_CONNECTED');
        this.stopPolling();
      };

      this.telemetryWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.telemetryListeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('[WS] Parse error:', e);
        }
      };

      this.telemetryWs.onclose = () => {
        this.failedAttempts++;
        if (this.failedAttempts >= 2) {
          this.startPollingFallback();
        } else {
          this.setStatus('RECONNECTING');
          setTimeout(() => this.connectTelemetry(), this.reconnectInterval);
        }
      };

      this.telemetryWs.onerror = () => {
        this.telemetryWs?.close();
      };
    } catch (err) {
      this.startPollingFallback();
    }
  }

  private connectAlerts() {
    if (!this.isWsSupported) return;

    try {
      const wsUrl = `${this.getWsBaseUrl()}/ws/alerts`;
      this.alertWs = new WebSocket(wsUrl);

      this.alertWs.onopen = () => {
        console.log('[WS] Alerts stream connected');
      };

      this.alertWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.alertListeners.forEach((listener) => listener(data));
        } catch (e) {
          console.error('[WS] Alert parse error:', e);
        }
      };

      this.alertWs.onclose = () => {
        setTimeout(() => this.connectAlerts(), this.reconnectInterval);
      };

      this.alertWs.onerror = () => {
        this.alertWs?.close();
      };
    } catch (err) {
      // Ignored - fallback handles data
    }
  }

  // Graceful HTTP Polling Fallback for Vercel Serverless / Cloud Hosting
  private startPollingFallback() {
    this.setStatus('HTTP_POLLING');
    if (this.pollingIntervalId) return;

    console.info('[Sync] Operating in resilient HTTP polling mode (3s interval)');
    
    this.pollingIntervalId = setInterval(async () => {
      try {
        const trains = await api.getTrains();
        const payload = {
          type: 'TELEMETRY_UPDATE',
          timestamp: new Date().toISOString(),
          trains: trains.map((t) => ({
            train_number: t.train_number,
            latitude: t.latitude,
            longitude: t.longitude,
            speed: t.current_speed,
            delay: t.delay_minutes,
            status: t.status,
            next_station: t.next_station,
            eta_next: t.eta_next_station
          }))
        };
        this.telemetryListeners.forEach((listener) => listener(payload));
      } catch (err) {
        // Handled silently
      }
    }, 3000);
  }

  private stopPolling() {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }
  }

  public onTelemetry(cb: TelemetryCallback) {
    this.telemetryListeners.push(cb);
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((l) => l !== cb);
    };
  }

  public onAlert(cb: AlertCallback) {
    this.alertListeners.push(cb);
    return () => {
      this.alertListeners = this.alertListeners.filter((l) => l !== cb);
    };
  }
}

export const wsClient = new WebSocketClient();
