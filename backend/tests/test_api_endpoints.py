from fastapi.testclient import TestClient
from app.main import app
from app.db.seed_data import init_db

# Ensure DB initialized
init_db()
client = TestClient(app)

def test_health_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["system"] == "RAIL-CAST AI"

def test_get_trains_endpoint():
    response = client.get("/api/trains")
    assert response.status_code == 200
    trains = response.json()
    assert len(trains) > 0
    assert "train_number" in trains[0]
    assert "current_speed" in trains[0]

def test_get_train_dynamic_eta():
    response = client.get("/api/train/12628/eta")
    assert response.status_code == 200
    data = response.json()
    assert data["train_number"] == "12628"
    assert "upcoming_stations" in data
    assert len(data["upcoming_stations"]) > 0
    assert "predicted_eta" in data["upcoming_stations"][0]

def test_get_train_explanation():
    response = client.get("/api/train/12628/explanation")
    assert response.status_code == 200
    data = response.json()
    assert "explanation" in data
    assert "contributing_factors" in data["explanation"]
    assert len(data["explanation"]["contributing_factors"]) > 0

def test_control_network_status():
    response = client.get("/api/control/network-status")
    assert response.status_code == 200
    data = response.json()
    assert "total_active_trains" in data
    assert "network_punctuality_rate" in data

def test_control_risk_map():
    response = client.get("/api/control/risk-map")
    assert response.status_code == 200
    data = response.json()
    assert "sections" in data
    assert len(data["sections"]) > 0

def test_simulation_run_endpoint():
    payload = {
        "scenario_name": "Heavy Monsoon Rain in Katpadi Section",
        "train_number": "12628",
        "disruption_type": "WEATHER_DISRUPTION",
        "severity": "HIGH",
        "duration_minutes": 20.0,
        "weather_type": "HEAVY_RAIN"
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scenario_id" in data
    assert "affected_stations" in data
    assert "mitigation_recommendation" in data
    assert len(data["affected_stations"]) > 0

def test_metrics_endpoint():
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert len(data["models"]) > 0
