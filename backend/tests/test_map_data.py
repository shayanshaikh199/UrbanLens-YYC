from app.services.map_data import normalize_buildings, normalize_permits


def test_normalize_buildings_uses_height_from_elevation():
    footprints = [
        {
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [[-114.0, 51.0], [-113.999, 51.0], [-113.999, 51.001], [-114.0, 51.0]]
                ],
            },
            "properties": {"struct_id": "a", "rooftop_elev_z": "1030", "grd_elev_min_z": "1000"},
        }
    ]

    result = normalize_buildings(footprints, [])

    assert result["metadata"]["count"] == 1
    assert result["buildings"][0]["height_m"] == 30.0
    assert result["buildings"][0]["floors"] == 9
    assert result["buildings"][0]["assessed_value"] is None


def test_normalize_buildings_uses_actual_assessment_value():
    footprints = [
        {
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-114.0, 51.0],
                        [-113.9998, 51.0],
                        [-113.9998, 51.0002],
                        [-114.0, 51.0],
                    ]
                ],
            },
            "properties": {"struct_id": "a", "height": "12"},
        }
    ]
    assessments = [
        {
            "address": "100 8 AV SW",
            "assessed_value": "12345000",
            "land_use_designation": "DC",
            "assessment_class_description": "NON-RESIDENTIAL",
            "multipolygon": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-114.0001, 50.9999],
                        [-113.9997, 50.9999],
                        [-113.9997, 51.0003],
                        [-114.0001, 51.0003],
                        [-114.0001, 50.9999],
                    ]
                ],
            },
        }
    ]

    result = normalize_buildings(footprints, assessments)

    building = result["buildings"][0]
    assert building["assessed_value"] == 12_345_000
    assert building["address"] == "100 8 AV SW"
    assert building["zoning"] == "DC"
    assert building["properties"]["join"] == "assessment-parcel"


def test_normalize_permits_reads_point_coordinates():
    permits = [
        {
            "permitnum": "BP1",
            "point": {"type": "Point", "coordinates": [-114.06, 51.04]},
            "originaladdress": "100 12 AV SE",
            "permittype": "Commercial",
            "statuscurrent": "Issued",
            "estimatedprojectcost": "125000",
        }
    ]

    result = normalize_permits(permits)

    assert result["metadata"]["count"] == 1
    assert result["permits"][0]["center"] == (51.04, -114.06)
    assert result["permits"][0]["estimated_project_cost"] == 125000
