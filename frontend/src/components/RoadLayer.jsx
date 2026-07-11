import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";

import { latLngToScene } from "../utils/geo.js";

const ROADS = [
  {
    id: "stephen-ave",
    name: "Stephen Ave",
    kind: "avenue",
    label: true,
    path: [
      [51.04502, -114.0755],
      [51.04508, -114.0664]
    ]
  },
  {
    id: "6-ave",
    name: "6 Ave SW",
    kind: "avenue",
    path: [
      [51.04676, -114.0755],
      [51.04682, -114.0664]
    ]
  },
  {
    id: "7-ave",
    name: "7 Ave SW",
    kind: "avenue",
    label: true,
    path: [
      [51.04588, -114.0755],
      [51.04594, -114.0664]
    ]
  },
  {
    id: "9-ave",
    name: "9 Ave SW",
    kind: "avenue",
    path: [
      [51.04412, -114.0755],
      [51.04418, -114.0664]
    ]
  },
  {
    id: "4-st",
    name: "4 St SW",
    kind: "street",
    label: true,
    path: [
      [51.04745, -114.0737],
      [51.0441, -114.07362]
    ]
  },
  {
    id: "3-st",
    name: "3 St SW",
    kind: "street",
    path: [
      [51.04745, -114.0719],
      [51.0441, -114.07182]
    ]
  },
  {
    id: "2-st",
    name: "2 St SW",
    kind: "street",
    label: true,
    path: [
      [51.04745, -114.0701],
      [51.0441, -114.07002]
    ]
  },
  {
    id: "1-st",
    name: "1 St SW",
    kind: "street",
    path: [
      [51.04745, -114.06835],
      [51.0441, -114.06828]
    ]
  },
  {
    id: "centre-st",
    name: "Centre St",
    kind: "street",
    label: true,
    path: [
      [51.04745, -114.06655],
      [51.0441, -114.0665]
    ]
  }
];

export function RoadLayer({ origin }) {
  const roads = useMemo(
    () =>
      ROADS.map((road) => ({
        ...road,
        points: road.path.map((point) => {
          const [x, z] = latLngToScene(point, origin);
          return [x, 0.18, z];
        })
      })),
    [origin]
  );

  return (
    <group>
      {roads.map((road) => (
        <group key={road.id}>
          <Line
            points={road.points}
            color={road.kind === "avenue" ? "#776f61" : "#8a8378"}
            lineWidth={road.kind === "avenue" ? 7 : 5}
            transparent
            opacity={0.68}
          />
          <Line points={road.points} color="#f3efe4" lineWidth={1.25} transparent opacity={0.55} />
          {road.label ? <RoadLabel road={road} /> : null}
        </group>
      ))}
    </group>
  );
}

function RoadLabel({ road }) {
  const middle = road.points[Math.floor(road.points.length / 2)];

  return (
    <Html position={[middle[0], 0.55, middle[2]]} center distanceFactor={36}>
      <span className="roadLabel">{road.name}</span>
    </Html>
  );
}
