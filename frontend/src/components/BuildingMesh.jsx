import { useMemo } from "react";
import * as THREE from "three";

import { latLngToScene } from "../utils/geo.js";
import { zoningColor } from "../utils/zoning.js";

export function BuildingMesh({ building, origin, selected, matched, onSelect }) {
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

  const color = selected ? "#f15b4a" : matched ? "#f6b84f" : zoningColor(building.zoning);

  return (
    <mesh
      geometry={geometry}
      castShadow
      receiveShadow
      onClick={(event) => {
        event.stopPropagation();
        onSelect(building);
      }}
    >
      <meshStandardMaterial color={color} roughness={0.72} metalness={0.08} />
    </mesh>
  );
}
