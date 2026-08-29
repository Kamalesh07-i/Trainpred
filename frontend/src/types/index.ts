export interface TrainSummary {
  train_number: string;
  name: string;
  train_type: string;
  origin_station: string;
  destination_station: string;
  priority_level: number;
  total_distance_km: number;
  scheduled_departure: string;
  scheduled_arrival: string;
  current_speed: number;
  delay_minutes: number;
  status: "ON_TIME" | "DELAYED" | "CRITICAL_DELAY" | "STOPPED";
  next_station?: string;
  eta_next_station?: string;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  latitude: number;
  longitude: number;
}

// NEW: Track Motion AI — represents an object/obstruction detected on the
// track ahead of the train (worker, animal, debris, vehicle, etc.)
export interface TrackMotionEvent {
  detected: boolean;
  object_type?: "PERSON" | "ANIMAL" | "DEBRIS" | "VEHICLE" | "MAINTENANCE_CREW" | "UNKNOWN";
  confidence_percentage?: number;
  detected_at_km?: number;
  delay_impact_minutes?: number;
  description?: string;
  detected_at?: string; // ISO timestamp
}

export interface StationETA {
  station_code: string;
  station_name: string;
  distance_from_origin_km: number;
  scheduled_arrival: string;
  predicted_eta: string;
  delay_minutes: number;
  natural_recovery_minutes: number;
  confidence_percentage: number;
  confidence_window_p10_p90: string;
  status: string;
  track_motion?: TrackMotionEvent; // NEW: optional, populated by Track Motion AI
}

export interface TrainETAResponse {
  train_number: string;
  train_name: string;
  current_station?: string;
  next_station?: string;
  current_delay_minutes: number;
  total_recovered_minutes: number;
  final_destination_eta: string;
  final_destination_scheduled: string;
  overall_confidence_percentage: number;
  active_weather_condition: string;
  upcoming_stations: StationETA[];
}
export interface ContributingFactor {
  rank: number;
  feature: string;
  category: string;
  impact_minutes: number;
  contribution_percent: number;
  explanation: string;
}
export interface ExplanationResponse {
  train_number: string;
  prediction_time: string;
  base_travel_time_minutes: number;
  predicted_travel_time_minutes: number;
  net_impact_minutes: number;
  natural_recovery_minutes: number;
  explanation: {
    contributing_factors: ContributingFactor[];
    summary: string;
  };
}
export interface NetworkStatus {
  total_active_trains: number;
  on_time_trains: number;
  delayed_trains: number;
  critical_delayed_trains: number;
  network_punctuality_rate: number;
  active_alerts_count: number;
  avg_network_speed_kmh: number;
  highest_congestion_section: string;
  system_health: "OPTIMAL" | "ELEVATED_RISK" | "CONGESTED";
}
export interface RouteSectionRisk {
  section_id: string;
  corridor_name: string;
  from_station: string;
  to_station: string;
  distance_km: number;
  max_speed_kmh: number;
  congestion_score: number;
  risk_level: "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  active_trains: number;
  signalling: string;
}
export interface AlertItem {
  id: number;
  alert_id: string;
  train_number?: string;
  section_id?: string;
  alert_type: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  message: string;
  recommendation?: string;
  is_active: boolean;
  created_at: string;
}
export interface WhatIfAffectedStation {
  station_code: string;
  station_name: string;
  baseline_eta: string;
  simulated_eta: string;
  delay_delta_minutes: number;
  simulated_delay_minutes: number;
  cascade_risk: "LOW" | "MEDIUM" | "HIGH";
}
export interface WhatIfResponse {
  scenario_id: string;
  scenario_name: string;
  train_number: string;
  disruption_type: string;
  baseline_final_eta: string;
  simulated_final_eta: string;
  net_delay_delta_minutes: number;
  impact_severity: string;
  affected_stations: WhatIfAffectedStation[];
  mitigation_recommendation: string;
}
export interface ModelMetricItem {
  model_name: string;
  version: string;
  mae_minutes: number;
  rmse_minutes: number;
  r2_score: number;
  ece_calibration_score: number;
  inference_latency_ms: number;
  status: string;
}
