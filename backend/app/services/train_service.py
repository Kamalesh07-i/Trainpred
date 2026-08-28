from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Train, Station, RouteSection, TrainPosition, Alert, SectionPerformance
from app.ml.feature_engineering import FeatureEngineering
from app.ml.travel_time_model import travel_time_model
from app.ml.delay_recovery_model import delay_recovery_model
from app.ml.confidence_engine import confidence_engine
from app.ml.explainability import explainability_engine

class TrainService:
    @staticmethod
    def get_all_active_trains(db: Session) -> List[Dict[str, Any]]:
        trains = db.query(Train).filter(Train.is_active == True).all()
        results = []
        for t in trains:
            latest_pos = db.query(TrainPosition).filter(TrainPosition.train_number == t.train_number).order_by(TrainPosition.timestamp.desc()).first()
            
            speed = latest_pos.current_speed if latest_pos else 0.0
            delay = latest_pos.delay_minutes if latest_pos else 0.0
            lat = latest_pos.latitude if latest_pos else 28.6139
            lon = latest_pos.longitude if latest_pos else 77.2090
            status = latest_pos.status if latest_pos else "ON_TIME"
            next_stn = latest_pos.next_station if latest_pos else "N/A"
            eta_next = latest_pos.eta_next_station if latest_pos else "N/A"
            
            # Risk level scoring
            if delay >= 25.0 or status == "CRITICAL_DELAY":
                risk_level = "CRITICAL"
            elif delay >= 15.0 or status == "DELAYED":
                risk_level = "HIGH"
            elif delay >= 5.0:
                risk_level = "MODERATE"
            else:
                risk_level = "LOW"
                
            results.append({
                "train_number": t.train_number,
                "name": t.name,
                "train_type": t.train_type,
                "origin_station": t.origin_station,
                "destination_station": t.destination_station,
                "priority_level": t.priority_level,
                "total_distance_km": t.total_distance_km,
                "scheduled_departure": t.scheduled_departure,
                "scheduled_arrival": t.scheduled_arrival,
                "current_speed": round(speed, 1),
                "delay_minutes": round(delay, 1),
                "status": status,
                "next_station": next_stn,
                "eta_next_station": eta_next,
                "risk_level": risk_level,
                "latitude": round(lat, 5),
                "longitude": round(lon, 5)
            })
        return results

    @staticmethod
    def get_train_details(db: Session, train_number: str) -> Optional[Dict[str, Any]]:
        train = db.query(Train).filter(Train.train_number == train_number).first()
        if not train:
            return None
        
        latest_pos = db.query(TrainPosition).filter(TrainPosition.train_number == train_number).order_by(TrainPosition.timestamp.desc()).first()
        active_alerts = db.query(Alert).filter(Alert.train_number == train_number, Alert.is_active == True).all()
        
        return {
            "train_number": train.train_number,
            "name": train.name,
            "train_type": train.train_type,
            "origin_station": train.origin_station,
            "destination_station": train.destination_station,
            "priority_level": train.priority_level,
            "total_distance_km": train.total_distance_km,
            "scheduled_departure": train.scheduled_departure,
            "scheduled_arrival": train.scheduled_arrival,
            "current_position": {
                "latitude": latest_pos.latitude if latest_pos else 0.0,
                "longitude": latest_pos.longitude if latest_pos else 0.0,
                "current_speed": latest_pos.current_speed if latest_pos else 0.0,
                "delay_minutes": latest_pos.delay_minutes if latest_pos else 0.0,
                "status": latest_pos.status if latest_pos else "ON_TIME",
                "current_section_id": latest_pos.current_section_id if latest_pos else None,
                "distance_covered_km": latest_pos.distance_covered_km if latest_pos else 0.0,
                "last_halt_station": latest_pos.last_halt_station if latest_pos else "N/A",
                "next_station": latest_pos.next_station if latest_pos else "N/A",
                "eta_next_station": latest_pos.eta_next_station if latest_pos else "N/A"
            },
            "alerts": [
                {
                    "alert_id": a.alert_id,
                    "type": a.alert_type,
                    "severity": a.severity,
                    "title": a.title,
                    "message": a.message,
                    "recommendation": a.recommendation
                } for a in active_alerts
            ]
        }

    @staticmethod
    def calculate_dynamic_eta(db: Session, train_number: str) -> Optional[Dict[str, Any]]:
        train = db.query(Train).filter(Train.train_number == train_number).first()
        if not train:
            return None
            
        pos = db.query(TrainPosition).filter(TrainPosition.train_number == train_number).order_by(TrainPosition.timestamp.desc()).first()
        current_delay = pos.delay_minutes if pos else 0.0
        current_speed = pos.current_speed if pos else 90.0
        covered_km = pos.distance_covered_km if pos else 200.0
        
        # Determine sequence of corridor stations
        all_stations = db.query(Station).order_by(Station.sequence_order.asc()).all()
        # Filter relevant stations along the train route
        route_stations = []
        if train.train_number in ["12628", "12622"]: # South corridor
            codes = ["SBC", "BWT", "JTJ", "KPD", "AJJ", "MAS", "GDR", "BZA", "WL", "BPQ", "NGP", "ET", "BPL", "VGLB", "GWL", "AGC", "MTJ", "NZM", "NDLS"]
            if train.train_number == "12628":
                codes = ["NDLS", "NZM", "MTJ", "AGC", "GWL", "VGLB", "BPL", "ET", "NGP", "BPQ", "WL", "BZA", "GDR", "MAS", "AJJ", "KPD", "JTJ", "BWT", "SBC"]
        elif train.train_number == "12951": # Western corridor
            codes = ["MMCT", "ST", "BRC", "RTM", "KOTA", "MTJ", "NZM", "NDLS"]
        elif train.train_number == "22436": # Eastern corridor
            codes = ["NDLS", "CNB", "PRYJ", "BSB"]
        elif train.train_number == "12002": # Shatabdi
            codes = ["NDLS", "MTJ", "AGC", "GWL", "VGLB", "BPL"]
        else:
            codes = ["TKD", "MTJ", "KOTA", "RTM", "BRC", "ST", "JNPT"]
            
        code_to_stn = {s.code: s for s in all_stations}
        stn_list = [code_to_stn[c] for c in codes if c in code_to_stn]
        
        # Build cumulative station list with scheduled & dynamic ETA
        now = datetime.utcnow()
        upcoming = []
        cumulative_dist = 0.0
        total_rec_min = 0.0
        
        # Calculate recovery features
        rec_features = FeatureEngineering.extract_delay_recovery_features(
            current_delay_min=current_delay,
            remaining_corridor_distance_km=max(20.0, train.total_distance_km - covered_km),
            total_slack_time_ahead_min=24.0,
            average_section_mps=130.0,
            current_speed=current_speed,
            priority_level=train.priority_level,
            congestion_index=0.35 if current_delay > 10.0 else 0.15
        )
        total_possible_recovery = delay_recovery_model.predict(rec_features, current_delay)
        
        running_delay = current_delay
        running_time = now
        
        # Check active section congestion
        current_section = db.query(RouteSection).filter(RouteSection.section_id == (pos.current_section_id if pos else "")).first()
        congestion_score = 0.65 if current_delay > 15.0 else 0.20
        
        step_km = train.total_distance_km / max(1, len(stn_list) - 1)
        
        for idx, stn in enumerate(stn_list):
            stn_dist = idx * step_km
            if stn_dist < covered_km and idx < len(stn_list) - 1:
                # Past station
                sched_time = (now - timedelta(minutes=int((covered_km - stn_dist) / 1.5))).strftime("%H:%M")
                pred_time = sched_time
                status = "DEPARTED"
                conf_pct = 100.0
                conf_window = f"{sched_time} - {sched_time}"
                stn_delay = 0.0
                stn_rec = 0.0
            else:
                # Upcoming station
                rem_dist = max(10.0, stn_dist - covered_km)
                
                # 22 features
                tt_features = FeatureEngineering.extract_travel_time_features(
                    distance_remaining_km=rem_dist,
                    current_speed_kmh=current_speed,
                    max_permissible_speed=130.0,
                    current_delay_min=running_delay,
                    congestion_score=congestion_score,
                    priority_level=train.priority_level,
                    weather_condition="CLEAR",
                    intermediate_halts_count=max(1, idx)
                )
                pred_travel_min = travel_time_model.predict(tt_features)
                
                # Gradual delay recovery along sections
                rec_fraction = min(1.0, rem_dist / max(50.0, train.total_distance_km - covered_km))
                accum_recovery = total_possible_recovery * rec_fraction
                running_delay = max(0.0, current_delay - accum_recovery)
                
                conf_bounds = confidence_engine.calculate_confidence_bounds(
                    predicted_travel_time_min=pred_travel_min,
                    distance_remaining_km=rem_dist,
                    congestion_score=congestion_score,
                    weather_condition="CLEAR"
                )
                
                pred_arrival_dt = now + timedelta(minutes=int(pred_travel_min))
                sched_arrival_dt = now + timedelta(minutes=int(pred_travel_min - running_delay))
                
                pred_time = pred_arrival_dt.strftime("%H:%M")
                sched_time = sched_arrival_dt.strftime("%H:%M")
                
                p10_dt = now + timedelta(minutes=int(conf_bounds["p10_minutes"]))
                p90_dt = now + timedelta(minutes=int(conf_bounds["p90_minutes"]))
                conf_window = f"{p10_dt.strftime('%H:%M')} - {p90_dt.strftime('%H:%M')}"
                
                conf_pct = conf_bounds["confidence_percentage"]
                status = "ON_TIME" if running_delay < 5.0 else "DELAYED"
                stn_delay = round(running_delay, 1)
                stn_rec = round(accum_recovery, 1)
                total_rec_min = stn_rec
                
            upcoming.append({
                "station_code": stn.code,
                "station_name": stn.name,
                "distance_from_origin_km": round(stn_dist, 1),
                "scheduled_arrival": sched_time,
                "predicted_eta": pred_time,
                "delay_minutes": stn_delay,
                "natural_recovery_minutes": stn_rec,
                "confidence_percentage": conf_pct,
                "confidence_window_p10_p90": conf_window,
                "status": status
            })

        final_stn = upcoming[-1] if upcoming else None
        
        return {
            "train_number": train.train_number,
            "train_name": train.name,
            "current_station": pos.last_halt_station if pos else "Origin",
            "next_station": pos.next_station if pos else "Destination",
            "current_delay_minutes": round(current_delay, 1),
            "total_recovered_minutes": round(total_rec_min, 1),
            "final_destination_eta": final_stn["predicted_eta"] if final_stn else "18:00",
            "final_destination_scheduled": final_stn["scheduled_arrival"] if final_stn else "18:00",
            "overall_confidence_percentage": 92.4,
            "active_weather_condition": "CLEAR",
            "upcoming_stations": upcoming
        }

    @staticmethod
    def get_prediction_explanation(db: Session, train_number: str) -> Optional[Dict[str, Any]]:
        train = db.query(Train).filter(Train.train_number == train_number).first()
        if not train:
            return None
            
        pos = db.query(TrainPosition).filter(TrainPosition.train_number == train_number).order_by(TrainPosition.timestamp.desc()).first()
        current_delay = pos.delay_minutes if pos else 12.0
        current_speed = pos.current_speed if pos else 88.0
        covered_km = pos.distance_covered_km if pos else 210.0
        rem_dist = max(30.0, train.total_distance_km - covered_km)
        
        # Section properties
        sec_name = "Katpadi-Jolarpettai Section" if "12628" in train_number else "Vadodara-Ratlam Section"
        cong_score = 0.74 if current_delay > 12.0 else 0.25
        
        features = FeatureEngineering.extract_travel_time_features(
            distance_remaining_km=rem_dist,
            current_speed_kmh=current_speed,
            max_permissible_speed=130.0,
            current_delay_min=current_delay,
            congestion_score=cong_score,
            priority_level=train.priority_level,
            weather_condition="CLEAR",
            intermediate_halts_count=4
        )
        
        base_time = (rem_dist / 110.0) * 60.0
        predicted_time = travel_time_model.predict(features)
        
        rec_features = FeatureEngineering.extract_delay_recovery_features(
            current_delay_min=current_delay,
            remaining_corridor_distance_km=rem_dist,
            total_slack_time_ahead_min=22.0,
            current_speed=current_speed,
            priority_level=train.priority_level
        )
        recovered_delay = delay_recovery_model.predict(rec_features, current_delay)
        
        return explainability_engine.explain_prediction(
            train_number=train_number,
            features=features,
            base_travel_time=base_time,
            predicted_travel_time=predicted_time,
            current_delay=current_delay,
            recovered_delay=recovered_delay,
            weather_condition="CLEAR",
            section_name=sec_name
        )

train_service = TrainService()
