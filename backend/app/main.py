from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.map import router as map_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Calgary 3D map data API for UrbanLensYYC.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.frontend_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(map_router, prefix="/api/map", tags=["map"])

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "urbanlens-api"}

    return app


app = create_app()
