import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import { latLngToScene } from "../utils/geo.js";
import { BuildingMesh } from "./BuildingMesh.jsx";
import { PermitMarker } from "./PermitMarker.jsx";

export function CityScene({
  buildings,
  permits,
  metadata,
  matchedIds,
  selectedBuildingId,
  showPermits,
  onSelectBuilding,
  onSelectPermit
}) {
  const origin = metadata?.center ?? [51.0419, -114.0645];
  const groundSize = useMemo(() => {
    const count = Math.max(buildings.length, 1);
    return Math.max(280, Math.sqrt(count) * 44);
  }, [buildings.length]);

  return (
    <Canvas
      shadows
      camera={{ position: [120, 135, 180], fov: 42 }}
      onPointerMissed={() => onSelectBuilding(null)}
    >
      <color attach="background" args={["#dfe8e6"]} />
      <fog attach="fog" args={["#dfe8e6", 260, 620]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[80, 180, 90]}
        intensity={1.15}
        shadow-mapSize={[2048, 2048]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color="#eef1e8" roughness={0.9} />
      </mesh>
      <gridHelper args={[groundSize, 24, "#9fb0a9", "#c8d1cd"]} position={[0, 0.03, 0]} />

      <group>
        {buildings.map((building) => (
          <BuildingMesh
            key={building.id}
            building={building}
            origin={origin}
            selected={selectedBuildingId === building.id}
            matched={matchedIds.has(building.id)}
            onSelect={onSelectBuilding}
          />
        ))}
      </group>

      {showPermits
        ? permits.map((permit) => {
            const [x, z] = latLngToScene(permit.center, origin);
            return (
              <PermitMarker
                key={permit.id}
                permit={permit}
                position={new THREE.Vector3(x, 18, z)}
                onSelect={onSelectPermit}
              />
            );
          })
        : null}

      <Environment preset="city" />
      <OrbitControls target={[0, 18, 0]} minDistance={60} maxDistance={420} maxPolarAngle={1.35} />
    </Canvas>
  );
}
