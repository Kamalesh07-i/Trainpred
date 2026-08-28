from datetime import datetime
import numpy as np

class ExplainabilityEngine:
    """
    Explainable AI Engine for RAIL-CAST AI.
    Calculates SHAP-style feature attributions and generates natural-language operational explanations.
    """
    
    FEATURE_NAMES = [
        "distance_remaining_km", "current_speed_kmh", "speed_ratio_to_mps",
        "current_delay_min", "historical_avg_speed_kmh", "section_congestion_score",
        "active_upstream_trains", "train_priority_score", "time_of_day_sin",
        "time_of_day_cos", "day_of_week", "is_peak_hours",
        "gradient_penalty_factor", "weather_impact_multiplier", "scheduled_slack_time_min",
        "intermediate_halts_count", "rolling_acceleration_3min", "is_single_track_section",
        "is_junction_ahead", "recent_halt_duration_min", "historical_section_delay_p50",
        "signalling_block_density"
    ]

    def explain_prediction(
        self,
        train_number: str,
        features: np.ndarray,
        base_travel_time: float,
        predicted_travel_time: float,
        current_delay: float,
        recovered_delay: float,
        weather_condition: str,
        section_name: str = "Katpadi-Jolarpettai"
    ) -> dict:
        """
        Generates structured SHAP-style breakdown and human narrative.
        """
        # Extract key raw feature values for exact attribution calculation
        dist = features[0]
        speed = features[1]
        spd_ratio = features[2]
        delay = features[3]
        cong = features[5]
        priority = int(features[7])
        grad_factor = features[12]
        weather_mult = features[13]
        slack = features[14]
        halts = features[15]
        
        # Calculate localized attributions (delta in minutes from ideal baseline)
        cong_impact = round(float(cong * 9.5), 1)
        delay_prop_impact = round(float(max(0.0, delay - recovered_delay)), 1)
        speed_impact = round(float(max(0.0, (1.0 - spd_ratio) * 6.5)), 1) if spd_ratio < 0.85 else -round(float((spd_ratio - 1.0) * 3.0), 1)
        weather_impact = round(float((weather_mult - 1.0) * 14.0), 1)
        slack_recovery_impact = -round(float(recovered_delay), 1)
        halt_impact = round(float(halts * 1.8), 1)
        priority_benefit = -round(float((5 - priority) * 1.2), 1)
        gradient_impact = round(float((grad_factor - 1.0) * 8.0), 1)

        factors = [
            {
                "feature": "section_congestion",
                "impact_minutes": cong_impact,
                "description": f"Track congestion index ({int(cong*100)}%) in {section_name}",
                "category": "CONGESTION"
            },
            {
                "feature": "delay_propagation",
                "impact_minutes": delay_prop_impact,
                "description": f"Residual propagation from current {delay:.0f}m delay",
                "category": "CASCADE"
            },
            {
                "feature": "natural_slack_recovery",
                "impact_minutes": slack_recovery_impact,
                "description": f"AI-modeled recovery capacity across downstream buffer zones",
                "category": "RECOVERY"
            },
            {
                "feature": "weather_disruption",
                "impact_minutes": weather_impact,
                "description": f"Adverse weather condition ({weather_condition.replace('_', ' ').title()})",
                "category": "ENVIRONMENT"
            },
            {
                "feature": "speed_headroom_deficit",
                "impact_minutes": speed_impact,
                "description": f"Speed differential ({speed:.0f} km/h vs track capacity)",
                "category": "VELOCITY"
            },
            {
                "feature": "scheduled_halts_overhead",
                "impact_minutes": halt_impact,
                "description": f"Cumulative dwell time across {int(halts)} scheduled station stops",
                "category": "DWELL"
            },
            {
                "feature": "train_priority_dispatch",
                "impact_minutes": priority_benefit,
                "description": f"Dispatch priority advantage (Priority Class {priority})",
                "category": "DISPATCH"
            }
        ]

        # Filter non-zero and rank by absolute impact
        active_factors = [f for f in factors if abs(f["impact_minutes"]) > 0.3]
        active_factors.sort(key=lambda x: abs(x["impact_minutes"]), reverse=True)

        total_abs_impact = sum(abs(f["impact_minutes"]) for f in active_factors) or 1.0
        
        ranked_factors = []
        for rank, f in enumerate(active_factors, start=1):
            contrib_pct = round((abs(f["impact_minutes"]) / total_abs_impact) * 100.0, 1)
            ranked_factors.append({
                "rank": rank,
                "feature": f["feature"],
                "category": f["category"],
                "impact_minutes": f["impact_minutes"],
                "contribution_percent": contrib_pct,
                "explanation": f["description"]
            })

        # Generate synthesized natural-language summary
        top_factor = ranked_factors[0] if ranked_factors else None
        second_factor = ranked_factors[1] if len(ranked_factors) > 1 else None
        
        net_delay_change = predicted_travel_time - base_travel_time
        direction = "increased" if net_delay_change >= 0 else "reduced"
        
        summary_parts = [
            f"ETA is {direction} by {abs(net_delay_change):.0f} minutes."
        ]
        
        if top_factor:
            summary_parts.append(
                f"Primary driver is {top_factor['explanation'].lower()} ({'+' if top_factor['impact_minutes'] > 0 else ''}{top_factor['impact_minutes']} min, {top_factor['contribution_percent']}% influence)."
            )
        if second_factor:
            summary_parts.append(
                f"Secondary factor is {second_factor['explanation'].lower()} ({'+' if second_factor['impact_minutes'] > 0 else ''}{second_factor['impact_minutes']} min)."
            )
        if recovered_delay > 1.0:
            summary_parts.append(
                f"RAIL-CAST AI predicts {recovered_delay:.1f} minutes of natural slack recovery in downstream high-speed segments."
            )

        return {
            "train_number": train_number,
            "prediction_time": datetime.utcnow().isoformat() + "Z",
            "base_travel_time_minutes": round(base_travel_time, 1),
            "predicted_travel_time_minutes": round(predicted_travel_time, 1),
            "net_impact_minutes": round(net_delay_change, 1),
            "natural_recovery_minutes": round(recovered_delay, 1),
            "explanation": {
                "contributing_factors": ranked_factors,
                "summary": " ".join(summary_parts)
            }
        }

explainability_engine = ExplainabilityEngine()
