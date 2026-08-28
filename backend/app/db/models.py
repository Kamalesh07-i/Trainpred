from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

class Train(Base):
    __tablename__ = "trains"
    
    train_number = Column(String(10), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    train_type = Column(String(50), nullable=False) # Superfast, Express, Vande Bharat, Freight
    origin_station = Column(String(10), nullable=False)
    destination_station = Column(String(10), nullable=False)
    priority_level = Column(Integer, default=1) # 1 (Highest: Vande Bharat/Rajdhani) to 5 (Freight)
    total_distance_km = Column(Float, nullable=False)
    scheduled_departure = Column(String(10), nullable=False)
    scheduled_arrival = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    positions = relationship("TrainPosition", back_populates="train", order_by="desc(TrainPosition.timestamp)")
    events = relationship("TrainEvent", back_populates="train")
    predictions = relationship("ETAPrediction", back_populates="train")

class Station(Base):
    __tablename__ = "stations"
    
    code = Column(String(10), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    zone = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    platform_count = Column(Integer, default=4)
    is_junction = Column(Boolean, default=False)
    sequence_order = Column(Integer, default=0)

class RouteSection(Base):
    __tablename__ = "route_sections"
    
    section_id = Column(String(50), primary_key=True, index=True)
    from_station_code = Column(String(10), ForeignKey("stations.code"), nullable=False)
    to_station_code = Column(String(10), ForeignKey("stations.code"), nullable=False)
    corridor_name = Column(String(100), nullable=False)
    distance_km = Column(Float, nullable=False)
    max_permissible_speed = Column(Float, default=130.0) # km/h
    gradient = Column(String(20), default="1 in 150")
    tracks_count = Column(Integer, default=2) # Double line
    signalling_type = Column(String(50), default="Automatic Block Signalling (ABS)")
    electrification = Column(String(50), default="25kV AC Overhead")
    normal_travel_time_min = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrainPosition(Base):
    __tablename__ = "train_positions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    train_number = Column(String(10), ForeignKey("trains.train_number"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    current_speed = Column(Float, default=0.0) # km/h
    current_section_id = Column(String(50), nullable=True)
    distance_covered_km = Column(Float, default=0.0)
    delay_minutes = Column(Float, default=0.0)
    status = Column(String(50), default="ON_TIME") # ON_TIME, DELAYED, CRITICAL_DELAY, STOPPED
    last_halt_station = Column(String(10), nullable=True)
    next_station = Column(String(10), nullable=True)
    eta_next_station = Column(String(30), nullable=True)
    
    train = relationship("Train", back_populates="positions")

class TrainEvent(Base):
    __tablename__ = "train_events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    train_number = Column(String(10), ForeignKey("trains.train_number"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String(50), nullable=False) # SPEED_RESTRICTION, SIGNAL_HALT, WEATHER_DISRUPTION, ANOMALY
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    section_id = Column(String(50), nullable=True)
    duration_minutes = Column(Float, default=0.0)
    
    train = relationship("Train", back_populates="events")

class ETAPrediction(Base):
    __tablename__ = "eta_predictions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    train_number = Column(String(10), ForeignKey("trains.train_number"), index=True)
    target_station_code = Column(String(10), nullable=False)
    predicted_eta = Column(DateTime, nullable=False)
    scheduled_eta = Column(DateTime, nullable=False)
    delay_minutes = Column(Float, default=0.0)
    natural_recovery_minutes = Column(Float, default=0.0)
    confidence_lower_p10 = Column(DateTime, nullable=True)
    confidence_p50 = Column(DateTime, nullable=True)
    confidence_upper_p90 = Column(DateTime, nullable=True)
    confidence_score = Column(Float, default=0.92) # 0.0 to 1.0
    shap_values = Column(JSON, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)
    
    train = relationship("Train", back_populates="predictions")

class HistoricalRun(Base):
    __tablename__ = "historical_runs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    train_number = Column(String(10), index=True)
    run_date = Column(String(20), nullable=False)
    origin_station = Column(String(10), nullable=False)
    destination_station = Column(String(10), nullable=False)
    scheduled_duration_min = Column(Float, nullable=False)
    actual_duration_min = Column(Float, nullable=False)
    total_delay_min = Column(Float, default=0.0)
    weather_condition = Column(String(50), default="CLEAR")
    congestion_index = Column(Float, default=0.3)

class SectionPerformance(Base):
    __tablename__ = "section_performance"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    section_id = Column(String(50), ForeignKey("route_sections.section_id"), index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    active_train_count = Column(Integer, default=1)
    average_speed = Column(Float, default=85.0)
    congestion_score = Column(Float, default=0.25) # 0.0 (empty) to 1.0 (gridlock)
    bottleneck_risk_level = Column(String(20), default="LOW") # LOW, MODERATE, HIGH, SEVERE
    delay_absorption_capacity_min = Column(Float, default=5.0)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(String(50), unique=True, index=True)
    train_number = Column(String(10), nullable=True)
    section_id = Column(String(50), nullable=True)
    alert_type = Column(String(50), nullable=False) # ANOMALY, BOTTLENECK, CONGESTION, SIGNAL_FAILURE
    severity = Column(String(20), default="MEDIUM") # INFO, LOW, MEDIUM, HIGH, CRITICAL
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class ModelMetric(Base):
    __tablename__ = "model_metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(20), default="2.0.0")
    mae = Column(Float, default=2.8)
    rmse = Column(Float, default=4.2)
    r2 = Column(Float, default=0.91)
    ece_score = Column(Float, default=0.038)
    inference_time_ms = Column(Float, default=18.5)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

class SimulationResult(Base):
    __tablename__ = "simulation_results"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    scenario_id = Column(String(50), index=True)
    scenario_name = Column(String(100), nullable=False)
    train_number = Column(String(10), nullable=False)
    disruption_type = Column(String(50), nullable=False) # SPEED_RESTRICTION, WEATHER, HALT, JUNCTION_BLOCK
    disruption_duration_min = Column(Float, default=15.0)
    baseline_arrival_eta = Column(String(30), nullable=False)
    simulated_arrival_eta = Column(String(30), nullable=False)
    net_delay_impact_min = Column(Float, default=0.0)
    downstream_cascade_stations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(String(20), default="INFO")
    component = Column(String(50), default="SYSTEM")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
