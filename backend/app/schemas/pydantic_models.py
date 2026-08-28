from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class StationSchema(BaseModel):
    code: str
    name: str
    state: str
    zone: str
    latitude: float
    longitude: float
    platform_count: int
    is_junction: bool
    sequence_order: int

    class Config:
        from_attributes = True

class RouteSectionSchema(BaseModel):
    section_id: str
    from_station_code: str
    to_station_code: str
    corridor_name: str
    distance_km: float
    max_permissible_speed: float
    normal_travel_time_min: float

    class Config:
        from_attributes = True

class TrainPositionSchema(BaseModel):
    train_number: str
    timestamp: datetime
    latitude: float
    longitude: float
    current_speed: float
    current_section_id: Optional[str] = None
    distance_covered_km: float
    delay_minutes: float
    status: str
    last_halt_station: Optional[str] = None
    next_station: Optional[str] = None
    eta_next_station: Optional[str] = None

    class Config:
        from_attributes = True

class TrainSummarySchema(BaseModel):
    train_number: str
    name: str
    train_type: str
    origin_station: str
    destination_station: str
    priority_level: int
    total_distance_km: float
    scheduled_departure: str
    scheduled_arrival: str
    current_speed: float
    delay_minutes: float
    status: str
    next_station: Optional[str] = None
    eta_next_station: Optional[str] = None
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    latitude: float
    longitude: float

class StationETASchema(BaseModel):
    station_code: str
    station_name: str
    distance_from_origin_km: float
    scheduled_arrival: str
    predicted_eta: str
    delay_minutes: float
    natural_recovery_minutes: float
    confidence_percentage: float
    confidence_window_p10_p90: str # e.g. "14:45 - 14:52"
    status: str

class TrainETAResponse(BaseModel):
    train_number: str
    train_name: str
    current_station: Optional[str] = None
    next_station: Optional[str] = None
    current_delay_minutes: float
    total_recovered_minutes: float
    final_destination_eta: str
    final_destination_scheduled: str
    overall_confidence_percentage: float
    active_weather_condition: str
    upcoming_stations: List[StationETASchema]

class ContributingFactor(BaseModel):
    rank: int
    feature: str
    category: str
    impact_minutes: float
    contribution_percent: float
    explanation: str

class ExplanationDetail(BaseModel):
    contributing_factors: List[ContributingFactor]
    summary: str

class ExplanationResponse(BaseModel):
    train_number: str
    prediction_time: str
    base_travel_time_minutes: float
    predicted_travel_time_minutes: float
    net_impact_minutes: float
    natural_recovery_minutes: float
    explanation: ExplanationDetail

class AlertSchema(BaseModel):
    id: int
    alert_id: str
    train_number: Optional[str] = None
    section_id: Optional[str] = None
    alert_type: str
    severity: str
    title: str
    message: str
    recommendation: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NetworkStatusResponse(BaseModel):
    total_active_trains: int
    on_time_trains: int
    delayed_trains: int
    critical_delayed_trains: int
    network_punctuality_rate: float
    active_alerts_count: int
    avg_network_speed_kmh: float
    highest_congestion_section: str
    system_health: str

class WhatIfRequest(BaseModel):
    scenario_name: str
    train_number: str
    disruption_type: str # SPEED_RESTRICTION, WEATHER_DISRUPTION, SIGNAL_HALT, JUNCTION_BLOCK
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    duration_minutes: float = 15.0
    affected_section_id: Optional[str] = None
    weather_type: Optional[str] = "HEAVY_RAIN"
    speed_limit_kmh: Optional[float] = 30.0

class WhatIfResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    train_number: str
    disruption_type: str
    baseline_final_eta: str
    simulated_final_eta: str
    net_delay_delta_minutes: float
    impact_severity: str
    affected_stations: List[Dict[str, Any]]
    mitigation_recommendation: str
