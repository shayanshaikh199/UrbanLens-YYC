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
    ? "#ffffff"
    : hovered
      ? "#f2eee4"
      : zoningColor(building.zoning);
  const emissive = selected ? "#ffffff" : matched ? "#ffffff" : "#000000";

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
        emissiveIntensity={selected ? 0.12 : matched ? 0.055 : 0.01}
        roughness={0.76}
        metalness={0.12}
      />
      {(selected || hovered || matched) && (
        <Edges
          color={selected || matched ? "#ffffff" : "#111111"}
          threshold={selected ? 6 : 14}
        />
      )}
    </mesh>
  );
}
