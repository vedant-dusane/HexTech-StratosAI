"""Central configuration via Pydantic Settings — reads .env automatically."""
from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    APP_NAME: str = "StratosAI"  # HexTech project
    APP_ENV: Literal["development", "production", "test"] = "development"
    APP_VERSION: str = "1.0.0"
    SECRET_KEY: str = "CHANGE_ME"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./stratosai.db"

    @field_validator("DATABASE_URL")
    @classmethod
    def ensure_async_driver(cls, v: str) -> str:
        if v.startswith("sqlite:///"):
            return v.replace("sqlite:///", "sqlite+aiosqlite:///")
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://")
        return v

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "anthropic/claude-3-haiku"
    OPENROUTER_MAX_TOKENS: int = 1200

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse ALLOWED_ORIGINS whether it is comma-separated or JSON array."""
        v = self.ALLOWED_ORIGINS.strip()
        if v.startswith("["):
            import json
            return json.loads(v)
        return [o.strip() for o in v.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()