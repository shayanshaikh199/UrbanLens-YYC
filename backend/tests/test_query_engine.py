from dataclasses import replace

from app.services import query_engine
from app.services.query_engine import apply_filters, interpret_query


BUILDINGS = [
    {"id": "a", "height_m": 20, "zoning": "CC-X", "land_use": "COMMERCIAL", "assessed_value": 100},
    {"id": "b", "height_m": 50, "zoning": "DC", "land_use": "RESIDENTIAL", "assessed_value": 300},
]


def test_height_query_converts_feet_to_meters(monkeypatch):
    monkeypatch.setattr(query_engine, "settings", replace(query_engine.settings, groq_api_key=""))

    result = interpret_query("highlight buildings over 100 feet")

    assert result["method"] == "deterministic-pattern"
    assert result["filters"][0]["attribute"] == "height_m"
    assert result["filters"][0]["operator"] == ">"
    assert result["filters"][0]["value"] == 30.48


def test_apply_filters_matches_numeric_comparison():
    matched = apply_filters(BUILDINGS, [{"attribute": "height_m", "operator": ">", "value": 30}])

    assert matched == ["b"]


def test_apply_filters_ignores_unknown_numeric_values():
    buildings = [*BUILDINGS, {"id": "c", "height_m": 30, "zoning": "DC", "land_use": "COMMERCIAL", "assessed_value": None}]

    matched = apply_filters(buildings, [{"attribute": "assessed_value", "operator": ">", "value": 50}])

    assert matched == ["a", "b"]


def test_superlative_returns_top_match_order():
    result = interpret_query("show the tallest buildings")
    matched = apply_filters(BUILDINGS, result["filters"])

    assert matched == ["b", "a"]
