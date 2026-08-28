import os
import joblib
import numpy as np
from pathlib import Path
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "travel_time_xgb.joblib"
TMP_MODEL_PATH = Path("/tmp/travel_time_xgb.joblib")

class TravelTimeModel:
    """
    C1: Travel Time Prediction Model using XGBoost with 22 features.
    Performance Targets: MAE <= 4.0 min, RMSE <= 6.0 min, R² >= 0.85.
    """
    
    def __init__(self):
        self.model = XGBRegressor(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            min_child_weight=2,
            random_state=42,
            n_jobs=-1
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
                    print(f"Warning: Could not load saved model from {path}: {e}")
        
        self._bootstrap_train()

    def _generate_synthetic_dataset(self, n: int, seed: int = 42):
        np.random.seed(seed)
        # Inter-station sectional distance (20 to 180 km)
        dist = np.random.uniform(20.0, 180.0, n)
        curr_spd = np.random.uniform(50.0, 130.0, n)
        mps = np.random.choice([110.0, 130.0, 140.0, 160.0], n)
        spd_ratio = np.clip(curr_spd / mps, 0.4, 1.1)
        delay = np.random.exponential(5.0, n)
        hist_spd = np.random.uniform(75.0, 115.0, n)
        cong = np.random.beta(2, 5, n)
        up_trains = np.random.poisson(1.2, n)
        priority = np.random.choice([1, 2, 3, 4, 5], n, p=[0.25, 0.35, 0.2, 0.1, 0.1])
        
        tod_sin = np.random.uniform(-1, 1, n)
        tod_cos = np.random.uniform(-1, 1, n)
        dow = np.random.randint(0, 7, n)
        is_peak = np.random.choice([0.0, 1.0], n, p=[0.7, 0.3])
        
        grad = np.random.choice([1.0, 1.05, 1.35], n, p=[0.7, 0.2, 0.1])
        weather = np.random.choice([1.0, 1.12, 1.28, 1.45], n, p=[0.65, 0.2, 0.1, 0.05])
        slack = np.random.uniform(2.0, 15.0, n)
        halts = np.random.randint(0, 4, n)
        accel = np.random.normal(0.0, 0.3, n)
        single_trk = np.random.choice([0.0, 1.0], n, p=[0.85, 0.15])
        junc_ahead = np.random.choice([0.0, 1.0], n, p=[0.6, 0.4])
        halt_dur = np.random.uniform(0.0, 5.0, n)
        hist_delay = np.random.uniform(1.0, 8.0, n)
        sig_density = np.random.uniform(0.2, 0.8, n)
        
        X = np.column_stack([
            dist, curr_spd, spd_ratio, delay, hist_spd, cong, up_trains, priority,
            tod_sin, tod_cos, dow, is_peak, grad, weather, slack, halts,
            accel, single_trk, junc_ahead, halt_dur, hist_delay, sig_density
        ])
        
        effective_speed = (curr_spd * 0.45 + hist_spd * 0.55) / (weather * grad * (1.0 + 0.28 * cong))
        effective_speed = np.maximum(effective_speed, 35.0)
        base_travel_time = (dist / effective_speed) * 60.0
        
        y = base_travel_time + halts * 2.5 - (5 - priority) * 0.8 + np.random.normal(0, 0.9, n)
        y = np.maximum(y, 3.0)
        return X, y

    def _bootstrap_train(self):
        X_train, y_train = self._generate_synthetic_dataset(6000, seed=42)
        self.model.fit(X_train, y_train)
        self.is_trained = True
        
        try:
            os.makedirs(MODEL_DIR, exist_ok=True)
            joblib.dump(self.model, MODEL_PATH)
        except Exception:
            try:
                joblib.dump(self.model, TMP_MODEL_PATH)
            except Exception:
                pass

    def predict(self, feature_vector: np.ndarray) -> float:
        if feature_vector.ndim == 1:
            feature_vector = feature_vector.reshape(1, -1)
        pred = float(self.model.predict(feature_vector)[0])
        return max(2.0, pred)

    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> dict:
        y_pred = self.model.predict(X_test)
        return {
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "r2": float(r2_score(y_test, y_pred))
        }

travel_time_model = TravelTimeModel()
