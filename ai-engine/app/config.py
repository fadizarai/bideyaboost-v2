from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Tunisian AI Orientation Engine"
    app_version: str = "1.0.0"
    debug: bool = False

    host: str = "0.0.0.0"
    port: int = 8080

    top_k: int = 10
    default_competition_level: float = 0.6

    model_dir: Path = Path("app/ml/artifacts")
    institutions_path: Path = Path("app/data/institutions.json")
    students_path: Path = Path("app/data/students.csv")
    fallback_orientation_dataset: Path = Path("../../data/ai/ai/bideyaboost_orientation_data.json")

    model_config = SettingsConfigDict(
        env_prefix="AIOE_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
