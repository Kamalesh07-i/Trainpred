from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import ModelMetric, SectionPerformance

router = APIRouter()

@router.get("/metrics")
def get_model_metrics(db: Session = Depends(get_db)):
    """
    Returns AI/ML model benchmark metrics (MAE, RMSE, R2, ECE, latency).
    """
    metrics = db.query(ModelMetric).order_by(ModelMetric.evaluated_at.desc()).all()
    return {
        "models": [
            {
                "model_name": m.model_name,
                "version": m.version,
                "mae_minutes": m.mae,
                "rmse_minutes": m.rmse,
                "r2_score": m.r2,
                "ece_calibration_score": m.ece_score,
                "inference_latency_ms": m.inference_time_ms,
                "status": "HEALTHY_OPTIMAL"
            } for m in metrics
        ],
        "system_targets": {
            "travel_time_mae_target": "<= 4.0 min",
            "calibration_ece_target": "< 0.05",
            "p95_api_latency_target": "< 200 ms",
            "simulation_latency_target": "< 500 ms"
        }
    }

@router.get("/sections/performance")
def get_section_performance(db: Session = Depends(get_db)):
    """
    Returns real-time and historical performance stats for route sections.
    """
    perfs = db.query(SectionPerformance).all()
    return [
        {
            "section_id": p.section_id,
            "active_train_count": p.active_train_count,
            "average_speed_kmh": p.average_speed,
            "congestion_score": p.congestion_score,
            "bottleneck_risk": p.bottleneck_risk_level,
            "slack_absorption_capacity_min": p.delay_absorption_capacity_min
        } for p in perfs
    ]
