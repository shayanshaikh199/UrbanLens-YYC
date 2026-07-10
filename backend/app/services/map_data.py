from __future__ import annotations

import hashlib
import json
import random
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.services import calgary_client
from app.services.geometry import (
    bounds_for,
    centroid_from_lng_lat,
    distance_degrees,
    lat_lng_ring,
    outer_ring,
)
from app.services.sample_data import AREA_NAME, CENTER, sample_buildings, sample_permits

BUILDINGS_CACHE = settings.cache_dir / "buildings.json"
PERMITS_CACHE = settings.cache_dir / "permits.json"

MAX_ASSESSMENT_JOIN_DISTANCE = 0.0007


class MapDataError(RuntimeError):
    pass


def get_buildings(refresh: bool = False) -> dict[str, Any]:
    if refresh:
        return refresh_buildings_cache()
    return _read_cache(BUILDINGS_CACHE) or sample_buildings()


def get_permits(refresh: bool = False) -> dict[str, Any]:
    if refresh:
        return refresh_permits_cache()
    return _read_cache(PERMITS_CACHE) or sample_permits()


def refresh_buildings_cache() -> dict[str, Any]:
    try:
        footprints = calgary_client.fetch_building_footprints()
        assessments = calgary_client.fetch_property_assessments()
        normalized = normalize_buildings(footprints, assessments)
    except calgary_client.CalgaryDataError as exc:
        raise MapDataError(str(exc)) from exc

    _write_cache(BUILDINGS_CACHE, normalized)
    return normalized


def refresh_permits_cache() -> dict[str, Any]:
    try:
        permits = calgary_client.fetch_building_permits()
        normalized = normalize_permits(permits)
    except calgary_client.CalgaryDataError as exc:
        raise MapDataError(str(exc)) from exc

    _write_cache(PERMITS_CACHE, normalized)
    return normalized


def normalize_buildings(footprints: list[dict], assessments: list[dict]) -> dict[str, Any]:
    assessment_index = _assessment_index(assessments)
    rng = random.Random(20260710)
    buildings = []
    matched = 0
    synthetic = 0

    for index, feature in enumerate(footprints):
        geometry = feature.get("geometry") or {}
        properties = feature.get("properties") or {}
        ring = outer_ring(geometry)
        if len(ring) < 4:
            continue

        center = centroid_from_lng_lat(ring)
        height_m = _height_from_properties(properties)
        floors = max(1, round(height_m / 3.4))
        nearest = _nearest_assessment(center, assessment_index)

        if nearest:
            matched += 1
            address = nearest["address"]
            assessed_value = nearest["assessed_value"]
            zoning = nearest["zoning"]
            land_use = nearest["land_use"]
        else:
            synthetic += 1
            address = _fallback_address(rng)
            assessed_value = int(floors * rng.randint(95_000, 260_000))
            zoning = rng.choice(["CC-X", "CC-MH", "CC-MHX", "CC-COR", "C-COR1", "DC"])
            land_use = rng.choice(["COMMERCIAL", "RESIDENTIAL", "MIXED USE"])

        building_id_seed = str(properties.get("struct_id") or properties.get("globalid") or index)
        buildings.append(
            {
                "id": f"bldg_{hashlib.sha1(building_id_seed.encode()).hexdigest()[:10]}",
                "address": address,
                "center": center,
                "footprint": lat_lng_ring(ring),
                "height_m": height_m,
                "floors": floors,
                "zoning": zoning,
                "land_use": land_use,
                "assessed_value": assessed_value,
                "source": "calgary-open-data",
                "properties": {
                    "struct_id": properties.get("struct_id"),
                    "stage": properties.get("stage"),
                    "join": "assessment-centroid" if nearest else "synthetic-attribute-fallback",
                },
            }
        )

    if not buildings:
        raise MapDataError("No buildings were returned for the configured Calgary bounds")

    centers = [building["center"] for building in buildings]
    return {
        "metadata": {
            "source": "calgary-open-data",
            "generated_at": datetime.now(UTC).isoformat(),
            "area_name": AREA_NAME,
            "center": _center_of_points(centers),
            "bounds": bounds_for(centers),
            "count": len(buildings),
            "notes": [
                "Footprints and heights come from Calgary building footprints.",
                "Assessment fields are joined by nearest centroid where possible.",
                f"{matched} buildings matched assessments; {synthetic} use documented fallbacks.",
            ],
        },
        "buildings": buildings,
    }


