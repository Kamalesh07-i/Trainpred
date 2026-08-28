import asyncio
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Train, Station, RouteSection, TrainPosition, Alert
from app.ml.anomaly_detector import anomaly_detector
from app.api.v1.websocket import manager

# Detailed waypoints for corridor paths
CORRIDORS_WAYPOINTS = {
    "12628": [ # Karnataka Exp (SBC -> NDLS)
        {"code": "SBC", "lat": 12.9781, "lon": 77.5696, "dist": 0.0},
        {"code": "BWT", "lat": 12.9972, "lon": 78.2045, "dist": 70.0},
        {"code": "JTJ", "lat": 12.5658, "lon": 78.5833, "dist": 144.0},
        {"code": "KPD", "lat": 12.9733, "lon": 79.1384, "dist": 228.0},
        {"code": "AJJ", "lat": 13.0805, "lon": 79.6672, "dist": 289.0},
        {"code": "MAS", "lat": 13.0827, "lon": 80.2707, "dist": 358.0},
        {"code": "GDR", "lat": 14.1463, "lon": 79.8504, "dist": 496.0},
        {"code": "BZA", "lat": 16.5186, "lon": 80.6200, "dist": 789.0},
        {"code": "WL", "lat": 17.9689, "lon": 79.5941, "dist": 996.0},
        {"code": "BPQ", "lat": 19.8519, "lon": 79.3528, "dist": 1239.0},
        {"code": "NGP", "lat": 21.1524, "lon": 79.0888, "dist": 1447.0},
        {"code": "ET", "lat": 22.6124, "lon": 77.7644, "dist": 1745.0},
        {"code": "BPL", "lat": 23.2599, "lon": 77.4126, "dist": 1837.0},
        {"code": "VGLB", "lat": 25.4484, "lon": 78.5685, "dist": 2129.0},
        {"code": "GWL", "lat": 26.2183, "lon": 78.1828, "dist": 2226.0},
        {"code": "AGC", "lat": 27.1592, "lon": 77.9944, "dist": 2345.0},
        {"code": "MTJ", "lat": 27.4924, "lon": 77.6737, "dist": 2399.0},
        {"code": "NZM", "lat": 28.5886, "lon": 77.2534, "dist": 2533.0},
        {"code": "NDLS", "lat": 28.6431, "lon": 77.2197, "dist": 2540.0},
    ],
    "12951": [ # Mumbai Rajdhani (MMCT -> NDLS)
        {"code": "MMCT", "lat": 18.9696, "lon": 72.8193, "dist": 0.0},
        {"code": "ST", "lat": 21.2049, "lon": 72.8407, "dist": 263.0},
        {"code": "BRC", "lat": 22.3107, "lon": 73.1812, "dist": 392.0},
        {"code": "RTM", "lat": 23.3441, "lon": 75.0352, "dist": 652.0},
        {"code": "KOTA", "lat": 25.2188, "lon": 75.8648, "dist": 918.0},
        {"code": "MTJ", "lat": 27.4924, "lon": 77.6737, "dist": 1242.0},
        {"code": "NZM", "lat": 28.5886, "lon": 77.2534, "dist": 1376.0},
        {"code": "NDLS", "lat": 28.6431, "lon": 77.2197, "dist": 1386.0},
    ],
    "22436": [ # Vande Bharat (NDLS -> BSB)
        {"code": "NDLS", "lat": 28.6431, "lon": 77.2197, "dist": 0.0},
        {"code": "CNB", "lat": 26.4547, "lon": 80.3507, "dist": 440.0},
        {"code": "PRYJ", "lat": 25.4439, "lon": 81.8258, "dist": 634.0},
        {"code": "BSB", "lat": 25.3268, "lon": 82.9873, "dist": 759.0},
    ],
    "12002": [ # Bhopal Shatabdi (NDLS -> BPL)
        {"code": "NDLS", "lat": 28.6431, "lon": 77.2197, "dist": 0.0},
        {"code": "MTJ", "lat": 27.4924, "lon": 77.6737, "dist": 141.0},
        {"code": "AGC", "lat": 27.1592, "lon": 77.9944, "dist": 195.0},
        {"code": "GWL", "lat": 26.2183, "lon": 78.1828, "dist": 314.0},
        {"code": "VGLB", "lat": 25.4484, "lon": 78.5685, "dist": 411.0},
        {"code": "BPL", "lat": 23.2599, "lon": 77.4126, "dist": 707.0},
    ],
    "12622": [ # Tamil Nadu Exp (NDLS -> MAS)
        {"code": "NDLS", "lat": 28.6431, "lon": 77.2197, "dist": 0.0},
        {"code": "AGC", "lat": 27.1592, "lon": 77.9944, "dist": 195.0},
        {"code": "GWL", "lat": 26.2183, "lon": 78.1828, "dist": 314.0},
        {"code": "VGLB", "lat": 25.4484, "lon": 78.5685, "dist": 411.0},
        {"code": "BPL", "lat": 23.2599, "lon": 77.4126, "dist": 707.0},
        {"code": "ET", "lat": 22.6124, "lon": 77.7644, "dist": 799.0},
        {"code": "NGP", "lat": 21.1524, "lon": 79.0888, "dist": 1097.0},
        {"code": "BPQ", "lat": 19.8519, "lon": 79.3528, "dist": 1305.0},
        {"code": "WL", "lat": 17.9689, "lon": 79.5941, "dist": 1548.0},
        {"code": "BZA", "lat": 16.5186, "lon": 80.6200, "dist": 1755.0},
        {"code": "MAS", "lat": 13.0827, "lon": 80.2707, "dist": 2182.0},
    ],
    "90214": [ # Freight
        {"code": "TKD", "lat": 28.5085, "lon": 77.2885, "dist": 0.0},
        {"code": "MTJ", "lat": 27.4924, "lon": 77.6737, "dist": 140.0},
        {"code": "KOTA", "lat": 25.2188, "lon": 75.8648, "dist": 464.0},
        {"code": "RTM", "lat": 23.3441, "lon": 75.0352, "dist": 730.0},
        {"code": "BRC", "lat": 22.3107, "lon": 73.1812, "dist": 990.0},
        {"code": "JNPT", "lat": 18.9500, "lon": 72.9500, "dist": 1420.0},
    ]
}

