from fastapi import APIRouter, HTTPException, Query

from app.services.map_data import MapDataError, get_buildings, get_permits

router = APIRouter()


@router.get("/buildings")
def buildings(refresh: bool = Query(default=False, description="Refresh from live Calgary APIs.")):
    try:
        return get_buildings(refresh=refresh)
    except MapDataError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/permits")
def permits(refresh: bool = Query(default=False, description="Refresh from live Calgary APIs.")):
    try:
        return get_permits(refresh=refresh)
    except MapDataError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
