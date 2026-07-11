import { Html } from "@react-three/drei";
import { useState } from "react";

export function PermitMarker({ permit, position, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || selected;
  const color = selected ? "#b84332" : hovered ? "#d79c3a" : statusColor(permit.status);
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
        <cylinderGeometry args={[0.16, 0.16, 4.8, 10]} />
        <meshStandardMaterial color="#174f54" roughness={0.62} />
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
        <sphereGeometry args={[active ? 1.28 : 0.92, 18, 18]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#36110d" : "#061f22"}
          emissiveIntensity={active ? 0.2 : 0.06}
          roughness={0.48}
        />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]}>
          <ringGeometry args={[1.85, 2.35, 28]} />
          <meshBasicMaterial color="#b84332" transparent opacity={0.42} />
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
  if (value.includes("ISSUED") || value.includes("RELEASED")) return "#2f7d5d";
  if (value.includes("PENDING") || value.includes("REVIEW")) return "#a9792a";
  if (value.includes("REFUSED") || value.includes("CANCELLED")) return "#747f86";
  return "#1f7578";
}
