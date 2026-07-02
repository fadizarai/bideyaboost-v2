from __future__ import annotations

import json
import logging
import random
from pathlib import Path

import joblib
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from sklearn.preprocessing import StandardScaler

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train_lstm")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
INSTITUTIONS_PATH = DATA_DIR / "institutions.json"

RANDOM_STATE = 42
torch.manual_seed(RANDOM_STATE)
np.random.seed(RANDOM_STATE)
random.seed(RANDOM_STATE)

SEQ_LEN = 3
EPOCHS = 100
BATCH_SIZE = 32
HIDDEN_SIZE = 32
LEARNING_RATE = 0.005


class CutoffLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=HIDDEN_SIZE, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])


class CutoffDataset(Dataset):
    def __init__(self, sequences: list[list[float]], targets: list[float]):
        self.sequences = torch.tensor(sequences, dtype=torch.float32).unsqueeze(-1)
        self.targets = torch.tensor(targets, dtype=torch.float32).unsqueeze(-1)

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.targets[idx]


def load_institutions(path: Path) -> list[dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    logger.info("Loaded %d institutions from %s", len(data), path)
    return data


def generate_synthetic_history(score_last: float) -> list[float]:
    score = score_last
    history = []
    for _ in range(SEQ_LEN + 1):
        history.append(round(score, 2))
        delta = random.uniform(-4.0, 4.0)
        score += delta
        score = max(score, 60.0)
    return history[::-1]


def build_training_data(
    institutions: list[dict],
) -> tuple[list[list[float]], list[float], dict]:
    sequences = []
    targets = []
    scalers = {}

    for inst in institutions:
        name = inst.get("institution", "")
        score_last = inst.get("admission_score_last")
        score_min = inst.get("admission_score_min")

        if score_last is None or score_last <= 0:
            continue
        if score_min is None or score_min <= 0:
            score_min = max(score_last - 30.0, 60.0)

        history = generate_synthetic_history(score_last)

        scaler = StandardScaler()
        scaler.fit([[h] for h in history])

        scaled = scaler.transform([[h] for h in history]).flatten().tolist()

        for i in range(len(scaled) - SEQ_LEN):
            sequences.append(scaled[i : i + SEQ_LEN])
            targets.append(scaled[i + SEQ_LEN])

        scalers[name] = {
            "scaler": scaler,
            "history": history,
            "is_synthetic": True,
        }

    logger.info("Generated %d sequences from %d institutions",
                len(sequences), len(scalers))
    return sequences, targets, scalers


def train_model(
    sequences: list[list[float]], targets: list[float]
) -> CutoffLSTM:
    dataset = CutoffDataset(sequences, targets)
    train_size = int(0.8 * len(dataset))
    test_size = len(dataset) - train_size
    train_ds, test_ds = torch.utils.data.random_split(
        dataset, [train_size, test_size]
    )

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_ds, batch_size=BATCH_SIZE)

    model = CutoffLSTM()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    best_test_loss = float("inf")

    for epoch in range(1, EPOCHS + 1):
        model.train()
        train_loss = 0.0
        for seq, tgt in train_loader:
            optimizer.zero_grad()
            pred = model(seq)
            loss = criterion(pred, tgt)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()

        model.eval()
        test_loss = 0.0
        with torch.no_grad():
            for seq, tgt in test_loader:
                pred = model(seq)
                test_loss += criterion(pred, tgt).item()

        train_loss /= len(train_loader)
        test_loss /= len(test_loader)

        if test_loss < best_test_loss:
            best_test_loss = test_loss

        if epoch % 20 == 0 or epoch == 1:
            logger.info("Epoch %3d/%d  train_loss=%.6f  test_loss=%.6f  best=%.6f",
                        epoch, EPOCHS, train_loss, test_loss, best_test_loss)

    logger.info("Training complete. Best test loss: %.6f", best_test_loss)
    return model


def save_artifacts(model: CutoffLSTM, scalers: dict) -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODELS_DIR / "lstm_cutoff.pt"
    torch.save(model.state_dict(), model_path)
    logger.info("Saved LSTM model to %s", model_path)

    scalers_path = MODELS_DIR / "lstm_scalers.joblib"
    joblib.dump(scalers, scalers_path)
    logger.info("Saved LSTM scalers (%d institutions) to %s",
                len(scalers), scalers_path)


def main() -> None:
    logger.info("=" * 60)
    logger.info("LSTM Cutoff Trend Predictor Training")
    logger.info("=" * 60)

    institutions = load_institutions(INSTITUTIONS_PATH)
    sequences, targets, scalers = build_training_data(institutions)
    model = train_model(sequences, targets)
    save_artifacts(model, scalers)

    logger.info("Training complete. Model & scalers saved to %s", MODELS_DIR)


if __name__ == "__main__":
    main()
