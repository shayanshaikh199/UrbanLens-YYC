from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.map_data import get_buildings
from app.services.query_engine import QueryError, apply_filters, interpret_query

router = APIRouter()


class QueryRequest(BaseModel):
    query: str = Field(min_length=2, max_length=300)
    active_filters: list[dict] = Field(default_factory=list)


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
