from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.map_data import get_buildings, get_permits
from app.services.query_engine import QueryError, apply_filters, interpret_query

router = APIRouter()


class QueryRequest(BaseModel):
    query: str = Field(min_length=2, max_length=300)
    active_filters: list[dict] = Field(default_factory=list)


class FilterRequest(BaseModel):
    filters: list[dict] = Field(default_factory=list)


@router.post("/query")
def query_map(payload: QueryRequest):
    buildings = get_buildings()["buildings"]
    try:
        interpretation = interpret_query(payload.query)
        matched_ids = apply_filters(buildings, interpretation["filters"])
    except QueryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "query": payload.query,
        "method": interpretation["method"],
        "filters": interpretation["filters"],
        "matched_building_ids": matched_ids,
        "match_count": len(matched_ids),
    }


@router.get("/llm/status")
def llm_status():
    return {
        "provider": "groq",
        "configured": settings.llm_configured,
        "model": settings.groq_model if settings.llm_configured else None,
        "fallback": "deterministic-pattern-parser",
    }


@router.get("/status")
def api_status():
    buildings_payload = get_buildings()
    permits_payload = get_permits()
    buildings_metadata = buildings_payload["metadata"]
    permits_metadata = permits_payload["metadata"]

    return {
        "service": "urbanlens-api",
        "area_name": buildings_metadata["area_name"],
        "data_source": buildings_metadata["source"],
        "buildings": buildings_metadata["count"],
        "permits": permits_metadata["count"],
        "llm": {
            "provider": "groq",
            "configured": settings.llm_configured,
            "model": settings.groq_model if settings.llm_configured else None,
        },
    }


@router.post("/filter")
def filter_map(payload: FilterRequest):
    buildings = get_buildings()["buildings"]
    try:
        matched_ids = apply_filters(buildings, payload.filters)
    except QueryError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {"matched_building_ids": matched_ids, "match_count": len(matched_ids)}
