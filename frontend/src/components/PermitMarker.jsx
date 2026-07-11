import { Html } from "@react-three/drei";
import { useState } from "react";

export function PermitMarker({ permit, position, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || selected;
  const color = selected ? "#ffffff" : hovered ? "#ffe08a" : statusColor(permit.status);
  const status = permit.status && permit.status !== "UNKNOWN" ? permit.status : permit.permit_type;

  return (
    <group position={position}>
      <mesh
        castShadow
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
          onSelect(permit);
        }}
      >
        <cylinderGeometry args={[0.18, 0.18, 5.2, 10]} />
        <meshStandardMaterial color="#f4f1e8" emissive="#27251f" emissiveIntensity={0.12} roughness={0.58} />
      </mesh>
      <mesh
        position={[0, 3.8, 0]}
        castShadow
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
          onSelect(permit);
        }}
      >
        <sphereGeometry args={[active ? 1.42 : 1.04, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#ffffff" : "#2e2b20"}
          emissiveIntensity={active ? 0.28 : 0.14}
          roughness={0.48}
        />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]}>
          <ringGeometry args={[1.85, 2.35, 28]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.52} />
        </mesh>
      )}
      {active && (
        <Html position={[0, 7, 0]} center distanceFactor={18}>
          <button className={selected ? "pinLabel isSelected" : "pinLabel"} onClick={() => onSelect(permit)}>
            {status}
          </button>
        </Html>
      )}
    </group>
  );
}

function statusColor(status = "") {
  const value = status.toUpperCase();
  if (value.includes("ISSUED") || value.includes("RELEASED")) return "#7ee0a8";
  if (value.includes("PENDING") || value.includes("REVIEW")) return "#ffd166";
  if (value.includes("REFUSED") || value.includes("CANCELLED")) return "#c5cdd2";
  return "#78dce3";
}
