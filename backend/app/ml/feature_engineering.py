import math
from datetime import datetime
import numpy as np

class FeatureEngineering:
    """
    Feature engineering pipeline extracting the 22 Travel Time features (C1)
    and 18 Delay Recovery features (C3) according to RAIL-CAST AI specifications.
    """
    
    @staticmethod
    def extract_travel_time_features(
        distance_remaining_km: float,
        current_speed_kmh: float,
        max_permissible_speed: float,
        current_delay_min: float,
        historical_avg_speed_kmh: float = 90.0,
        congestion_score: float = 0.3,
        active_upstream_trains: int = 1,
        priority_level: int = 1,
        weather_condition: str = "CLEAR",
        gradient: str = "1 in 150",
        scheduled_slack_time_min: float = 12.0,
        intermediate_halts_count: int = 3,
        rolling_acceleration: float = 0.0,
        is_single_track: bool = False,
        is_junction_ahead: bool = True,
        recent_halt_duration_min: float = 0.0,
        historical_section_delay_p50: float = 2.5,
        signalling_density: float = 0.4,
        timestamp: datetime = None
    ) -> np.ndarray:
        if timestamp is None:
            timestamp = datetime.utcnow()
            
        # 1. distance_remaining_km
        f1 = float(distance_remaining_km)
        # 2. current_speed_kmh
        f2 = float(max(0.0, current_speed_kmh))
        # 3. speed_ratio_to_mps
        mps = max(50.0, max_permissible_speed)
        f3 = float(min(1.2, f2 / mps))
        # 4. current_delay_min
        f4 = float(current_delay_min)
        # 5. historical_avg_speed_kmh
        f5 = float(historical_avg_speed_kmh)
        # 6. section_congestion_score (0.0 to 1.0)
        f6 = float(np.clip(congestion_score, 0.0, 1.0))
        # 7. active_upstream_trains
        f7 = float(active_upstream_trains)
        # 8. train_priority_score (1 is top priority, e.g. Vande Bharat; 5 is freight)
        f8 = float(priority_level)
        
        # Temporal features
        hour = timestamp.hour + timestamp.minute / 60.0
        # 9. time_of_day_sin
        f9 = float(math.sin(2 * math.pi * hour / 24.0))
        # 10. time_of_day_cos
        f10 = float(math.cos(2 * math.pi * hour / 24.0))
        # 11. day_of_week (0-6)
        f11 = float(timestamp.weekday())
        # 12. is_peak_hours (08:00-11:00 or 17:00-21:00)
        is_peak = 1.0 if (8 <= timestamp.hour <= 11 or 17 <= timestamp.hour <= 21) else 0.0
        f12 = float(is_peak)
        
        # Physical & Environmental
        # 13. gradient_penalty_factor
        grad_penalty = 1.35 if "Ghat" in gradient or "80" in gradient else 1.05 if "100" in gradient else 1.0
        f13 = float(grad_penalty)
        # 14. weather_impact_multiplier
        weather_map = {
            "CLEAR": 1.0,
            "OVERCAST": 1.02,
            "MODERATE_RAIN": 1.12,
            "HEAVY_RAIN": 1.28,
            "THUNDERSTORM": 1.35,
            "DENSE_FOG": 1.45
        }
        f14 = float(weather_map.get(weather_condition.upper(), 1.0))
        # 15. scheduled_slack_time_min
        f15 = float(scheduled_slack_time_min)
        # 16. intermediate_halts_count
        f16 = float(intermediate_halts_count)
        # 17. rolling_acceleration_3min
        f17 = float(np.clip(rolling_acceleration, -3.0, 3.0))
        # 18. is_single_track_section
        f18 = 1.0 if is_single_track else 0.0
        # 19. is_junction_ahead
        f19 = 1.0 if is_junction_ahead else 0.0
        # 20. recent_halt_duration_min
        f20 = float(recent_halt_duration_min)
        # 21. historical_section_delay_p50
        f21 = float(historical_section_delay_p50)
        # 22. signalling_block_density
        f22 = float(np.clip(signalling_density, 0.1, 1.0))
        
        return np.array([f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22], dtype=np.float32)

    @staticmethod
    def extract_delay_recovery_features(
        current_delay_min: float,
        remaining_corridor_distance_km: float,
        total_slack_time_ahead_min: float,
        average_section_mps: float = 130.0,
        current_speed: float = 90.0,
        priority_level: int = 1,
        congestion_index: float = 0.25,
        upcoming_junction_count: int = 4,
        weather_condition: str = "CLEAR",
        historical_recovery_rate_pct: float = 65.0,
        loco_power_to_weight_ratio: float = 14.2,
        track_quality_index: float = 92.0,
        consecutive_green_signal_prob: float = 0.85,
        timestamp: datetime = None
    ) -> np.ndarray:
        if timestamp is None:
            timestamp = datetime.utcnow()
            
        # 18 Features for Delay Recovery Model (C3)
        # 1. current_delay_min
        r1 = float(max(0.0, current_delay_min))
        # 2. remaining_corridor_distance_km
        r2 = float(max(10.0, remaining_corridor_distance_km))
        # 3. total_slack_time_ahead_min
        r3 = float(max(0.0, total_slack_time_ahead_min))
        # 4. average_section_mps
        r4 = float(average_section_mps)
        # 5. speed_headroom_kmh (MPS - current_speed)
        r5 = float(max(0.0, average_section_mps - current_speed))
        # 6. train_priority_score (1=highest, 5=lowest)
        r6 = float(priority_level)
        # 7. corridor_congestion_index
        r7 = float(np.clip(congestion_index, 0.0, 1.0))
        # 8. upcoming_junction_count
        r8 = float(upcoming_junction_count)
        # 9. weather_severity_score
        weather_severity = {"CLEAR": 0.0, "MODERATE_RAIN": 0.35, "HEAVY_RAIN": 0.7, "DENSE_FOG": 0.9}
        r9 = float(weather_severity.get(weather_condition.upper(), 0.1))
        # 10. time_of_day_peak_ratio
        is_peak = 1.0 if (8 <= timestamp.hour <= 11 or 17 <= timestamp.hour <= 21) else 0.0
        r10 = float(is_peak)
        # 11. historical_recovery_rate_pct
        r11 = float(np.clip(historical_recovery_rate_pct, 10.0, 95.0))
        # 12. crew_experience_index
        r12 = 0.88
        # 13. loco_power_to_weight_ratio (hp/ton)
        r13 = float(loco_power_to_weight_ratio)
        # 14. track_quality_index (0-100)
        r14 = float(track_quality_index)
        # 15. downstream_freight_preemption_score (higher priority trains preempt freight)
        r15 = float(1.0 - (priority_level / 5.0) * 0.6)
        # 16. consecutive_green_signal_prob
        r16 = float(np.clip(consecutive_green_signal_prob, 0.2, 0.98))
        # 17. recovery_urgency_factor
        r17 = float(min(2.0, r1 / 30.0 + 0.5))
        # 18. scheduled_buffer_per_100km
        r18 = float((r3 / (r2 / 100.0)) if r2 > 0 else 2.0)
        
        return np.array([r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18], dtype=np.float32)
