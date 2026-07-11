import { Edges } from "@react-three/drei";
import { useState, useMemo } from "react";
import * as THREE from "three";

import { latLngToScene } from "../utils/geo.js";
import { zoningColor } from "../utils/zoning.js";

export function BuildingMesh({ building, origin, selected, matched, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    building.footprint.forEach(([lat, lng], index) => {
      const [x, z] = latLngToScene([lat, lng], origin);
      if (index === 0) shape.moveTo(x, z);
      else shape.lineTo(x, z);
    });
    const extrude = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(building.height_m, 3),
      bevelEnabled: false
    });
    extrude.rotateX(-Math.PI / 2);
    extrude.computeVertexNormals();
    return extrude;
  }, [building, origin]);

  const color = selected
    ? "#e14f3f"
    : hovered
      ? "#f1d28a"
      : matched
        ? "#e8a93d"
        : zoningColor(building.zoning);
  const emissive = selected ? "#40120d" : matched ? "#33230a" : "#000000";

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(building);
      }}
    >
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={selected || matched ? 0.18 : 0}
        roughness={0.7}
        metalness={0.06}
      />
      {(selected || hovered) && <Edges color={selected ? "#4b1711" : "#705a24"} threshold={12} />}
    </mesh>
  );
}
