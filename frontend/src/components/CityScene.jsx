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
  const sun = useMemo(
    () => sunStateForHour(sunHour, groundSize),
    [groundSize, sunHour]
  );
  const shadowExtent = groundSize * 0.62;
  const shadowsActive = shadowsEnabled && sun.shadowsActive;
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
      <color attach="background" args={[sun.backgroundColor]} />
      <fog attach="fog" args={[sun.fogColor, groundSize * 0.72, groundSize * 1.65]} />
      <ambientLight intensity={sun.ambientIntensity} color={sun.ambientColor} />
      <hemisphereLight args={[sun.skyColor, sun.groundLightColor, sun.hemiIntensity]} />
      <directionalLight
        castShadow={shadowsActive}
        position={sun.position}
        intensity={shadowsEnabled ? sun.directIntensity : sun.directIntensity * 0.55}
        color={sun.directColor}
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
      {sun.moonIntensity > 0 ? (
        <directionalLight
          position={sun.moonPosition}
          intensity={sun.moonIntensity}
          color="#9fb8d8"
        />
      ) : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize]} />
        <meshStandardMaterial color={sun.groundColor} roughness={0.92} />
      </mesh>
      <gridHelper args={[groundSize, 24, sun.gridPrimary, sun.gridSecondary]} position={[0, 0.03, 0]} />

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

      {sun.showEnvironment ? <Environment preset="city" /> : null}
      <OrbitControls
        target={[0, 30, 0]}
        minDistance={90}
        maxDistance={groundSize * 0.95}
        maxPolarAngle={1.35}
      />
    </Canvas>
  );
}

function sunStateForHour(hour, groundSize) {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const daylight = Math.max(0, Math.sin(((normalizedHour - 6) / 12) * Math.PI));
  const dawnDusk = normalizedHour >= 5 && normalizedHour < 8 || normalizedHour >= 17 && normalizedHour < 21;
  const night = daylight < 0.04;
  const azimuth = normalizedHour / 24 * Math.PI * 2 - Math.PI * 0.65;
  const radius = groundSize * 0.68;
  const elevation = THREE.MathUtils.lerp(groundSize * 0.12, groundSize * 0.92, daylight);
  const position = [
    Math.cos(azimuth) * radius,
    elevation,
    Math.sin(azimuth) * radius
  ];
  const moonPosition = [-position[0] * 0.72, groundSize * 0.38, -position[2] * 0.72];

  if (night) {
    return {
      position,
      moonPosition,
      shadowsActive: false,
      showEnvironment: false,
      backgroundColor: "#111817",
      fogColor: "#111817",
      groundColor: "#252d29",
      gridPrimary: "#43504a",
      gridSecondary: "#303a35",
      ambientColor: "#9fb8d8",
      ambientIntensity: 0.16,
      hemiIntensity: 0.08,
      skyColor: "#15213a",
      groundLightColor: "#1d2825",
      directColor: "#6f8dab",
      directIntensity: 0.04,
      moonIntensity: 0.32
    };
  }

  return {
    position,
    moonPosition,
    shadowsActive: daylight > 0.14,
    showEnvironment: daylight > 0.1,
    backgroundColor: dawnDusk ? "#c8bda5" : "#d7ddd8",
    fogColor: dawnDusk ? "#c8bda5" : "#d7ddd8",
    groundColor: dawnDusk ? "#ded8c5" : "#e8ece5",
    gridPrimary: dawnDusk ? "#9f927b" : "#9ca8a1",
    gridSecondary: dawnDusk ? "#c2b8a1" : "#c9d0ca",
    ambientColor: dawnDusk ? "#ffe1b4" : "#fffaf0",
    ambientIntensity: THREE.MathUtils.lerp(0.24, 0.48, daylight),
    hemiIntensity: THREE.MathUtils.lerp(0.2, 0.42, daylight),
    skyColor: dawnDusk ? "#ffd194" : "#e5f0ff",
    groundLightColor: dawnDusk ? "#776b54" : "#dfe8df",
    directColor: dawnDusk ? "#ffbf73" : "#fff4db",
    directIntensity: THREE.MathUtils.lerp(0.28, 1.55, daylight),
    moonIntensity: 0
  };
}
