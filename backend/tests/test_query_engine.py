from app.services.query_engine import apply_filters, interpret_query


BUILDINGS = [
    {"id": "a", "height_m": 20, "zoning": "CC-X", "land_use": "COMMERCIAL", "assessed_value": 100},
    {"id": "b", "height_m": 50, "zoning": "DC", "land_use": "RESIDENTIAL", "assessed_value": 300},
]


def test_height_query_converts_feet_to_meters():
    result = interpret_query("highlight buildings over 100 feet")

    assert result["method"] == "deterministic-pattern"
    assert result["filters"][0]["attribute"] == "height_m"
    assert result["filters"][0]["operator"] == ">"
    assert result["filters"][0]["value"] == 30.48


def test_apply_filters_matches_numeric_comparison():
    matched = apply_filters(BUILDINGS, [{"attribute": "height_m", "operator": ">", "value": 30}])

    assert matched == ["b"]


def test_superlative_returns_top_match_order():
    result = interpret_query("show the tallest buildings")
    matched = apply_filters(BUILDINGS, result["filters"])

    assert matched == ["b", "a"]
