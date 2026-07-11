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
  const cancelFocusRef = useRef(() => {});
  const selectedFocus = useMemo(() => {
    if (selectedBuilding?.footprint?.length) {
      const points = selectedBuilding.footprint.map((point) => latLngToScene(point, origin));
      const x = points.reduce((sum, point) => sum + point[0], 0) / points.length;
      const z = points.reduce((sum, point) => sum + point[1], 0) / points.length;
      return {
        id: `building-${selectedBuilding.id}`,
        x,
        y: Math.max(10, selectedBuilding.height_m * 0.42),
        z,
        height: selectedBuilding.height_m,
        type: "building"
      };
    }
    if (selectedPermit?.center) {
      const [x, z] = latLngToScene(selectedPermit.center, origin);
      return { id: `permit-${selectedPermit.id}`, x, y: 12, z, height: 8, type: "permit" };
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

      <CameraFocus focus={selectedFocus} controlsRef={controlsRef} cancelFocusRef={cancelFocusRef} />
      <Environment preset="city" />
      <OrbitControls
        ref={controlsRef}
        target={[0, 30, 0]}
        minDistance={90}
        maxDistance={groundSize * 1.35}
        maxPolarAngle={1.35}
        onStart={() => cancelFocusRef.current()}
      />
    </Canvas>
  );
}

function CameraFocus({ focus, controlsRef, cancelFocusRef = { current: () => {} } }) {
  const { camera } = useThree();
  const targetGoal = useRef(new THREE.Vector3());
  const cameraGoal = useRef(new THREE.Vector3());
  const active = useRef(false);
  const lastFocusId = useRef(null);

  useEffect(() => {
    cancelFocusRef.current = () => {
      active.current = false;
    };
    return () => {
      if (cancelFocusRef) {
        cancelFocusRef.current = () => {};
      }
    };
  }, [cancelFocusRef]);

  useEffect(() => {
    if (!focus) {
      active.current = false;
      lastFocusId.current = null;
      return;
    }
    if (lastFocusId.current === focus.id) return;

    const focusPoint = new THREE.Vector3(focus.x, focus.y, focus.z);
    const controls = controlsRef.current;
    const currentTarget = controls?.target?.clone() ?? new THREE.Vector3(0, 30, 0);
    const viewDirection = camera.position.clone().sub(focusPoint);
    if (viewDirection.lengthSq() < 1) {
      viewDirection.set(0.65, 0.42, 0.65);
    }
    viewDirection.normalize();
    if (viewDirection.y < 0.18) {
      viewDirection.y = 0.24;
      viewDirection.normalize();
    }

    const comfortableDistance = focus.type === "building"
      ? THREE.MathUtils.clamp((focus.height ?? 30) * 1.35, 92, 170)
      : 105;
    const currentDistance = camera.position.distanceTo(focusPoint);
    const distanceChange = currentDistance - comfortableDistance;
    const nextDistance = currentDistance > comfortableDistance
      ? currentDistance - Math.min(distanceChange, 190)
      : currentDistance + Math.min(Math.abs(distanceChange), 45);

    cameraGoal.current.copy(focusPoint).addScaledVector(viewDirection, nextDistance);
    targetGoal.current.copy(currentTarget).lerp(focusPoint, 0.72);
    lastFocusId.current = focus.id;
    active.current = true;
  }, [camera, controlsRef, focus]);

  useFrame(() => {
    if (!active.current) return;
    camera.position.lerp(cameraGoal.current, 0.13);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetGoal.current, 0.13);
      controlsRef.current.update();
    }
    if (camera.position.distanceTo(cameraGoal.current) < 0.7) {
      active.current = false;
    }
  });

  return null;
}
