from app.services.geometry import bounds_for, centroid_from_lng_lat, outer_ring


def test_outer_ring_handles_polygon():
    geometry = {
        "type": "Polygon",
        "coordinates": [[[-114.0, 51.0], [-113.0, 51.0], [-113.0, 52.0], [-114.0, 51.0]]],
    }

    assert outer_ring(geometry)[0] == (-114.0, 51.0)


def test_centroid_from_lng_lat():
    ring = [(-114.0, 51.0), (-113.0, 51.0), (-113.0, 52.0), (-114.0, 52.0)]

    assert centroid_from_lng_lat(ring) == (51.5, -113.5)


def test_bounds_for_points():
    assert bounds_for([(51.0, -114.0), (52.0, -113.0)]) == {
        "sw": (51.0, -114.0),
        "ne": (52.0, -113.0),
    }