def normalize_permits(permits: list[dict]) -> dict[str, Any]:
    normalized = []
    for index, permit in enumerate(permits):
        point = permit.get("point") or {}
        coordinates = point.get("coordinates") or []
        if len(coordinates) >= 2:
            lng, lat = float(coordinates[0]), float(coordinates[1])
        else:
            lat, lng = _lat_lng_from_permit_fields(permit)
        if not lat or not lng:
            continue

        cost = _parse_int(
            permit.get("estimatedprojectcost")
            or permit.get("estimated_project_cost")
            or permit.get("estprojectcost")
        )
        seed = str(permit.get("permitnum") or permit.get("permit_number") or index)
        normalized.append(
            {
                "id": f"permit_{hashlib.sha1(seed.encode()).hexdigest()[:10]}",
                "address": _clean_text(permit.get("originaladdress") or permit.get("address")),
                "center": (round(lat, 7), round(lng, 7)),
                "permit_type": _clean_text(
                    permit.get("permittype") or permit.get("permit_type") or "Unknown"
                ),
                "status": _clean_text(permit.get("statuscurrent") or permit.get("status") or "Unknown"),
                "estimated_project_cost": cost,
                "source": "calgary-open-data",
                "properties": {
                    "permit_number": permit.get("permitnum") or permit.get("permit_number"),
                    "issued_date": permit.get("issueddate"),
                    "contractor": permit.get("contractorname"),
                },
            }
        )

    return {
        "metadata": {
            "source": "calgary-open-data",
            "generated_at": datetime.now(UTC).isoformat(),
            "area_name": AREA_NAME,
            "center": CENTER,
            "bounds": bounds_for([permit["center"] for permit in normalized]) if normalized else {},
            "count": len(normalized),
            "notes": ["Building permit points fetched with a within-circle SoQL filter."],
        },
        "permits": normalized,
    }


def _assessment_index(assessments: list[dict]) -> list[dict[str, Any]]:
    deduped: dict[str, dict[str, Any]] = {}

    for assessment in assessments:
        address = _strip_unit(_clean_text(assessment.get("address")))
        if not address:
            continue

        ring = outer_ring(assessment.get("multipolygon") or {})
        if not ring:
            continue

        if address not in deduped:
            deduped[address] = {
                "address": address,
                "center": centroid_from_lng_lat(ring),
                "assessed_value": 0,
                "zoning": _clean_text(assessment.get("land_use_designation")) or "UNKNOWN",
                "land_use": _land_use(assessment.get("assessment_class_description")),
            }

        deduped[address]["assessed_value"] += _parse_int(assessment.get("assessed_value")) or 0

    return list(deduped.values())


def _nearest_assessment(center: tuple[float, float], assessments: list[dict]) -> dict[str, Any] | None:
    best = None
    best_distance = float("inf")
    for assessment in assessments:
        distance = distance_degrees(center, assessment["center"])
        if distance < best_distance:
            best = assessment
            best_distance = distance

    if best and best_distance <= MAX_ASSESSMENT_JOIN_DISTANCE:
        return best
    return None


def _height_from_properties(properties: dict[str, Any]) -> float:
    roof = _parse_float(properties.get("rooftop_elev_z"))
    ground = _parse_float(properties.get("grd_elev_min_z"))
    if roof and ground and roof > ground:
        return round(max(roof - ground, 3.0), 1)

    height = _parse_float(properties.get("height") or properties.get("height_m"))
    if height:
        return round(max(height, 3.0), 1)

    return 10.5


def _lat_lng_from_permit_fields(permit: dict[str, Any]) -> tuple[float | None, float | None]:
    lat = _parse_float(permit.get("latitude") or permit.get("lat"))
    lng = _parse_float(permit.get("longitude") or permit.get("lon") or permit.get("lng"))
    return lat, lng


def _center_of_points(points: list[tuple[float, float]]) -> tuple[float, float]:
    return (
        round(sum(point[0] for point in points) / len(points), 7),
        round(sum(point[1] for point in points) / len(points), 7),
    )


def _fallback_address(rng: random.Random) -> str:
    streets = ["11 AV SE", "12 AV SE", "13 AV SE", "1 ST SE", "MACLEOD TR SE"]
    return f"{rng.randint(100, 320)} {rng.choice(streets)}"


def _land_use(raw: Any) -> str:
    value = _clean_text(raw).upper()
    if "NON-RESID" in value or "NON RESID" in value or "COMMERCIAL" in value:
        return "COMMERCIAL"
    if "RESID" in value:
        return "RESIDENTIAL"
    return "MIXED USE"


def _strip_unit(address: str) -> str:
    match = re.match(r"^\d+\s+(\d+\s+.+)$", address)
    return match.group(1).strip() if match else address


def _clean_text(value: Any) -> str:
    return str(value or "").strip().upper()


def _parse_float(value: Any) -> float | None:
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return None


def _parse_int(value: Any) -> int | None:
    parsed = _parse_float(value)
    return int(parsed) if parsed is not None else None


def _read_cache(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise MapDataError(f"Cache file is invalid JSON: {path}") from exc


def _write_cache(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
