import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import Train, Station, RouteSection, TrainPosition, SimulationResult
from app.schemas.pydantic_models import WhatIfRequest, WhatIfResponse
from app.ml.feature_engineering import FeatureEngineering
from app.ml.travel_time_model import travel_time_model
from app.ml.delay_recovery_model import delay_recovery_model

class SimulationService:
    @staticmethod
    def run_what_if_scenario(db: Session, request: WhatIfRequest) -> WhatIfResponse:
        train = db.query(Train).filter(Train.train_number == request.train_number).first()
        if not train:
            raise ValueError(f"Train {request.train_number} not found.")

        latest_pos = db.query(TrainPosition).filter(TrainPosition.train_number == request.train_number).order_by(TrainPosition.timestamp.desc()).first()
        current_delay = latest_pos.delay_minutes if latest_pos else 5.0
        covered_km = latest_pos.distance_covered_km if latest_pos else 200.0
        current_speed = latest_pos.current_speed if latest_pos else 95.0
        
        # Calculate disruption parameters
        disruption_penalty_min = 0.0
        if request.disruption_type == "SPEED_RESTRICTION":
            # e.g., TSR of 30 km/h over 20 km section
            limit = request.speed_limit_kmh or 30.0
            normal_speed = 110.0
            time_at_limit = (20.0 / limit) * 60.0
            time_normal = (20.0 / normal_speed) * 60.0
            disruption_penalty_min = max(5.0, time_at_limit - time_normal)
        elif request.disruption_type == "WEATHER_DISRUPTION":
            mult = 1.35 if request.weather_type == "HEAVY_RAIN" else 1.50
            disruption_penalty_min = (40.0 / 85.0) * 60.0 * (mult - 1.0)
        elif request.disruption_type == "SIGNAL_HALT":
            disruption_penalty_min = request.duration_minutes
        elif request.disruption_type == "JUNCTION_BLOCK":
            disruption_penalty_min = request.duration_minutes * 1.25
        else:
            disruption_penalty_min = request.duration_minutes

        simulated_initial_delay = current_delay + disruption_penalty_min
        
        # Downstream corridor stations
        all_stations = db.query(Station).order_by(Station.sequence_order.asc()).all()
        codes = ["SBC", "BWT", "JTJ", "KPD", "AJJ", "MAS", "GDR", "BZA", "WL", "BPQ", "NGP", "ET", "BPL", "VGLB", "GWL", "AGC", "MTJ", "NZM", "NDLS"]
        if train.train_number == "12951":
            codes = ["MMCT", "ST", "BRC", "RTM", "KOTA", "MTJ", "NZM", "NDLS"]
        elif train.train_number == "22436":
            codes = ["NDLS", "CNB", "PRYJ", "BSB"]
        elif train.train_number == "12002":
            codes = ["NDLS", "MTJ", "AGC", "GWL", "VGLB", "BPL"]
            
        code_to_stn = {s.code: s for s in all_stations}
        stn_list = [code_to_stn[c] for c in codes if c in code_to_stn]
        
        step_km = train.total_distance_km / max(1, len(stn_list) - 1)
        now = datetime.utcnow()
        
        # Baseline Recovery vs Disrupted Recovery
        base_rec_feats = FeatureEngineering.extract_delay_recovery_features(
            current_delay_min=current_delay,
            remaining_corridor_distance_km=train.total_distance_km - covered_km,
            total_slack_time_ahead_min=25.0,
            priority_level=train.priority_level
        )
        base_recovery_total = delay_recovery_model.predict(base_rec_feats, current_delay)
        
        sim_rec_feats = FeatureEngineering.extract_delay_recovery_features(
            current_delay_min=simulated_initial_delay,
            remaining_corridor_distance_km=train.total_distance_km - covered_km,
            total_slack_time_ahead_min=25.0,
            priority_level=train.priority_level,
            congestion_index=0.55
        )
        sim_recovery_total = delay_recovery_model.predict(sim_rec_feats, simulated_initial_delay)
        
        affected_stations = []
        
        for idx, stn in enumerate(stn_list):
            stn_dist = idx * step_km
            if stn_dist >= covered_km:
                rem_dist = stn_dist - covered_km
                rec_frac = min(1.0, rem_dist / max(50.0, train.total_distance_km - covered_km))
                
                # Baseline
                base_delay_at_stn = max(0.0, current_delay - base_recovery_total * rec_frac)
                base_run_min = (rem_dist / 105.0) * 60.0 + base_delay_at_stn
                base_eta_dt = now + timedelta(minutes=int(base_run_min))
                
                # Simulated
                sim_delay_at_stn = max(0.0, simulated_initial_delay - sim_recovery_total * rec_frac)
                sim_run_min = (rem_dist / 105.0) * 60.0 + sim_delay_at_stn
                sim_eta_dt = now + timedelta(minutes=int(sim_run_min))
                
                delta_min = round(sim_run_min - base_run_min, 1)
                
                affected_stations.append({
                    "station_code": stn.code,
                    "station_name": stn.name,
                    "baseline_eta": base_eta_dt.strftime("%H:%M"),
                    "simulated_eta": sim_eta_dt.strftime("%H:%M"),
                    "delay_delta_minutes": delta_min,
                    "simulated_delay_minutes": round(sim_delay_at_stn, 1),
                    "cascade_risk": "HIGH" if delta_min >= 15.0 else "MEDIUM" if delta_min >= 5.0 else "LOW"
                })

        baseline_final = affected_stations[-1]["baseline_eta"] if affected_stations else "18:00"
        simulated_final = affected_stations[-1]["simulated_eta"] if affected_stations else "18:25"
        net_delta = affected_stations[-1]["delay_delta_minutes"] if affected_stations else disruption_penalty_min

        severity = "CRITICAL" if net_delta >= 25.0 else "HIGH" if net_delta >= 12.0 else "MEDIUM"
        
        # Actionable AI Recommendation
        if request.disruption_type == "SPEED_RESTRICTION":
            mitigation = f"Grant priority clear-signal path through downstream sections to utilize {sim_recovery_total:.1f}m slack buffer and compress terminal turnaround dwell."
        elif request.disruption_type == "WEATHER_DISRUPTION":
            mitigation = f"Activate cab-signalling advisory to maintain optimal headway and regulate preceding freight speeds by -15 km/h."
        else:
            mitigation = f"Divert local freight to loop siding at nearest junction to enable nonstop run and recover {sim_recovery_total * 0.7:.1f}m within next 120 km."

        scenario_id = f"SIM-{uuid.uuid4().hex[:8].upper()}"
        
        # Save record
        db_record = SimulationResult(
            scenario_id=scenario_id,
            scenario_name=request.scenario_name,
            train_number=request.train_number,
            disruption_type=request.disruption_type,
            disruption_duration_min=disruption_penalty_min,
            baseline_arrival_eta=baseline_final,
            simulated_arrival_eta=simulated_final,
            net_delay_impact_min=net_delta,
            downstream_cascade_stations=affected_stations
        )
        db.add(db_record)
        db.commit()

        return WhatIfResponse(
            scenario_id=scenario_id,
            scenario_name=request.scenario_name,
            train_number=request.train_number,
            disruption_type=request.disruption_type,
            baseline_final_eta=baseline_final,
            simulated_final_eta=simulated_final,
            net_delay_delta_minutes=net_delta,
            impact_severity=severity,
            affected_stations=affected_stations,
            mitigation_recommendation=mitigation
        )

simulation_service = SimulationService()
