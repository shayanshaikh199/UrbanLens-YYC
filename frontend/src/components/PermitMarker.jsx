import { Html } from "@react-three/drei";
import { useState } from "react";

export function PermitMarker({ permit, position, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || selected;
  const color = selected ? "#d94f3d" : hovered ? "#f1b34c" : statusColor(permit.status);
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
        <cylinderGeometry args={[0.22, 0.22, 5.8, 10]} />
        <meshStandardMaterial color="#1a5559" roughness={0.55} />
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
        <sphereGeometry args={[active ? 1.5 : 1.05, 18, 18]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#3c100c" : "#082326"}
          emissiveIntensity={active ? 0.25 : 0.1}
          roughness={0.42}
        />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]}>
          <ringGeometry args={[2.2, 2.75, 28]} />
          <meshBasicMaterial color="#d94f3d" transparent opacity={0.48} />
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
  if (value.includes("ISSUED") || value.includes("RELEASED")) return "#2f8f64";
  if (value.includes("PENDING") || value.includes("REVIEW")) return "#b6812d";
  if (value.includes("REFUSED") || value.includes("CANCELLED")) return "#7b8791";
  return "#227b7f";
}
