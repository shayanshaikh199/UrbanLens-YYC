from __future__ import annotations

import json
import operator
import re
from typing import Any

from app.core.config import settings

ALLOWED_ATTRIBUTES = {
    "height": "height_m",
    "height_m": "height_m",
    "floors": "floors",
    "floor": "floors",
    "zoning": "zoning",
    "zone": "zoning",
    "land_use": "land_use",
    "use": "land_use",
    "assessed_value": "assessed_value",
    "value": "assessed_value",
    "address": "address",
}

OPERATORS = {
    ">": operator.gt,
    ">=": operator.ge,
    "<": operator.lt,
    "<=": operator.le,
    "=": operator.eq,
    "==": operator.eq,
    "contains": lambda field, value: str(value).upper() in str(field).upper(),
}


class QueryError(ValueError):
    pass


def interpret_query(query: str) -> dict[str, Any]:
    text = query.strip()
    if not text:
        raise QueryError("Query cannot be empty")

    superlative = _parse_superlative(text)
    if superlative:
        return {"method": "deterministic-superlative", "filters": [superlative]}

    if settings.groq_api_key:
        parsed = _parse_with_groq(text)
        if parsed:
            return {"method": "llm", "filters": parsed}

    parsed = _parse_with_patterns(text)
    if parsed:
        return {"method": "deterministic-pattern", "filters": parsed}

    raise QueryError("Could not understand the query. Try height, zoning, land use, or value filters.")


def apply_filters(buildings: list[dict], filters: list[dict]) -> list[str]:
    if not filters:
        return []

    if len(filters) == 1 and filters[0].get("operator") == "top":
        return _top_matches(buildings, filters[0])

    matched = []
    for building in buildings:
        if all(_matches_filter(building, item) for item in filters):
            matched.append(building["id"])
    return matched


def _matches_filter(building: dict, item: dict) -> bool:
    attribute = _normalize_attribute(item.get("attribute"))
    op = str(item.get("operator", "")).strip()
    value = item.get("value")

    if attribute not in building:
        return False
    if op not in OPERATORS:
        raise QueryError(f"Unsupported operator: {op}")

    field = building.get(attribute)
    if op == "contains":
        return OPERATORS[op](field, value)

    if isinstance(field, (int, float)):
        value = _as_number(value)
    else:
        field = str(field).upper()
        value = str(value).upper()

    return bool(OPERATORS[op](field, value))


def _parse_superlative(text: str) -> dict[str, Any] | None:
    lowered = text.lower()
    if "tallest" in lowered or "highest" in lowered:
        return {"attribute": "height_m", "operator": "top", "value": 5, "direction": "desc"}
    if "shortest" in lowered or "lowest" in lowered:
        return {"attribute": "height_m", "operator": "top", "value": 5, "direction": "asc"}
    if "most expensive" in lowered or "highest value" in lowered:
        return {"attribute": "assessed_value", "operator": "top", "value": 5, "direction": "desc"}
    if "cheapest" in lowered or "least expensive" in lowered or "lowest value" in lowered:
        return {"attribute": "assessed_value", "operator": "top", "value": 5, "direction": "asc"}
    return None


def _parse_with_patterns(text: str) -> list[dict]:
    lowered = text.lower()
    filters: list[dict] = []

    comparison = re.search(
        r"(?:height|buildings?)\s*(?:is|are)?\s*(over|above|greater than|under|below|less than|>=|<=|>|<)\s*\$?([\d,]+(?:\.\d+)?)\s*(feet|ft|meters|metres|m)?",
        lowered,
    )
    if comparison:
        op = _word_operator(comparison.group(1))
        value = _as_number(comparison.group(2))
        unit = comparison.group(3) or "m"
        if unit in {"feet", "ft"}:
            value = round(value * 0.3048, 2)
        filters.append({"attribute": "height_m", "operator": op, "value": value, "unit": "m"})

    value_match = re.search(
        r"(?:value|assessed value|assessment)\s*(?:is|are)?\s*(over|above|greater than|under|below|less than|>=|<=|>|<)\s*\$?([\d,]+)",
        lowered,
    )
    if value_match:
        filters.append(
            {
                "attribute": "assessed_value",
                "operator": _word_operator(value_match.group(1)),
                "value": int(str(value_match.group(2)).replace(",", "")),
                "unit": "cad",
            }
        )

    zoning = re.search(r"(?:zoning|zone|zoned|in)\s+([a-z]{1,3}-?[a-z0-9]{0,4})", lowered)
    if zoning and any(prefix in lowered for prefix in ["zoning", "zone", "zoned"]):
        filters.append({"attribute": "zoning", "operator": "contains", "value": zoning.group(1).upper()})

    for label in ["commercial", "residential", "mixed use", "mixed-use"]:
        if label in lowered:
            filters.append(
                {"attribute": "land_use", "operator": "contains", "value": label.replace("-", " ").upper()}
            )

    return filters


def _parse_with_groq(text: str) -> list[dict] | None:  # pragma: no cover - depends on external API
    try:
        from groq import Groq

        client = Groq(api_key=settings.groq_api_key)
        completion = client.chat.completions.create(
            model=settings.groq_model,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Extract map filters from the user query. Return only JSON with a filters "
                        "array. Allowed attributes: height_m, floors, zoning, land_use, "
                        "assessed_value, address. Allowed operators: >, >=, <, <=, =, contains."
                    ),
                },
                {"role": "user", "content": text},
            ],
        )
        raw = completion.choices[0].message.content or "{}"
        payload = json.loads(raw)
        filters = payload.get("filters", payload if isinstance(payload, list) else [])
        return [_validate_filter(item) for item in filters]
    except Exception:
        return None


def _validate_filter(item: dict) -> dict:
    attribute = _normalize_attribute(item.get("attribute"))
    op = str(item.get("operator", "")).strip()
    if op not in OPERATORS:
        raise QueryError(f"Unsupported operator: {op}")
    return {"attribute": attribute, "operator": op, "value": item.get("value"), "unit": item.get("unit")}


def _top_matches(buildings: list[dict], item: dict) -> list[str]:
    attribute = _normalize_attribute(item.get("attribute"))
    limit = int(item.get("value") or 5)
    reverse = item.get("direction", "desc") == "desc"
    sorted_buildings = sorted(
        [building for building in buildings if building.get(attribute) is not None],
        key=lambda building: building.get(attribute) or 0,
        reverse=reverse,
    )
    return [building["id"] for building in sorted_buildings[:limit]]


def _normalize_attribute(attribute: Any) -> str:
    key = str(attribute or "").strip().lower()
    if key not in ALLOWED_ATTRIBUTES:
        raise QueryError(f"Unsupported attribute: {attribute}")
    return ALLOWED_ATTRIBUTES[key]


def _word_operator(value: str) -> str:
    words = {
        "over": ">",
        "above": ">",
        "greater than": ">",
        "under": "<",
        "below": "<",
        "less than": "<",
    }
    return words.get(value, value)


def _as_number(value: Any) -> float:
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError) as exc:
        raise QueryError(f"Expected numeric value, got {value}") from exc
