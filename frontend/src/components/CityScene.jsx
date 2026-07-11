import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import { latLngToScene } from "../utils/geo.js";
import { BuildingMesh } from "./BuildingMesh.jsx";
import { PermitMarker } from "./PermitMarker.jsx";
import { RoadLayer } from "./RoadLayer.jsx";

export function CityScene({
  buildings,
  permits,
  metadata,
  matchedIds,
  selectedBuilding,
  selectedPermit,
  showPermits,
  showRoads,
  sunHour,
  shadowsEnabled,
  onClearSelection,
  onSelectBuilding,
  onSelectPermit
}) {
  const origin = useMemo(() => metadata?.center ?? [51.0419, -114.0645], [metadata?.center]);
  const groundSize = useMemo(() => {
    if (!metadata?.bounds?.sw || !metadata?.bounds?.ne) {
      return Math.max(420, Math.sqrt(Math.max(buildings.length, 1)) * 58);
    }
    const [swX, swZ] = latLngToScene(metadata.bounds.sw, origin);
    const [neX, neZ] = latLngToScene(metadata.bounds.ne, origin);
    return Math.max(520, Math.abs(neX - swX), Math.abs(neZ - swZ)) + 180;
  }, [buildings.length, metadata, origin]);
  const cameraPosition = useMemo(
    () => [groundSize * 0.36, groundSize * 0.34, groundSize * 0.48],
    [groundSize]
  );
  const sunPosition = useMemo(
    () => sunPositionForHour(sunHour, groundSize),
    [groundSize, sunHour]
  );
  const shadowExtent = groundSize * 0.62;
  const visiblePermits = useMemo(() => {
    if (!showPermits) return [];
    const selectedId = selectedPermit?.id;
    return [...permits]
      .sort((a, b) => {
        if (a.id === selectedId) return -1;
        if (b.id === selectedId) return 1;
        return (b.estimated_project_cost ?? 0) - (a.estimated_project_cost ?? 0);
      })
      .slice(0, 45);
  }, [permits, selectedPermit?.id, showPermits]);

  return (
    <Canvas
      shadows
      camera={{ position: cameraPosition, fov: 46 }}
      onPointerMissed={onClearSelection}
    >
      <color attach="background" args={["#d7ddd8"]} />
      <ambientLight intensity={shadowsEnabled ? 0.38 : 0.62} />
      <directionalLight
        castShadow={shadowsEnabled}
        position={sunPosition}
        intensity={shadowsEnabled ? 1.35 : 0.92}
        shadow-mapSize={[3072, 3072]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={1}
        shadow-camera-far={groundSize * 2}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#e8ece5" roughness={0.92} />
      </mesh>
      <gridHelper args={[groundSize, 24, "#9ca8a1", "#c9d0ca"]} position={[0, 0.03, 0]} />

      {showRoads ? <RoadLayer origin={origin} /> : null}

      <group>
        {buildings.map((building) => (
          <BuildingMesh
            key={building.id}
            building={building}
            origin={origin}
            selected={selectedBuilding?.id === building.id}
            matched={matchedIds.has(building.id)}
            onSelect={onSelectBuilding}
          />
        ))}
      </group>

      {showPermits
        ? visiblePermits.map((permit) => {
            const [x, z] = latLngToScene(permit.center, origin);
            return (
              <PermitMarker
                key={permit.id}
                permit={permit}
                position={new THREE.Vector3(x, 4.2, z)}
                selected={selectedPermit?.id === permit.id}
                onSelect={onSelectPermit}
              />
            );
          })
        : null}

      <Environment preset="city" />
      <OrbitControls
        target={[0, 30, 0]}
        minDistance={90}
        maxDistance={groundSize * 0.95}
        maxPolarAngle={1.35}
      />
    </Canvas>
  );
}

function sunPositionForHour(hour, groundSize) {
  const progress = Math.min(1, Math.max(0, (hour - 7) / 12));
  const azimuth = THREE.MathUtils.lerp(-Math.PI * 0.82, Math.PI * 0.82, progress);
  const noonLift = Math.sin(progress * Math.PI);
  const elevation = THREE.MathUtils.lerp(0.22, 0.92, noonLift);
  const radius = groundSize * 0.62;

  return [
    Math.cos(azimuth) * radius,
    groundSize * elevation,
    Math.sin(azimuth) * radius
  ];
}
