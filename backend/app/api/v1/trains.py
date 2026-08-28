from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.pydantic_models import (
    TrainSummarySchema, TrainETAResponse, ExplanationResponse
)
from app.services.train_service import train_service
from app.services.live_simulator import live_simulator

router = APIRouter()

@router.get("/trains", response_model=List[TrainSummarySchema])
def get_all_trains(
    status: Optional[str] = Query(None, description="Filter by status (ON_TIME, DELAYED, CRITICAL_DELAY)"),
    priority: Optional[int] = Query(None, description="Filter by priority class (1 to 5)"),
    db: Session = Depends(get_db)
):
    """
    Returns list of all active trains with current speed, delay, position and risk score.
    """
    trains = train_service.get_all_active_trains(db)
    if status:
        trains = [t for t in trains if t["status"].upper() == status.upper()]
    if priority:
        trains = [t for t in trains if t["priority_level"] == priority]
    return trains

@router.get("/train/{train_number}")
def get_train_by_id(train_number: str, db: Session = Depends(get_db)):
    """
    Returns full train profile, schedule, and current live status.
    """
    details = train_service.get_train_details(db, train_number)
    if not details:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found.")
    return details

@router.get("/train/{train_number}/eta", response_model=TrainETAResponse)
def get_train_dynamic_eta(train_number: str, db: Session = Depends(get_db)):
    """
    Returns dynamic ML ETA predictions, delay recovery breakdown, and confidence intervals for all upcoming stations.
    """
    eta_data = train_service.calculate_dynamic_eta(db, train_number)
    if not eta_data:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found.")
    return eta_data

@router.get("/train/{train_number}/explanation", response_model=ExplanationResponse)
def get_train_prediction_explanation(train_number: str, db: Session = Depends(get_db)):
    """
    Returns SHAP-style feature attribution breakdown and plain-language summary for why ETA changed.
    """
    explanation = train_service.get_prediction_explanation(db, train_number)
    if not explanation:
        raise HTTPException(status_code=404, detail=f"Train {train_number} not found.")
    return explanation

@router.post("/train/{train_number}/inject-anomaly")
def inject_anomaly_into_train(
    train_number: str,
    anomaly_type: str = Query("EMERGENCY_HALT", description="EMERGENCY_HALT, SPEED_RESTRICTION, WEATHER_RAIN"),
    duration_sec: int = Query(60, description="Disruption duration in seconds")
):
    """
    Simulator test hook: injects a disruption to observe real-time AI detection and ETA re-calculation.
    """
    live_simulator.inject_disruption(train_number, anomaly_type, duration_sec)
    return {
        "status": "SUCCESS",
        "message": f"Injected {anomaly_type} for train {train_number} ({duration_sec}s)."
    }

@router.post("/train/{train_number}/clear-anomaly")
def clear_train_anomalies(train_number: str):
    """
    Clears all active simulated anomalies for a train.
    """
    live_simulator.simulated_disruptions.pop(train_number, None)
    return {
        "status": "SUCCESS",
        "message": f"Cleared all anomalies for train {train_number}."
    }
