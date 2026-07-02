import torch
import torch.nn as nn
from pathlib import Path
import joblib

class CutoffLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=32, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])

class LSTMTrendPredictor:
    def __init__(self):
        self.model = None
        self.scalers = None
        self.mae = None
    
    def load(self, model_path: Path, scalers_path: Path):
        if model_path.exists() and scalers_path.exists():
            self.model = CutoffLSTM()
            self.model.load_state_dict(torch.load(model_path, weights_only=True))
            self.model.eval()
            self.scalers = joblib.load(scalers_path)
            
    def predict_2026_cutoff(self, institution_name: str) -> dict | None:
        if not self.model or not self.scalers or institution_name not in self.scalers:
            return None
            
        scaler = self.scalers[institution_name]["scaler"]
        history = self.scalers[institution_name]["history"]
        
        if len(history) < 3:
            return None
            
        # Take last 3 years [2023, 2024, 2025]
        recent_history = history[-3:]
        
        try:
            seq = scaler.transform([[x] for x in recent_history])
            x_tensor = torch.tensor(seq, dtype=torch.float32).unsqueeze(0)
            
            with torch.no_grad():
                pred_norm = self.model(x_tensor).item()
                
            pred_cutoff = scaler.inverse_transform([[pred_norm]])[0][0]
            
            score_last = history[-1]
            delta = pred_cutoff - score_last
            
            if delta > 3.0:
                trend = "rising"
            elif delta < -3.0:
                trend = "falling"
            else:
                trend = "stable"
                
            return {
                "predicted_cutoff_2026": float(pred_cutoff),
                "trend": trend,
                "delta": float(delta),
                "confidence": "high" if not self.scalers[institution_name].get("is_synthetic") else "low"
            }
        except Exception:
            return None
