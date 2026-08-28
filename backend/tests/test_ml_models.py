import numpy as np
import pytest
from app.ml.feature_engineering import FeatureEngineering
from app.ml.travel_time_model import travel_time_model
from app.ml.delay_recovery_model import delay_recovery_model
from app.ml.anomaly_detector import anomaly_detector
from app.ml.confidence_engine import confidence_engine
from app.ml.explainability import explainability_engine

def test_feature_engineering_dimensions():
    # Test 22-feature vector for travel time
    f_tt = FeatureEngineering.extract_travel_time_features(
        distance_remaining_km=150.0,
        current_speed_kmh=95.0,
        max_permissible_speed=130.0,
        current_delay_min=10.0
    )
    assert len(f_tt) == 22
    assert isinstance(f_tt, np.ndarray)

    # Test 18-feature vector for delay recovery
    f_rec = FeatureEngineering.extract_delay_recovery_features(
        current_delay_min=15.0,
        remaining_corridor_distance_km=300.0,
        total_slack_time_ahead_min=20.0
    )
    assert len(f_rec) == 18
    assert isinstance(f_rec, np.ndarray)

def test_travel_time_prediction():
    f_tt = FeatureEngineering.extract_travel_time_features(
        distance_remaining_km=120.0,
        current_speed_kmh=100.0,
        max_permissible_speed=130.0,
        current_delay_min=5.0
    )
    pred = travel_time_model.predict(f_tt)
    assert pred > 0.0
    # ~120km at ~100km/h should be between 40 and 120 minutes
    assert 40.0 <= pred <= 140.0

def test_delay_recovery_bounded():
    current_delay = 20.0
    f_rec = FeatureEngineering.extract_delay_recovery_features(
        current_delay_min=current_delay,
        remaining_corridor_distance_km=400.0,
        total_slack_time_ahead_min=30.0,
        priority_level=1
    )
    rec = delay_recovery_model.predict(f_rec, current_delay)
    # Recovery must be between 0 and current_delay
    assert 0.0 <= rec <= current_delay

def test_anomaly_detection():
    # Test unscheduled mid-section halt
    res_halt = anomaly_detector.evaluate_telemetry(
        current_speed=0.0,
        previous_speed=80.0,
        is_at_station=False,
        dwell_time_min=3.5,
        scheduled_dwell_min=0.0,
        max_permissible_speed=130.0
    )
    assert res_halt["is_anomaly"] is True
    assert res_halt["type"] == "UNSCHEDULED_MID_SECTION_HALT"

    # Test sudden speed drop
    res_drop = anomaly_detector.evaluate_telemetry(
        current_speed=20.0,
        previous_speed=110.0,
        is_at_station=False,
        dwell_time_min=0.0,
        scheduled_dwell_min=0.0,
        max_permissible_speed=130.0
    )
    assert res_drop["is_anomaly"] is True
    assert res_drop["type"] == "SEVERE_SPEED_DROP"

def test_confidence_and_calibration():
    bounds = confidence_engine.calculate_confidence_bounds(
        predicted_travel_time_min=90.0,
        distance_remaining_km=140.0,
        congestion_score=0.3,
        weather_condition="CLEAR"
    )
    assert bounds["p10_minutes"] <= bounds["p50_minutes"] <= bounds["p90_minutes"]
    assert 50.0 <= bounds["confidence_percentage"] <= 100.0
    assert bounds["calibrated_confidence"] <= 1.0

def test_explainability_generation():
    f_tt = FeatureEngineering.extract_travel_time_features(
        distance_remaining_km=180.0,
        current_speed_kmh=80.0,
        max_permissible_speed=130.0,
        current_delay_min=18.0,
        congestion_score=0.75
    )
    explanation = explainability_engine.explain_prediction(
        train_number="12628",
        features=f_tt,
        base_travel_time=95.0,
        predicted_travel_time=115.0,
        current_delay=18.0,
        recovered_delay=6.0,
        weather_condition="CLEAR",
        section_name="Katpadi-Jolarpettai"
    )
    assert "explanation" in explanation
    assert len(explanation["explanation"]["contributing_factors"]) > 0
    assert "summary" in explanation["explanation"]
    assert len(explanation["explanation"]["summary"]) > 10