class LiveSimulator:
    def __init__(self):
        self.is_running = False
        self.simulated_disruptions = {} # train_number -> {type, duration_sec}
        
    async def start(self):
        self.is_running = True
        print("RAIL-CAST AI Live Real-Time Telemetry Simulator started.")
        while self.is_running:
            try:
                await self._step_simulation()
            except Exception as e:
                print(f"Simulation step error: {e}")
            await asyncio.sleep(3.0)

    def stop(self):
        self.is_running = False

    def inject_disruption(self, train_number: str, disruption_type: str, duration_sec: int = 60):
        self.simulated_disruptions[train_number] = {
            "type": disruption_type,
            "ends_at": datetime.utcnow() + timedelta(seconds=duration_sec)
        }

    def clear_disruptions(self):
        self.simulated_disruptions.clear()

    async def _step_simulation(self):
        db: Session = SessionLocal()
        try:
            trains = db.query(Train).filter(Train.is_active == True).all()
            now = datetime.utcnow()
            telemetry_payload = []
            
            for train in trains:
                num = train.train_number
                waypoints = CORRIDORS_WAYPOINTS.get(num, CORRIDORS_WAYPOINTS["12628"])
                total_dist = waypoints[-1]["dist"]
                
                pos = db.query(TrainPosition).filter(TrainPosition.train_number == num).order_by(TrainPosition.timestamp.desc()).first()
                if not pos:
                    continue
                
                curr_dist = pos.distance_covered_km
                prev_speed = pos.current_speed
                prev_delay = pos.delay_minutes
                
                # Check injected disruptions
                active_disruption = self.simulated_disruptions.get(num)
                if active_disruption and now > active_disruption["ends_at"]:
                    active_disruption = None
                    self.simulated_disruptions.pop(num, None)
                    
                # Speed & movement dynamics
                if active_disruption:
                    dtype = active_disruption["type"]
                    if dtype == "EMERGENCY_HALT":
                        speed = 0.0
                        delay = prev_delay + 0.1
                        status = "STOPPED"
                    elif dtype == "SPEED_RESTRICTION":
                        speed = 30.0 + random.uniform(-2, 2)
                        delay = prev_delay + 0.05
                        status = "DELAYED"
                    elif dtype == "WEATHER_RAIN":
                        speed = 65.0 + random.uniform(-4, 4)
                        delay = prev_delay + 0.03
                        status = "DELAYED"
                    else:
                        speed = 45.0
                        delay = prev_delay + 0.05
                        status = "DELAYED"
                else:
                    # Normal high-speed progression (110 - 130 km/h)
                    target_speed = 125.0 if train.priority_level == 1 else 95.0 if train.priority_level == 2 else 65.0
                    speed = target_speed + random.uniform(-5.0, 5.0)
                    
                    # Small natural delay recovery if delayed and on high-speed track
                    if prev_delay > 2.0:
                        delay = max(0.0, prev_delay - 0.02)
                    else:
                        delay = prev_delay
                        
                    status = "ON_TIME" if delay < 5.0 else "DELAYED" if delay < 20.0 else "CRITICAL_DELAY"

                # Advance train distance: speed (km/h) * (3 sec / 3600 sec)
                step_km = (speed / 3600.0) * 3.0
                new_dist = curr_dist + step_km
                if new_dist >= total_dist:
                    new_dist = 10.0 # loop route for continuous demo
                    
                # Find current segment between waypoints
                prev_wp = waypoints[0]
                next_wp = waypoints[1]
                for i in range(len(waypoints) - 1):
                    if waypoints[i]["dist"] <= new_dist <= waypoints[i+1]["dist"]:
                        prev_wp = waypoints[i]
                        next_wp = waypoints[i+1]
                        break
                        
                seg_dist = max(1.0, next_wp["dist"] - prev_wp["dist"])
                frac = (new_dist - prev_wp["dist"]) / seg_dist
                frac = min(1.0, max(0.0, frac))
                
                # Interpolate GPS coordinates
                curr_lat = prev_wp["lat"] + frac * (next_wp["lat"] - prev_wp["lat"])
                curr_lon = prev_wp["lon"] + frac * (next_wp["lon"] - prev_wp["lon"])
                
                # Estimate next station ETA
                dist_to_next = max(1.0, next_wp["dist"] - new_dist)
                run_min = (dist_to_next / max(30.0, speed)) * 60.0 + delay
                eta_next_dt = now + timedelta(minutes=int(run_min))
                eta_next_str = eta_next_dt.strftime("%H:%M")
                
                # Update position record
                pos.latitude = round(curr_lat, 5)
                pos.longitude = round(curr_lon, 5)
                pos.current_speed = round(speed, 1)
                pos.distance_covered_km = round(new_dist, 1)
                pos.delay_minutes = round(delay, 1)
                pos.status = status
                pos.last_halt_station = prev_wp["code"]
                pos.next_station = next_wp["code"]
                pos.eta_next_station = eta_next_str
                pos.timestamp = now
                
                # Anomaly Evaluation (C4)
                anom_res = anomaly_detector.evaluate_telemetry(
                    current_speed=speed,
                    previous_speed=prev_speed,
                    is_at_station=(frac < 0.05 or frac > 0.95),
                    dwell_time_min=0.0,
                    scheduled_dwell_min=3.0,
                    max_permissible_speed=130.0
                )
                
                if anom_res["is_anomaly"] and anom_res["severity"] in ["HIGH", "CRITICAL"]:
                    # Create or update alert in DB
                    existing = db.query(Alert).filter(Alert.train_number == num, Alert.is_active == True).first()
                    if not existing:
                        alt = Alert(
                            alert_id=f"ALT-{num}-{int(now.timestamp())}",
                            train_number=num,
                            section_id=pos.current_section_id,
                            alert_type=anom_res["type"],
                            severity=anom_res["severity"],
                            title=f"Anomaly: {anom_res['type'].replace('_', ' ').title()}",
                            message=anom_res["description"],
                            recommendation=anom_res["action"],
                            is_active=True
                        )
                        db.add(alt)
                        # Broadcast alert over WebSocket
                        await manager.broadcast_alert({
                            "type": "NEW_ALERT",
                            "alert_id": alt.alert_id,
                            "train_number": num,
                            "severity": alt.severity,
                            "title": alt.title,
                            "message": alt.message,
                            "timestamp": now.isoformat() + "Z"
                        })
                
                telemetry_payload.append({
                    "train_number": num,
                    "name": train.name,
                    "train_type": train.train_type,
                    "latitude": round(curr_lat, 5),
                    "longitude": round(curr_lon, 5),
                    "speed": round(speed, 1),
                    "delay": round(delay, 1),
                    "status": status,
                    "last_station": prev_wp["code"],
                    "next_station": next_wp["code"],
                    "eta_next": eta_next_str,
                    "distance_covered": round(new_dist, 1),
                    "total_distance": round(total_dist, 1),
                    "timestamp": now.isoformat() + "Z"
                })

            db.commit()
            
            # Broadcast live telemetry over WebSocket
            if telemetry_payload:
                await manager.broadcast_telemetry({
                    "type": "TELEMETRY_UPDATE",
                    "trains": telemetry_payload,
                    "timestamp": now.isoformat() + "Z"
                })
                
        finally:
            db.close()

live_simulator = LiveSimulator()
