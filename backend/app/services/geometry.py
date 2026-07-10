from __future__ import annotations

import math
from collections.abc import Iterable

LngLat = tuple[float, float]
LatLng = tuple[float, float]


def outer_ring(geometry: dict) -> list[LngLat]:
    """Return the largest outer ring from a GeoJSON Polygon or MultiPolygon."""
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates") or []

    if geometry_type == "Polygon" and coordinates:
        return [(float(lng), float(lat)) for lng, lat in coordinates[0]]

    if geometry_type == "MultiPolygon" and coordinates:
        largest = max(coordinates, key=lambda polygon: len(polygon[0]) if polygon else 0)
        return [(float(lng), float(lat)) for lng, lat in largest[0]]

    return []


def lat_lng_ring(ring: Iterable[LngLat]) -> list[LatLng]:
    return [(round(lat, 7), round(lng, 7)) for lng, lat in ring]


def centroid_from_lng_lat(ring: list[LngLat]) -> LatLng:
    if not ring:
        return (0.0, 0.0)

    lats = [lat for _, lat in ring]
    lngs = [lng for lng, _ in ring]
    return (round(sum(lats) / len(lats), 7), round(sum(lngs) / len(lngs), 7))


def distance_degrees(a: LatLng, b: LatLng) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)


def bounds_for(points: Iterable[LatLng]) -> dict[str, LatLng]:
    point_list = list(points)
    if not point_list:
        return {"sw": (0.0, 0.0), "ne": (0.0, 0.0)}

    lats = [point[0] for point in point_list]
    lngs = [point[1] for point in point_list]
    return {
        "sw": (round(min(lats), 7), round(min(lngs), 7)),
        "ne": (round(max(lats), 7), round(max(lngs), 7)),
    }
