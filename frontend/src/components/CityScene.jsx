import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { latLngToScene } from "../utils/geo.js";
import { BuildingMesh } from "./BuildingMesh.jsx";
import { PermitMarker } from "./PermitMarker.jsx";

export function CityScene({
  buildings,
  permits,
  metadata,
  matchedIds,
  selectedBuilding,
  selectedPermit,
  showPermits,
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
  const controlsRef = useRef(null);
  const selectedFocus = useMemo(() => {
    if (selectedBuilding?.center) {
      const [x, z] = latLngToScene(selectedBuilding.center, origin);
      return { x, y: Math.max(14, selectedBuilding.height_m * 0.55), z };
    }
    if (selectedPermit?.center) {
      const [x, z] = latLngToScene(selectedPermit.center, origin);
      return { x, y: 12, z };
    }
    return null;
  }, [origin, selectedBuilding, selectedPermit]);
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
      <color attach="background" args={["#dfe8e6"]} />
      <fog attach="fog" args={["#dfe8e6", groundSize * 0.7, groundSize * 1.8]} />
      <ambientLight intensity={0.5} />
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

      <CameraFocus focus={selectedFocus} controlsRef={controlsRef} groundSize={groundSize} />
      <Environment preset="city" />
      <OrbitControls
        ref={controlsRef}
        target={[0, 30, 0]}
        minDistance={90}
        maxDistance={groundSize * 1.35}
        maxPolarAngle={1.35}
      />
    </Canvas>
  );
}

function CameraFocus({ focus, controlsRef, groundSize }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 30, 0));
  const cameraGoal = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!focus) return;
    target.current.set(focus.x, focus.y, focus.z);
    const distance = Math.max(120, Math.min(groundSize * 0.55, 230));
    cameraGoal.current.set(focus.x + distance * 0.52, focus.y + distance * 0.58, focus.z + distance * 0.72);
  }, [focus, groundSize]);

  useFrame(() => {
    if (!focus) return;
    camera.position.lerp(cameraGoal.current, 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(target.current, 0.1);
      controlsRef.current.update();
    }
  });

  return null;
}
