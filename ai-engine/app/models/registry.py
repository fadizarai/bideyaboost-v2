from pathlib import Path
import joblib

from app.services.lstm_trend_predictor import LSTMTrendPredictor

class ModelRegistry:
    def __init__(self):
        self.xgb_model = None
        self.label_encoders = None
        self.lstm_predictor = LSTMTrendPredictor()
        
    def load_all(self):
        models_dir = Path("app/models")
        
        xgb_path = models_dir / "admission_xgb.joblib"
        if xgb_path.exists():
            self.xgb_model = joblib.load(xgb_path)
            
        le_path = models_dir / "label_encoders.joblib"
        if le_path.exists():
            self.label_encoders = joblib.load(le_path)
            
        lstm_path = models_dir / "lstm_cutoff.pt"
        scalers_path = models_dir / "lstm_scalers.joblib"
        self.lstm_predictor.load(lstm_path, scalers_path)

    def get_admission_probability(self, fg_score: float, institution: dict):
        pass # Implementation moves to admission_predictor.py
