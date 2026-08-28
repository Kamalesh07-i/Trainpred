from datetime import datetime, timedelta
from app.db.database import SessionLocal, engine, Base
from app.db.models import Train, Station, RouteSection, TrainPosition, Alert, ModelMetric, SectionPerformance

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Station).count() > 0:
        db.close()
        return
    
    print("Seeding RAIL-CAST AI database with realistic Indian Railway corridors...")
    
    # 1. Stations (Delhi - Chennai Corridor + Mumbai - Delhi Corridor + Golden Quadrilateral nodes)
    stations_data = [
        # South Corridor (SBC to NDLS via MAS / KPD / JTJ / BZA / NGP / BPL / AGC / NDLS)
        Station(code="SBC", name="KSR Bengaluru City", state="Karnataka", zone="SWR", latitude=12.9781, longitude=77.5696, platform_count=10, is_junction=True, sequence_order=1),
        Station(code="BWT", name="Bangarapet Junction", state="Karnataka", zone="SWR", latitude=12.9972, longitude=78.2045, platform_count=5, is_junction=True, sequence_order=2),
        Station(code="JTJ", name="Jolarpettai Junction", state="Tamil Nadu", zone="SR", latitude=12.5658, longitude=78.5833, platform_count=6, is_junction=True, sequence_order=3),
        Station(code="KPD", name="Katpadi Junction (Vellore)", state="Tamil Nadu", zone="SR", latitude=12.9733, longitude=79.1384, platform_count=5, is_junction=True, sequence_order=4),
        Station(code="AJJ", name="Arakkonam Junction", state="Tamil Nadu", zone="SR", latitude=13.0805, longitude=79.6672, platform_count=8, is_junction=True, sequence_order=5),
        Station(code="MAS", name="Chennai Central", state="Tamil Nadu", zone="SR", latitude=13.0827, longitude=80.2707, platform_count=15, is_junction=True, sequence_order=6),
        Station(code="GDR", name="Gudur Junction", state="Andhra Pradesh", zone="SCR", latitude=14.1463, longitude=79.8504, platform_count=4, is_junction=True, sequence_order=7),
        Station(code="BZA", name="Vijayawada Junction", state="Andhra Pradesh", zone="SCR", latitude=16.5186, longitude=80.6200, platform_count=10, is_junction=True, sequence_order=8),
        Station(code="WL", name="Warangal Junction", state="Telangana", zone="SCR", latitude=17.9689, longitude=79.5941, platform_count=4, is_junction=True, sequence_order=9),
        Station(code="BPQ", name="Balharshah Junction", state="Maharashtra", zone="CR", latitude=19.8519, longitude=79.3528, platform_count=5, is_junction=True, sequence_order=10),
        Station(code="NGP", name="Nagpur Junction", state="Maharashtra", zone="CR", latitude=21.1524, longitude=79.0888, platform_count=8, is_junction=True, sequence_order=11),
        Station(code="ET", name="Itarsi Junction", state="Madhya Pradesh", zone="WCR", latitude=22.6124, longitude=77.7644, platform_count=8, is_junction=True, sequence_order=12),
        Station(code="BPL", name="Bhopal Junction", state="Madhya Pradesh", zone="WCR", latitude=23.2599, longitude=77.4126, platform_count=6, is_junction=True, sequence_order=13),
        Station(code="VGLB", name="Varanasi/Virangana Lakshmibai (Jhansi)", state="Uttar Pradesh", zone="NCR", latitude=25.4484, longitude=78.5685, platform_count=8, is_junction=True, sequence_order=14),
        Station(code="GWL", name="Gwalior Junction", state="Madhya Pradesh", zone="NCR", latitude=26.2183, longitude=78.1828, platform_count=5, is_junction=True, sequence_order=15),
        Station(code="AGC", name="Agra Cantt", state="Uttar Pradesh", zone="NCR", latitude=27.1592, longitude=77.9944, platform_count=6, is_junction=True, sequence_order=16),
        Station(code="MTJ", name="Mathura Junction", state="Uttar Pradesh", zone="NCR", latitude=27.4924, longitude=77.6737, platform_count=10, is_junction=True, sequence_order=17),
        Station(code="NZM", name="Hazrat Nizamuddin", state="Delhi", zone="NR", latitude=28.5886, longitude=77.2534, platform_count=8, is_junction=True, sequence_order=18),
        Station(code="NDLS", name="New Delhi", state="Delhi", zone="NR", latitude=28.6431, longitude=77.2197, platform_count=16, is_junction=True, sequence_order=19),
        
        # Western Corridor (MMCT to NDLS)
        Station(code="MMCT", name="Mumbai Central", state="Maharashtra", zone="WR", latitude=18.9696, longitude=72.8193, platform_count=9, is_junction=True, sequence_order=20),
        Station(code="ST", name="Surat", state="Gujarat", zone="WR", latitude=21.2049, longitude=72.8407, platform_count=6, is_junction=False, sequence_order=21),
        Station(code="BRC", name="Vadodara Junction", state="Gujarat", zone="WR", latitude=22.3107, longitude=73.1812, platform_count=7, is_junction=True, sequence_order=22),
        Station(code="RTM", name="Ratlam Junction", state="Madhya Pradesh", zone="WR", latitude=23.3441, longitude=75.0352, platform_count=7, is_junction=True, sequence_order=23),
        Station(code="KOTA", name="Kota Junction", state="Rajasthan", zone="WCR", latitude=25.2188, longitude=75.8648, platform_count=6, is_junction=True, sequence_order=24),
        
        # Eastern Nodes
        Station(code="HWH", name="Howrah Junction (Kolkata)", state="West Bengal", zone="ER", latitude=22.5830, longitude=88.3426, platform_count=23, is_junction=True, sequence_order=25),
        Station(code="CNB", name="Kanpur Central", state="Uttar Pradesh", zone="NCR", latitude=26.4547, longitude=80.3507, platform_count=10, is_junction=True, sequence_order=26),
        Station(code="PRYJ", name="Prayagraj Junction", state="Uttar Pradesh", zone="NCR", latitude=25.4439, longitude=81.8258, platform_count=10, is_junction=True, sequence_order=27),
        Station(code="BSB", name="Varanasi Junction", state="Uttar Pradesh", zone="NR", latitude=25.3268, longitude=82.9873, platform_count=9, is_junction=True, sequence_order=28),
    ]
    db.add_all(stations_data)
    db.commit()
    
    # 2. Route Sections
    sections_data = [
        RouteSection(section_id="SEC_SBC_BWT", from_station_code="SBC", to_station_code="BWT", corridor_name="Bangalore-Chennai", distance_km=70.0, max_permissible_speed=110.0, normal_travel_time_min=55.0),
        RouteSection(section_id="SEC_BWT_JTJ", from_station_code="BWT", to_station_code="JTJ", corridor_name="Bangalore-Chennai", distance_km=74.0, max_permissible_speed=110.0, normal_travel_time_min=60.0),
        RouteSection(section_id="SEC_JTJ_KPD", from_station_code="JTJ", to_station_code="KPD", corridor_name="Chennai Main", distance_km=84.0, max_permissible_speed=130.0, normal_travel_time_min=55.0),
        RouteSection(section_id="SEC_KPD_AJJ", from_station_code="KPD", to_station_code="AJJ", corridor_name="Chennai Main", distance_km=61.0, max_permissible_speed=130.0, normal_travel_time_min=42.0),
        RouteSection(section_id="SEC_AJJ_MAS", from_station_code="AJJ", to_station_code="MAS", corridor_name="Chennai Suburban", distance_km=69.0, max_permissible_speed=110.0, normal_travel_time_min=60.0),
        RouteSection(section_id="SEC_MAS_GDR", from_station_code="MAS", to_station_code="GDR", corridor_name="Grand Trunk", distance_km=138.0, max_permissible_speed=130.0, normal_travel_time_min=90.0),
        RouteSection(section_id="SEC_GDR_BZA", from_station_code="GDR", to_station_code="BZA", corridor_name="Grand Trunk", distance_km=293.0, max_permissible_speed=130.0, normal_travel_time_min=180.0),
        RouteSection(section_id="SEC_BZA_WL", from_station_code="BZA", to_station_code="WL", corridor_name="Grand Trunk", distance_km=207.0, max_permissible_speed=130.0, normal_travel_time_min=135.0),
        RouteSection(section_id="SEC_WL_BPQ", from_station_code="WL", to_station_code="BPQ", corridor_name="Grand Trunk", distance_km=243.0, max_permissible_speed=130.0, normal_travel_time_min=150.0),
        RouteSection(section_id="SEC_BPQ_NGP", from_station_code="BPQ", to_station_code="NGP", corridor_name="Grand Trunk", distance_km=208.0, max_permissible_speed=130.0, normal_travel_time_min=140.0),
        RouteSection(section_id="SEC_NGP_ET", from_station_code="NGP", to_station_code="ET", corridor_name="Satpura Ghat Section", distance_km=298.0, max_permissible_speed=110.0, gradient="1 in 80 Ghat", normal_travel_time_min=240.0),
        RouteSection(section_id="SEC_ET_BPL", from_station_code="ET", to_station_code="BPL", corridor_name="Central Trunk", distance_km=92.0, max_permissible_speed=130.0, normal_travel_time_min=65.0),
        RouteSection(section_id="SEC_BPL_VGLB", from_station_code="BPL", to_station_code="VGLB", corridor_name="Central Trunk", distance_km=292.0, max_permissible_speed=130.0, normal_travel_time_min=180.0),
        RouteSection(section_id="SEC_VGLB_GWL", from_station_code="VGLB", to_station_code="GWL", corridor_name="High Speed Corridor", distance_km=97.0, max_permissible_speed=130.0, normal_travel_time_min=55.0),
        RouteSection(section_id="SEC_GWL_AGC", from_station_code="GWL", to_station_code="AGC", corridor_name="High Speed Corridor", distance_km=119.0, max_permissible_speed=130.0, normal_travel_time_min=70.0),
        RouteSection(section_id="SEC_AGC_MTJ", from_station_code="AGC", to_station_code="MTJ", corridor_name="High Speed Corridor", distance_km=54.0, max_permissible_speed=160.0, normal_travel_time_min=30.0),
        RouteSection(section_id="SEC_MTJ_NZM", from_station_code="MTJ", to_station_code="NZM", corridor_name="Delhi Access Corridor", distance_km=134.0, max_permissible_speed=140.0, normal_travel_time_min=80.0),
        RouteSection(section_id="SEC_NZM_NDLS", from_station_code="NZM", to_station_code="NDLS", corridor_name="Delhi Terminal", distance_km=7.0, max_permissible_speed=60.0, normal_travel_time_min=15.0),
        
        # Western Corridor Sections
        RouteSection(section_id="SEC_MMCT_ST", from_station_code="MMCT", to_station_code="ST", corridor_name="Western Trunk", distance_km=263.0, max_permissible_speed=130.0, normal_travel_time_min=170.0),
        RouteSection(section_id="SEC_ST_BRC", from_station_code="ST", to_station_code="BRC", corridor_name="Western Trunk", distance_km=129.0, max_permissible_speed=130.0, normal_travel_time_min=75.0),
        RouteSection(section_id="SEC_BRC_RTM", from_station_code="BRC", to_station_code="RTM", corridor_name="Western Trunk", distance_km=260.0, max_permissible_speed=130.0, normal_travel_time_min=160.0),
        RouteSection(section_id="SEC_RTM_KOTA", from_station_code="RTM", to_station_code="KOTA", corridor_name="Western High Speed", distance_km=266.0, max_permissible_speed=140.0, normal_travel_time_min=150.0),
        RouteSection(section_id="SEC_KOTA_MTJ", from_station_code="KOTA", to_station_code="MTJ", corridor_name="Western High Speed", distance_km=324.0, max_permissible_speed=140.0, normal_travel_time_min=190.0),
        
        # Eastern Trunk Sections
        RouteSection(section_id="SEC_NDLS_CNB", from_station_code="NDLS", to_station_code="CNB", corridor_name="Northern Trunk", distance_km=440.0, max_permissible_speed=130.0, normal_travel_time_min=270.0),
        RouteSection(section_id="SEC_CNB_PRYJ", from_station_code="CNB", to_station_code="PRYJ", corridor_name="Northern Trunk", distance_km=194.0, max_permissible_speed=130.0, normal_travel_time_min=120.0),
        RouteSection(section_id="SEC_PRYJ_BSB", from_station_code="PRYJ", to_station_code="BSB", corridor_name="Varanasi Link", distance_km=125.0, max_permissible_speed=110.0, normal_travel_time_min=100.0),
    ]
    db.add_all(sections_data)
    db.commit()
    
    # 3. Active Trains
    trains_data = [
        Train(
            train_number="12628",
            name="Karnataka Express",
            train_type="Superfast Express",
            origin_station="NDLS",
            destination_station="SBC",
            priority_level=2,
            total_distance_km=2400.0,
            scheduled_departure="20:20",
            scheduled_arrival="12:00 +2d",
            is_active=True
        ),
        Train(
            train_number="12951",
            name="Mumbai Tejas Rajdhani Express",
            train_type="Rajdhani",
            origin_station="MMCT",
            destination_station="NDLS",
            priority_level=1,
            total_distance_km=1386.0,
            scheduled_departure="17:00",
            scheduled_arrival="08:32 +1d",
            is_active=True
        ),
        Train(
            train_number="22436",
            name="Vande Bharat Express",
            train_type="Vande Bharat",
            origin_station="NDLS",
            destination_station="BSB",
            priority_level=1,
            total_distance_km=759.0,
            scheduled_departure="06:00",
            scheduled_arrival="14:00",
            is_active=True
        ),
        Train(
            train_number="12002",
            name="Bhopal Shatabdi Express",
            train_type="Shatabdi",
            origin_station="NDLS",
            destination_station="BPL",
            priority_level=1,
            total_distance_km=707.0,
            scheduled_departure="06:00",
            scheduled_arrival="14:40",
            is_active=True
        ),
        Train(
            train_number="12622",
            name="Tamil Nadu Express",
            train_type="Superfast Express",
            origin_station="NDLS",
            destination_station="MAS",
            priority_level=2,
            total_distance_km=2182.0,
            scheduled_departure="21:05",
            scheduled_arrival="06:15 +2d",
            is_active=True
        ),
        Train(
            train_number="90214",
            name="CONCOR Container Freight",
            train_type="Freight Express",
            origin_station="TKD",
            destination_station="JNPT",
            priority_level=5,
            total_distance_km=1420.0,
            scheduled_departure="04:30",
            scheduled_arrival="18:00 +1d",
            is_active=True
        ),
    ]
    db.add_all(trains_data)
    db.commit()
    
    # 4. Initial Train Positions & Telemetry
    initial_positions = [
        TrainPosition(
            train_number="12628",
            latitude=12.9733,
            longitude=79.1384,
            current_speed=88.5,
            current_section_id="SEC_JTJ_KPD",
            distance_covered_km=218.0,
            delay_minutes=18.0,
            status="DELAYED",
            last_halt_station="JTJ",
            next_station="KPD",
            eta_next_station="14:48"
        ),
        TrainPosition(
            train_number="12951",
            latitude=23.3441,
            longitude=75.0352,
            current_speed=124.0,
            current_section_id="SEC_BRC_RTM",
            distance_covered_km=652.0,
            delay_minutes=3.0,
            status="ON_TIME",
            last_halt_station="BRC",
            next_station="RTM",
            eta_next_station="16:15"
        ),
        TrainPosition(
            train_number="22436",
            latitude=26.4547,
            longitude=80.3507,
            current_speed=131.0,
            current_section_id="SEC_NDLS_CNB",
            distance_covered_km=440.0,
            delay_minutes=0.0,
            status="ON_TIME",
            last_halt_station="CNB",
            next_station="PRYJ",
            eta_next_station="12:05"
        ),
        TrainPosition(
            train_number="12002",
            latitude=26.2183,
            longitude=78.1828,
            current_speed=118.0,
            current_section_id="SEC_GWL_AGC",
            distance_covered_km=315.0,
            delay_minutes=7.0,
            status="DELAYED",
            last_halt_station="GWL",
            next_station="AGC",
            eta_next_station="11:32"
        ),
        TrainPosition(
            train_number="12622",
            latitude=21.1524,
            longitude=79.0888,
            current_speed=95.0,
            current_section_id="SEC_BPQ_NGP",
            distance_covered_km=1090.0,
            delay_minutes=24.0,
            status="CRITICAL_DELAY",
            last_halt_station="BPQ",
            next_station="NGP",
            eta_next_station="15:10"
        ),
        TrainPosition(
            train_number="90214",
            latitude=25.2188,
            longitude=75.8648,
            current_speed=62.0,
            current_section_id="SEC_RTM_KOTA",
            distance_covered_km=780.0,
            delay_minutes=45.0,
            status="DELAYED",
            last_halt_station="KOTA",
            next_station="MTJ",
            eta_next_station="20:30"
        ),
    ]
    db.add_all(initial_positions)
    db.commit()
    
    # 5. Section Performances
    for sec in sections_data[:8]:
        sp = SectionPerformance(
            section_id=sec.section_id,
            active_train_count=2 if "KPD" in sec.section_id else 1,
            average_speed=82.0 if "KPD" in sec.section_id else 115.0,
            congestion_score=0.72 if "KPD" in sec.section_id else 0.22,
            bottleneck_risk_level="HIGH" if "KPD" in sec.section_id else "LOW",
            delay_absorption_capacity_min=6.5
        )
        db.add(sp)
    db.commit()
    
    # 6. Initial Active Alerts
    alerts_data = [
        Alert(
            alert_id="ALT-2026-0828-01",
            train_number="12628",
            section_id="SEC_JTJ_KPD",
            alert_type="CONGESTION",
            severity="HIGH",
            title="High Sectional Congestion Detected",
            message="Traffic density index in Katpadi-Jolarpettai is at 74% capacity due to upstream track maintenance near KM 142.",
            recommendation="AI recommends dynamic speed regulation to 75 km/h to prevent hard brake stalls and optimize recovery buffer.",
            is_active=True
        ),
        Alert(
            alert_id="ALT-2026-0828-02",
            train_number="12622",
            section_id="SEC_BPQ_NGP",
            alert_type="ANOMALY",
            severity="MEDIUM",
            title="Sudden Unscheduled Deceleration",
            message="Train 12622 decelerated from 110 km/h to 35 km/h over 1.2 km approaching Nagpur outer signal.",
            recommendation="Caution signal observed. Expected ETA impact is +6 min with estimated recovery of 3.5 min in next section.",
            is_active=True
        ),
    ]
    db.add_all(alerts_data)
    
    # 7. Model Performance Metrics
    metrics_data = [
        ModelMetric(
            model_name="Travel Time Predictor (C1 - XGBoost)",
            version="2.0.0",
            mae=2.64,
            rmse=4.12,
            r2=0.914,
            ece_score=0.034,
            inference_time_ms=12.8
        ),
        ModelMetric(
            model_name="Delay Recovery Engine (C3 - GradientBoosting)",
            version="2.0.0",
            mae=1.82,
            rmse=2.95,
            r2=0.887,
            ece_score=0.029,
            inference_time_ms=9.4
        ),
        ModelMetric(
            model_name="Ensemble Anomaly Detector (C4 - IsoForest+Z)",
            version="2.0.0",
            mae=0.0,
            rmse=0.0,
            r2=0.965, # F1 score representation
            ece_score=0.015,
            inference_time_ms=5.2
        )
    ]
    db.add_all(metrics_data)
    db.commit()
    db.close()
    print("Database successfully seeded with realistic Indian Railways networks!")
