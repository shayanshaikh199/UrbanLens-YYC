from typing import Any, Literal

from pydantic import BaseModel, Field


Coordinate = tuple[float, float]


class MapMetadata(BaseModel):
    source: str
    generated_at: str
    area_name: str
    center: Coordinate
    bounds: dict[str, Coordinate]
    count: int
    notes: list[str] = Field(default_factory=list)


class Building(BaseModel):
    id: str
    address: str
    center: Coordinate
    footprint: list[Coordinate]
    height_m: float
    floors: int
    zoning: str
    land_use: str
    assessed_value: int | None = None
    source: Literal["calgary-open-data", "sample"]
    properties: dict[str, Any] = Field(default_factory=dict)


class Permit(BaseModel):
    id: str
    address: str
    center: Coordinate
    permit_type: str
    status: str
    estimated_project_cost: int | None = None
    source: Literal["calgary-open-data", "sample"]
    properties: dict[str, Any] = Field(default_factory=dict)


class BuildingsResponse(BaseModel):
    metadata: MapMetadata
    buildings: list[Building]


class PermitsResponse(BaseModel):
    metadata: MapMetadata
    permits: list[Permit]
