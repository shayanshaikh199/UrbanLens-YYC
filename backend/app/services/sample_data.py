from __future__ import annotations

from datetime import UTC, datetime

AREA_NAME = "Beltline east blocks, Calgary AB"
CENTER = (51.0419, -114.0645)
BOUNDS = {"sw": (51.0398, -114.0678), "ne": (51.0444, -114.0608)}


def sample_buildings() -> dict:
    generated_at = datetime.now(UTC).isoformat()
    buildings = [
        {
            "id": "bldg_1_st_110",
            "address": "110 12 AV SE",
            "center": (51.0412, -114.0637),
            "footprint": [
                (51.0410, -114.0641),
                (51.0410, -114.0633),
                (51.0414, -114.0633),
                (51.0414, -114.0641),
                (51.0410, -114.0641),
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
            "address": "124 12 AV SE",
            "center": (51.0412, -114.0626),
            "footprint": [
                (51.0409, -114.0630),
                (51.0409, -114.0622),
                (51.0415, -114.0622),
                (51.0415, -114.0630),
                (51.0409, -114.0630),
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
            "address": "150 13 AV SE",
            "center": (51.0405, -114.0617),
            "footprint": [
                (51.0402, -114.0621),
                (51.0402, -114.0613),
                (51.0408, -114.0613),
                (51.0408, -114.0621),
                (51.0402, -114.0621),
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
            "address": "118 12 AV SE",
            "center": (51.04135, -114.06305),
            "permit_type": "Commercial Alteration",
            "status": "Issued",
            "estimated_project_cost": 450_000,
            "source": "sample",
            "properties": {"data_quality": "sample fallback"},
        },
        {
            "id": "permit_sample_002",
            "address": "142 13 AV SE",
            "center": (51.0407, -114.0619),
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
