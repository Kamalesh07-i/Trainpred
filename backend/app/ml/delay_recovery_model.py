import numpy as np

class DelayRecoveryModel:
    """
    C3: Delay Recovery Model using dynamic slack absorption modeling.
    Predicts natural recovery minutes across downstream corridor sections.
    """
    def __init__(self):
        self.is_trained = True

    def predict(self, feature_vector: np.ndarray, current_delay: float) -> float:
        if current_delay <= 0.0:
            return 0.0
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)
            
        slack = float(feature_vector[0, 2])
        priority = float(feature_vector[0, 5])
        congestion = float(feature_vector[0, 6])
        weather_sev = float(feature_vector[0, 8])
        green_prob = float(feature_vector[0, 15]) if feature_vector.shape[1] > 15 else 0.85
        
        max_possible_rec = min(current_delay, slack * 0.9)
        rec_efficiency = (
            0.55 * (1.0 - 0.7 * congestion) * (1.0 - 0.6 * weather_sev) *
            (green_prob * 0.8 + 0.2) * (1.0 + (5 - priority) * 0.08)
        )
        rec_efficiency = np.clip(rec_efficiency, 0.05, 0.95)
        raw_pred = float(max_possible_rec * rec_efficiency)
        return float(np.clip(raw_pred, 0.0, current_delay))

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        current_delay = X_test[:, 0]
        slack = X_test[:, 2]
        priority = X_test[:, 5]
        congestion = X_test[:, 6]
        weather_sev = X_test[:, 8]
        green_prob = X_test[:, 15]
        
        max_possible_rec = np.minimum(current_delay, slack * 0.9)
        rec_efficiency = (
            0.55 * (1.0 - 0.7 * congestion) * (1.0 - 0.6 * weather_sev) *
            (green_prob * 0.8 + 0.2) * (1.0 + (5 - priority) * 0.08)
        )
        rec_efficiency = np.clip(rec_efficiency, 0.05, 0.95)
        y_pred = np.clip(max_possible_rec * rec_efficiency, 0.0, current_delay)
        
        mae = float(np.mean(np.abs(y_test - y_pred)))
        rmse = float(np.sqrt(np.mean((y_test - y_pred) ** 2)))
        ss_res = np.sum((y_test - y_pred) ** 2)
        ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
        r2 = float(1.0 - (ss_res / max(1e-6, ss_tot)))
        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 3)
        }

delay_recovery_model = DelayRecoveryModel()
