from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import SimulationResult
from app.schemas.pydantic_models import WhatIfRequest, WhatIfResponse
from app.services.simulation_service import simulation_service

router = APIRouter()

@router.post("/simulation/run", response_model=WhatIfResponse)
def run_simulation(request: WhatIfRequest, db: Session = Depends(get_db)):
    """
    Executes a high-speed What-If simulation for track closures, speed restrictions, weather disruptions, or halts.
    """
    try:
        result = simulation_service.run_what_if_scenario(db, request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@router.get("/simulation/history")
def get_simulation_history(db: Session = Depends(get_db)):
    """
    Returns recent what-if simulation records.
    """
    results = db.query(SimulationResult).order_by(SimulationResult.created_at.desc()).limit(15).all()
    return results
