from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Diabetes Risk Predictor API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/diabetes_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Auth
    JWT_SECRET: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
    ]

    # Model
    MODEL_PATH: str = "ml_models/diabetes_pipeline.joblib"
    PREPROCESSOR_PATH: str = "ml_models/preprocessor.joblib"
    METADATA_PATH: str = "ml_models/metadata.json"

    # Batch
    MAX_BATCH_ROWS: int = 10000
    BATCH_CHUNK_SIZE: int = 100

    # Risk thresholds
    HIGH_RISK_THRESHOLD: float = 0.70
    MODERATE_RISK_THRESHOLD: float = 0.40

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
