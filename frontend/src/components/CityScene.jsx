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
      <ambientLight intensity={0.56} />
      <directionalLight
        castShadow
        position={[90, 190, 100]}
        intensity={1.08}
        shadow-mapSize={[2048, 2048]}
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
