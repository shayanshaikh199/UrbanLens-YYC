import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { latLngToScene } from "../utils/geo.js";

const AVENUE_NAMES = ["9 Ave", "Stephen Ave", "7 Ave", "6 Ave", "5 Ave"];
const STREET_NAMES = ["4 St", "3 St", "2 St", "1 St", "Centre St", "1 St SE"];

export function RoadLayer({ origin, bounds, groundSize }) {
  const roads = useMemo(
    () => buildRoadGrid({ origin, bounds, groundSize }),
    [bounds, groundSize, origin]
  );

  return (
    <group>
      {roads.map((road) => (
        <group key={road.id}>
          <RoadBand road={road} />
          {road.label ? <RoadLabel road={road} /> : null}
        </group>
      ))}
    </group>
  );
}

function RoadBand({ road }) {
  const geometry = useMemo(() => bandGeometry(road), [road]);

  return (
    <mesh geometry={geometry} renderOrder={road.kind === "street" ? 2 : 1}>
      <meshBasicMaterial
        color={road.kind === "avenue" ? "#958b79" : "#a49b8d"}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        depthWrite
      />
    </mesh>
  );
}

function RoadLabel({ road }) {
  return (
    <Html position={[road.labelPosition[0], 0.82, road.labelPosition[2]]} center distanceFactor={48}>
      <span className="roadLabel">{road.name}</span>
    </Html>
  );
}

function buildRoadGrid({ origin, bounds, groundSize }) {
  const area = sceneArea(origin, bounds, groundSize);
  const width = area.xMax - area.xMin;
  const depth = area.zMax - area.zMin;
  const zPositions = spread(area.zMin + depth * 0.14, area.zMax - depth * 0.14, AVENUE_NAMES.length);
  const xPositions = spread(area.xMin + width * 0.12, area.xMax - width * 0.12, STREET_NAMES.length);

  const avenues = zPositions.map((z, index) => ({
    id: `avenue-${index}`,
    name: AVENUE_NAMES[index],
    kind: "avenue",
    width: index === 1 ? 12 : 10,
    y: 0.105,
    start: [area.xMin, 0.105, z],
    end: [area.xMax, 0.105, z],
    label: index === 1 || index === 2,
    labelPosition: [area.xMin + width * 0.22, 0.105, z]
  }));

  const streets = xPositions.map((x, index) => ({
    id: `street-${index}`,
    name: STREET_NAMES[index],
    kind: "street",
    width: index === 4 ? 11 : 8.5,
    y: 0.14,
    start: [x, 0.14, area.zMin],
    end: [x, 0.14, area.zMax],
    label: index === 0 || index === 2 || index === 4,
    labelPosition: [x, 0.14, area.zMax - depth * 0.2]
  }));

  return [...avenues, ...streets];
}

function sceneArea(origin, bounds, groundSize) {
  if (bounds?.sw && bounds?.ne) {
    const [swX, swZ] = latLngToScene(bounds.sw, origin);
    const [neX, neZ] = latLngToScene(bounds.ne, origin);
    const xMin = Math.min(swX, neX) - 28;
    const xMax = Math.max(swX, neX) + 28;
    const zMin = Math.min(swZ, neZ) - 28;
    const zMax = Math.max(swZ, neZ) + 28;
    return { xMin, xMax, zMin, zMax };
  }

  const half = groundSize / 2 - 40;
  return { xMin: -half, xMax: half, zMin: -half, zMax: half };
}

function spread(min, max, count) {
  if (count <= 1) return [(min + max) / 2];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, index) => min + step * index);
}

function bandGeometry(road) {
  const dx = road.end[0] - road.start[0];
  const dz = road.end[2] - road.start[2];
  const length = Math.hypot(dx, dz) || 1;
  const nx = (-dz / length) * (road.width / 2);
  const nz = (dx / length) * (road.width / 2);
  const y = road.y;

  const vertices = new Float32Array([
    road.start[0] + nx,
    y,
    road.start[2] + nz,
    road.start[0] - nx,
    y,
    road.start[2] - nz,
    road.end[0] + nx,
    y,
    road.end[2] + nz,
    road.end[0] + nx,
    y,
    road.end[2] + nz,
    road.start[0] - nx,
    y,
    road.start[2] - nz,
    road.end[0] - nx,
    y,
    road.end[2] - nz
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}
