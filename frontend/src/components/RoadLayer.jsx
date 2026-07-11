import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

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
          return [x, 0.11, z];
        })
      })),
    [origin]
  );

  return (
    <group>
      {roads.map((road) => (
        <group key={road.id}>
          <RoadBand road={road} />
          <Line points={road.points} color="#f4ecdb" lineWidth={1.15} transparent opacity={0.46} />
          {road.label ? <RoadLabel road={road} /> : null}
        </group>
      ))}
    </group>
  );
}

function RoadBand({ road }) {
  const geometry = useMemo(() => bandGeometry(road.points, road.kind === "avenue" ? 9.5 : 7.5), [road]);

  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshBasicMaterial
        color={road.kind === "avenue" ? "#8c806e" : "#9b9285"}
        transparent
        opacity={0.82}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function RoadLabel({ road }) {
  const middle = road.points[Math.floor(road.points.length / 2)];

  return (
    <Html position={[middle[0], 0.7, middle[2]]} center distanceFactor={44}>
      <span className="roadLabel">{road.name}</span>
    </Html>
  );
}

function bandGeometry(points, width) {
  const [start, end] = points;
  const dx = end[0] - start[0];
  const dz = end[2] - start[2];
  const length = Math.hypot(dx, dz) || 1;
  const nx = (-dz / length) * (width / 2);
  const nz = (dx / length) * (width / 2);
  const y = start[1];

  const vertices = new Float32Array([
    start[0] + nx,
    y,
    start[2] + nz,
    start[0] - nx,
    y,
    start[2] - nz,
    end[0] + nx,
    y,
    end[2] + nz,
    end[0] + nx,
    y,
    end[2] + nz,
    start[0] - nx,
    y,
    start[2] - nz,
    end[0] - nx,
    y,
    end[2] - nz
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}
