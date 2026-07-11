import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    app_name: str = "UrbanLensYYC API"
    environment: str = "development"
    frontend_origins_raw: str = os.getenv(
        "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    )
    database_url: str = "sqlite:///./urbanlens.db"
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    project_root: Path = BACKEND_ROOT
    data_dir: Path = project_root / "app" / "data"
    cache_dir: Path = data_dir / "cache"

    @property
    def frontend_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins_raw.split(",") if origin.strip()]

    @property
    def llm_configured(self) -> bool:
        return bool(self.groq_api_key.strip())


settings = Settings()
