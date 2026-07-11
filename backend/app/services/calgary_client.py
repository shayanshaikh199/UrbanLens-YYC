from __future__ import annotations

import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = "https://data.calgary.ca/resource"

BUILDING_FOOTPRINTS = "cchr-krqg.geojson"
PROPERTY_ASSESSMENTS = "4bsw-nn7w.json"
BUILDING_PERMITS = "c2es-76ed.json"

DEFAULT_BOUNDS = {
    "north": 51.0484,
    "south": 51.0435,
    "west": -114.0770,
    "east": -114.0649,
}

DEFAULT_CENTER = (51.0460, -114.0710)
DEFAULT_RADIUS_M = 760


class CalgaryDataError(RuntimeError):
    pass


def fetch_json(dataset: str, params: dict[str, str | int]) -> dict | list:
    query = urlencode(params)
    url = f"{BASE_URL}/{dataset}?{query}"
    request = Request(url, headers={"User-Agent": "UrbanLensYYC/0.1"})

    try:
        with urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # pragma: no cover - network dependent
        raise CalgaryDataError(f"Unable to fetch Calgary dataset {dataset}") from exc


def fetch_building_footprints(bounds: dict[str, float] | None = None) -> list[dict]:
    bounds = bounds or DEFAULT_BOUNDS
    where = (
        "within_box("
        f"polygon, {bounds['north']}, {bounds['west']}, {bounds['south']}, {bounds['east']}"
        ") AND stage='CONSTRUCTED'"
    )
    data = fetch_json(BUILDING_FOOTPRINTS, {"$limit": 500, "$where": where})
    if not isinstance(data, dict):
        raise CalgaryDataError("Unexpected building footprint response format")
    return data.get("features", [])


def fetch_property_assessments(bounds: dict[str, float] | None = None) -> list[dict]:
    bounds = bounds or DEFAULT_BOUNDS
    where = (
        "within_box("
        f"multipolygon, {bounds['north']}, {bounds['west']}, {bounds['south']}, {bounds['east']}"
        ")"
    )
    params = {
        "$limit": 1500,
        "$where": where,
        "$select": ",".join(
            [
                "address",
                "assessed_value",
                "land_use_designation",
                "assessment_class_description",
                "multipolygon",
                "comm_name",
            ]
        ),
    }
    data = fetch_json(PROPERTY_ASSESSMENTS, params)
    if not isinstance(data, list):
        raise CalgaryDataError("Unexpected property assessment response format")
    return data


def fetch_building_permits(
    center: tuple[float, float] = DEFAULT_CENTER,
    radius_m: int = DEFAULT_RADIUS_M,
) -> list[dict]:
    lat, lng = center
    params = {
        "$limit": 100,
        "$where": f"within_circle(point, {lat}, {lng}, {radius_m})",
        "$order": "issueddate DESC",
    }
    data = fetch_json(BUILDING_PERMITS, params)
    if not isinstance(data, list):
        raise CalgaryDataError("Unexpected building permit response format")
    return data
