import numpy as np

class ConfidenceEngine:
    """
    C5 & C6: Confidence Quantification and Calibrated Bounds.
    Calculates Quantile Prediction Bounds (P10, P50, P90) and Calibrated Confidence Scores.
    Target Metric: Expected Calibration Error (ECE) < 0.05.
    """
    def calibrate_score(self, raw_score: float) -> float:
        """Calibrated monotonic mapping"""
        calibrated = 0.50 + 0.48 * ((raw_score - 0.40) / 0.58)
        return float(np.clip(calibrated, 0.50, 0.98))

    def calculate_confidence_bounds(
        self,
        predicted_travel_time_min: float,
        distance_remaining_km: float,
        congestion_score: float,
        weather_condition: str,
        active_anomalies_count: int = 0
    ) -> dict:
        dist_factor = np.sqrt(max(10.0, distance_remaining_km)) / 12.0
        
        weather_unc = {
            "CLEAR": 1.0,
            "OVERCAST": 1.05,
            "MODERATE_RAIN": 1.25,
            "HEAVY_RAIN": 1.45,
            "THUNDERSTORM": 1.60,
            "DENSE_FOG": 1.80
        }.get(weather_condition.upper(), 1.0)
        
        cong_unc = 1.0 + 0.8 * congestion_score
        anomaly_unc = 1.0 + 0.5 * min(3, active_anomalies_count)
        
        half_width_min = max(2.5, 1.8 * dist_factor * weather_unc * cong_unc * anomaly_unc)
        
        p50 = float(predicted_travel_time_min)
        p10 = float(max(p50 * 0.85, p50 - half_width_min * 0.8))
        p90 = float(p50 + half_width_min * 1.2)
        
        relative_error = half_width_min / max(15.0, p50)
        raw_confidence = float(np.clip(1.0 - relative_error * 0.9, 0.45, 0.98))
        calibrated_confidence = self.calibrate_score(raw_confidence)
        
        return {
            "p10_minutes": round(p10, 1),
            "p50_minutes": round(p50, 1),
            "p90_minutes": round(p90, 1),
            "margin_minutes": round(half_width_min, 1),
            "raw_confidence": round(raw_confidence, 3),
            "calibrated_confidence": round(calibrated_confidence, 3),
            "confidence_percentage": round(calibrated_confidence * 100.0, 1)
        }

    def compute_ece(self, y_true_binary: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
        bin_limits = np.linspace(0, 1, n_bins + 1)
        ece = 0.0
        n_total = len(y_prob)
        
        for i in range(n_bins):
            bin_mask = (y_prob >= bin_limits[i]) & (y_prob < bin_limits[i+1])
            n_in_bin = np.sum(bin_mask)
            if n_in_bin > 0:
                bin_acc = np.mean(y_true_binary[bin_mask])
                bin_conf = np.mean(y_prob[bin_mask])
                ece += (n_in_bin / n_total) * np.abs(bin_acc - bin_conf)
                
        return float(ece)

confidence_engine = ConfidenceEngine()
