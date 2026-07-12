import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";

import roadData from "../data/roads.json";
import { latLngToScene } from "../utils/geo.js";

const ROAD_STYLE = {
  primary: { color: "#7a6f5f", width: 4.6, opacity: 0.72 },
  secondary: { color: "#867b6b", width: 4.2, opacity: 0.7 },
  tertiary: { color: "#928779", width: 3.7, opacity: 0.68 },
  residential: { color: "#a0988d", width: 2.8, opacity: 0.58 },
  unclassified: { color: "#a0988d", width: 2.8, opacity: 0.55 },
  service: { color: "#b0a99f", width: 2.1, opacity: 0.48 },
  pedestrian: { color: "#9b8a67", width: 2.4, opacity: 0.58 },
  living_street: { color: "#9b8a67", width: 2.4, opacity: 0.56 }
};

const LABEL_NAMES = new Set([
  "Stephen Avenue Walk",
  "7 Avenue Southwest",
  "6 Avenue Southwest",
  "4 Street Southwest",
  "Centre Street South"
]);

const ROAD_Y = 0.85;
const LABEL_Y = 1.35;

export function RoadLayer({ origin }) {
  const roads = useMemo(
    () =>
      roadData.roads
        .map((road) => ({
          ...road,
          style: ROAD_STYLE[road.kind] ?? ROAD_STYLE.residential,
          points: road.path.map((point) => {
            const [x, z] = latLngToScene(point, origin);
            return [x, ROAD_Y, z];
          })
        }))
        .filter((road) => road.points.length > 1),
    [origin]
  );

  const labels = useMemo(() => {
    const seen = new Set();
    return roads.filter((road) => {
      if (!LABEL_NAMES.has(road.name) || seen.has(road.name)) return false;
      seen.add(road.name);
      return true;
    });
  }, [roads]);

  return (
    <group>
      {roads.map((road) => (
        <Line
          key={road.id}
          points={road.points}
          color={road.style.color}
          lineWidth={road.style.width}
          transparent
          opacity={road.style.opacity}
          depthWrite={false}
          depthTest
          renderOrder={4}
        />
      ))}
      {labels.map((road) => (
        <RoadLabel key={`label-${road.id}`} road={road} />
      ))}
    </group>
  );
}

function RoadLabel({ road }) {
  const middle = road.points[Math.floor(road.points.length / 2)];

  return (
    <Html position={[middle[0], LABEL_Y, middle[2]]} center distanceFactor={44}>
      <span className="roadLabel">{shortName(road.name)}</span>
    </Html>
  );
}

function shortName(name) {
  return name
    .replace("Southwest", "SW")
    .replace("Southeast", "SE")
    .replace("Avenue Walk", "Ave");
}
