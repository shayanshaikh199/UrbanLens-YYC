import { OrbitControls } from "@react-three/drei";
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
  const visualGroundSize = groundSize * 2.35;
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
      camera={{ position: cameraPosition, fov: 46, far: groundSize * 5 }}
      onPointerMissed={onClearSelection}
    >
      <color attach="background" args={[sun.backgroundColor]} />
      <fog attach="fog" args={[sun.fogColor, groundSize * 1.2, groundSize * 3.4]} />
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
      {sun.sunOpacity > 0.04 ? (
        <mesh position={sun.position}>
          <sphereGeometry args={[groundSize * 0.045, 32, 32]} />
          <meshBasicMaterial color={sun.sunDiskColor} transparent opacity={sun.sunOpacity} fog={false} />
        </mesh>
      ) : null}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[visualGroundSize, visualGroundSize]} />
        <meshStandardMaterial color={sun.groundColor} roughness={0.92} />
      </mesh>

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

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        screenSpacePanning={false}
        target={[0, 30, 0]}
        minDistance={90}
        maxDistance={groundSize * 1.22}
        maxPolarAngle={1.35}
        rotateSpeed={0.72}
        panSpeed={0.85}
        zoomSpeed={0.78}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
      />
    </Canvas>
  );
}

function sunStateForHour(hour, groundSize) {
  const normalizedHour = ((hour % 24) + 24) % 24;
  const sunriseRamp = smoothstep(4.75, 9, normalizedHour);
  const sunsetRamp = 1 - smoothstep(16, 22.25, normalizedHour);
  const daylight = Math.min(sunriseRamp, sunsetRamp);
  const morningWarmth = (1 - smoothstep(7.5, 10.5, normalizedHour)) * sunriseRamp;
  const eveningWarmth = smoothstep(15.5, 20.75, normalizedHour);
  const warmth = Math.max(morningWarmth, eveningWarmth);
  const azimuth = normalizedHour / 24 * Math.PI * 2 - Math.PI * 0.65;
  const radius = groundSize * 0.94;
  const elevation = THREE.MathUtils.lerp(groundSize * 0.26, groundSize * 0.92, daylight);
  const position = [
    Math.cos(azimuth) * radius,
    elevation,
    Math.sin(azimuth) * radius
  ];
  const moonPosition = [-position[0] * 0.72, groundSize * 0.38, -position[2] * 0.72];
  const dusk = smoothstep(0.02, 0.42, warmth) * (1 - smoothstep(0.65, 0.95, daylight));
  const dayColor = mixColor("#151c1b", "#34403e", daylight);
  const warmSky = mixColor(dayColor, "#42311f", dusk);
  const groundBase = mixColor("#121715", "#27312e", daylight);
  const warmGround = mixColor(groundBase, "#3a3327", dusk * 0.65);
  const directWarm = mixColor("#7b93b2", "#f2dfbd", daylight);

  return {
    position,
    moonPosition,
    shadowsActive: daylight > 0.16,
    backgroundColor: warmSky,
    fogColor: warmSky,
    groundColor: warmGround,
    ambientColor: mixColor("#8aa1b5", "#f4ead7", daylight),
    ambientIntensity: THREE.MathUtils.lerp(0.14, 0.42, daylight),
    hemiIntensity: THREE.MathUtils.lerp(0.08, 0.28, daylight),
    skyColor: mixColor("#172338", "#d8c7a8", daylight),
    groundLightColor: mixColor("#101615", "#2f352d", daylight),
    directColor: mixColor(directWarm, "#f0a866", dusk),
    directIntensity: THREE.MathUtils.lerp(0.06, 1.25, daylight),
    moonIntensity: THREE.MathUtils.lerp(0.3, 0, daylight),
    sunDiskColor: mixColor("#f4f4ef", "#f0a866", dusk),
    sunOpacity: THREE.MathUtils.clamp(daylight * 0.95 + dusk * 0.2, 0, 0.95)
  };
}

function smoothstep(edge0, edge1, value) {
  const t = THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mixColor(from, to, amount) {
  return new THREE.Color(from).lerp(new THREE.Color(to), THREE.MathUtils.clamp(amount, 0, 1)).getStyle();
}
