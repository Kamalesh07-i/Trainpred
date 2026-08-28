import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_latencies():
    # 1. Benchmark GET /api/train/12628/eta (<150ms)
    times_eta = []
    for _ in range(5):
        t0 = time.perf_counter()
        resp = client.get("/api/train/12628/eta")
        t1 = time.perf_counter()
        assert resp.status_code == 200
        times_eta.append((t1 - t0) * 1000.0)
    avg_eta_ms = sum(times_eta) / len(times_eta)
    print(f"\nAverage GET /api/train/12628/eta latency: {avg_eta_ms:.2f} ms")
    assert avg_eta_ms < 150.0

    # 2. Benchmark GET /api/train/12628/explanation (<300ms)
    times_explain = []
    for _ in range(5):
        t0 = time.perf_counter()
        resp = client.get("/api/train/12628/explanation")
        t1 = time.perf_counter()
        assert resp.status_code == 200
        times_explain.append((t1 - t0) * 1000.0)
    avg_explain_ms = sum(times_explain) / len(times_explain)
    print(f"Average GET /api/train/12628/explanation latency: {avg_explain_ms:.2f} ms")
    assert avg_explain_ms < 300.0

    # 3. Benchmark POST /api/simulation/run (<500ms)
    payload = {
        "scenario_name": "Temporary Speed Restriction 30 km/h",
        "train_number": "12628",
        "disruption_type": "SPEED_RESTRICTION",
        "severity": "HIGH",
        "duration_minutes": 15.0,
        "speed_limit_kmh": 30.0
    }
    times_sim = []
    for _ in range(5):
        t0 = time.perf_counter()
        resp = client.post("/api/simulation/run", json=payload)
        t1 = time.perf_counter()
        assert resp.status_code == 200
        times_sim.append((t1 - t0) * 1000.0)
    avg_sim_ms = sum(times_sim) / len(times_sim)
    print(f"Average POST /api/simulation/run latency: {avg_sim_ms:.2f} ms")
    assert avg_sim_ms < 500.0
