import os
import joblib
import numpy as np
from pathlib import Path
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "delay_recovery_gbr.joblib"
TMP_MODEL_PATH = Path("/tmp/delay_recovery_gbr.joblib")

class DelayRecoveryModel:
    """
    C3: Delay Recovery Model using GradientBoosting with 18 features.
    Predicts natural recovery minutes across downstream corridor sections.
    Key Innovation: Replaces static delay assumption with dynamic slack recovery modeling.
    """

    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=130,
            learning_rate=0.06,
            max_depth=4,
            subsample=0.85,
            random_state=42
        )
        self.is_trained = False
        self._load_or_bootstrap()

    def _load_or_bootstrap(self):
        for path in [MODEL_PATH, TMP_MODEL_PATH]:
            if path.exists():
                try:
                    self.model = joblib.load(path)
                    self.is_trained = True
                    return
                except Exception as e:
                    print(f"Warning: Could not load saved recovery model from {path}: {e}")
        
        self._bootstrap_train()

    def _bootstrap_train(self):
        np.random.seed(42)
        n = 3500
        
        current_delay = np.random.uniform(0.0, 90.0, n)
        dist = np.random.uniform(30.0, 800.0, n)
        slack = np.random.uniform(5.0, 45.0, n)
        mps = np.random.choice([110.0, 130.0, 140.0, 160.0], n)
        headroom = np.random.uniform(5.0, 45.0, n)
        priority = np.random.choice([1, 2, 3, 4, 5], n, p=[0.25, 0.35, 0.2, 0.1, 0.1])
        congestion = np.random.beta(2, 4, n)
        junc_count = np.random.randint(1, 8, n)
        weather_sev = np.random.choice([0.0, 0.35, 0.7, 0.9], n, p=[0.65, 0.2, 0.1, 0.05])
        is_peak = np.random.choice([0.0, 1.0], n, p=[0.7, 0.3])
        hist_rec_pct = np.random.uniform(20.0, 85.0, n)
        crew_exp = np.random.uniform(0.7, 1.0, n)
        pwr_weight = np.random.uniform(10.0, 18.0, n)
        track_quality = np.random.uniform(70.0, 98.0, n)
        freight_preempt = np.random.uniform(0.4, 0.95, n)
        green_prob = np.random.uniform(0.4, 0.98, n)
        urgency = np.clip(current_delay / 30.0 + 0.5, 0.5, 2.0)
        buffer_per_100k = (slack / (dist / 100.0))
        
        X = np.column_stack([
            current_delay, dist, slack, mps, headroom, priority, congestion,
            junc_count, weather_sev, is_peak, hist_rec_pct, crew_exp,
            pwr_weight, track_quality, freight_preempt, green_prob, urgency, buffer_per_100k
        ])
        
        # Realistic recovery: Fraction of slack usable + Speed headroom bonus - Congestion/Weather losses
        max_possible_rec = np.minimum(current_delay, slack * 0.9)
        rec_efficiency = (
            0.55 * (1.0 - 0.7 * congestion) * (1.0 - 0.6 * weather_sev) *
            (green_prob * 0.8 + 0.2) * (1.0 + (5 - priority) * 0.08)
        )
        rec_efficiency = np.clip(rec_efficiency, 0.05, 0.95)
        
        y = max_possible_rec * rec_efficiency + np.random.normal(0, 0.8, n)
        y = np.clip(y, 0.0, current_delay)
        
        self.model.fit(X, y)
        self.is_trained = True
        
        try:
            os.makedirs(MODEL_DIR, exist_ok=True)
            joblib.dump(self.model, MODEL_PATH)
        except Exception:
            try:
                joblib.dump(self.model, TMP_MODEL_PATH)
            except Exception:
                pass

    def predict(self, feature_vector: np.ndarray, current_delay: float) -> float:
        """
        Predict recoverable minutes for a train with current delay.
        Guaranteed to be within [0, current_delay].
        """
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)
        raw_pred = float(self.model.predict(feature_vector)[0])
        return float(np.clip(raw_pred, 0.0, current_delay))

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        y_pred = self.model.predict(X_test)
        return {
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "r2": float(r2_score(y_test, y_pred))
        }

delay_recovery_model = DelayRecoveryModel()
