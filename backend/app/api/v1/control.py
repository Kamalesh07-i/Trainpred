from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Train, RouteSection, TrainPosition, Alert, SectionPerformance
from app.schemas.pydantic_models import NetworkStatusResponse, AlertSchema

router = APIRouter()

@router.get("/control/network-status", response_model=NetworkStatusResponse)
def get_network_status(db: Session = Depends(get_db)):
    """
    Returns global operational control room overview and network health indicators.
    """
    trains = db.query(Train).filter(Train.is_active == True).all()
    positions = db.query(TrainPosition).all()
    
    total = len(trains)
    on_time = 0
    delayed = 0
    critical = 0
    speeds = []
    
    for t in trains:
        latest = [p for p in positions if p.train_number == t.train_number]
        if latest:
            latest.sort(key=lambda x: x.timestamp, reverse=True)
            p = latest[0]
            speeds.append(p.current_speed)
            if p.delay_minutes < 5.0:
                on_time += 1
            elif p.delay_minutes < 20.0:
                delayed += 1
            else:
                critical += 1
        else:
            on_time += 1

    active_alerts = db.query(Alert).filter(Alert.is_active == True).count()
    punctuality = (on_time / max(1, total)) * 100.0
    avg_speed = sum(speeds) / max(1, len(speeds)) if speeds else 88.0
    
    return NetworkStatusResponse(
        total_active_trains=total,
        on_time_trains=on_time,
        delayed_trains=delayed,
        critical_delayed_trains=critical,
        network_punctuality_rate=round(punctuality, 1),
        active_alerts_count=active_alerts,
        avg_network_speed_kmh=round(avg_speed, 1),
        highest_congestion_section="SEC_JTJ_KPD (Katpadi-Jolarpettai)",
        system_health="OPTIMAL" if punctuality >= 80.0 else "ELEVATED_RISK" if punctuality >= 60.0 else "CONGESTED"
    )

@router.get("/control/risk-map")
def get_corridor_risk_map(db: Session = Depends(get_db)):
    """
    Returns corridor topology nodes and sections with real-time congestion scores and bottleneck risk levels.
    """
    sections = db.query(RouteSection).all()
    section_perfs = db.query(SectionPerformance).all()
    perf_map = {sp.section_id: sp for sp in section_perfs}
    
    result_sections = []
    for s in sections:
        sp = perf_map.get(s.section_id)
        cong = sp.congestion_score if sp else 0.25
        risk = sp.bottleneck_risk_level if sp else "LOW"
        train_count = sp.active_train_count if sp else 1
        
        result_sections.append({
            "section_id": s.section_id,
            "corridor_name": s.corridor_name,
            "from_station": s.from_station_code,
            "to_station": s.to_station_code,
            "distance_km": s.distance_km,
            "max_speed_kmh": s.max_permissible_speed,
            "congestion_score": round(cong, 2),
            "risk_level": risk,
            "active_trains": train_count,
            "signalling": s.signalling_type
        })
        
    return {
        "corridors": ["Grand Trunk Corridor", "Western High-Speed Trunk", "Northern Trunk"],
        "sections": result_sections,
        "summary": {
            "critical_sections_count": sum(1 for s in result_sections if s["risk_level"] in ["HIGH", "SEVERE"]),
            "average_network_congestion": round(sum(s["congestion_score"] for s in result_sections) / max(1, len(result_sections)), 2)
        }
    }

@router.get("/control/alerts", response_model=List[AlertSchema])
def get_active_alerts(db: Session = Depends(get_db)):
    """
    Returns list of active system alerts and anomalies.
    """
    return db.query(Alert).filter(Alert.is_active == True).order_by(Alert.created_at.desc()).all()

@router.post("/control/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, db: Session = Depends(get_db)):
    """
    Resolves an active alert with dispatcher timestamp.
    """
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found.")
    alert.is_active = False
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"status": "SUCCESS", "message": f"Alert {alert_id} marked as resolved."}
