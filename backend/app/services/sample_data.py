from __future__ import annotations

from datetime import UTC, datetime

AREA_NAME = "Downtown Core / Stephen Ave, Calgary AB"
CENTER = (51.0458, -114.0710)
BOUNDS = {"sw": (51.0440, -114.0758), "ne": (51.0477, -114.0660)}


def sample_buildings() -> dict:
    generated_at = datetime.now(UTC).isoformat()
    buildings = [
        {
            "id": "bldg_1_st_110",
            "address": "120 8 AV SW",
            "center": (51.0457, -114.0705),
            "footprint": [
                (51.0455, -114.0710),
                (51.0455, -114.0700),
                (51.0460, -114.0700),
                (51.0460, -114.0710),
                (51.0455, -114.0710),
            ],
            "height_m": 42.0,
            "floors": 12,
            "zoning": "CC-X",
            "land_use": "MIXED USE",
            "assessed_value": 18_500_000,
            "source": "sample",
            "properties": {"data_quality": "sample fallback"},
        },
        {
            "id": "bldg_1_st_124",
            "address": "240 8 AV SW",
            "center": (51.0458, -114.0720),
            "footprint": [
                (51.0455, -114.0725),
                (51.0455, -114.0716),
                (51.0461, -114.0716),
                (51.0461, -114.0725),
                (51.0455, -114.0725),
            ],
            "height_m": 27.0,
            "floors": 8,
            "zoning": "CC-COR",
            "land_use": "COMMERCIAL",
            "assessed_value": 9_200_000,
            "source": "sample",
            "properties": {"data_quality": "sample fallback"},
        },
        {
            "id": "bldg_macleod_150",
            "address": "340 7 AV SW",
            "center": (51.0466, -114.0733),
            "footprint": [
                (51.0462, -114.0738),
                (51.0462, -114.0728),
                (51.0470, -114.0728),
                (51.0470, -114.0738),
                (51.0462, -114.0738),
            ],
            "height_m": 64.0,
            "floors": 19,
            "zoning": "CC-MH",
            "land_use": "RESIDENTIAL",
            "assessed_value": 32_750_000,
            "source": "sample",
            "properties": {"data_quality": "sample fallback"},
        },
    ]
    return {
        "metadata": {
            "source": "sample",
            "generated_at": generated_at,
            "area_name": AREA_NAME,
            "center": CENTER,
            "bounds": BOUNDS,
            "count": len(buildings),
            "notes": ["Fallback sample used when no cache exists and live refresh is unavailable."],
        },
        "buildings": buildings,
    }


def sample_permits() -> dict:
    generated_at = datetime.now(UTC).isoformat()
    permits = [
        {
            "id": "permit_sample_001",
            "address": "136 8 AV SW",
            "center": (51.0457, -114.0708),
            "permit_type": "Commercial Alteration",
            "status": "Issued",
            "estimated_project_cost": 450_000,
            "source": "sample",
            "properties": {"data_quality": "sample fallback"},
        },
        {
            "id": "permit_sample_002",
            "address": "304 8 AV SW",
            "center": (51.0459, -114.0730),
            "permit_type": "Multi-family Residential",
            "status": "Review",
            "estimated_project_cost": 1_250_000,
            "source": "sample",
            "properties": {"data_quality": "sample fallback"},
        },
    ]
    return {
        "metadata": {
            "source": "sample",
            "generated_at": generated_at,
            "area_name": AREA_NAME,
            "center": CENTER,
            "bounds": BOUNDS,
            "count": len(permits),
            "notes": ["Fallback sample used when no cache exists and live refresh is unavailable."],
        },
        "permits": permits,
    }
