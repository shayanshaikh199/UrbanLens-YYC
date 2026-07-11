import { Html } from "@react-three/drei";
import { useState } from "react";

export function PermitMarker({ permit, position, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || selected;
  const color = selected ? "#e14f3f" : hovered ? "#f1b34c" : "#227b7f";
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
        <cylinderGeometry args={[0.45, 0.45, 8, 12]} />
        <meshStandardMaterial color="#17575a" roughness={0.55} />
      </mesh>
      <mesh
        position={[0, 5.2, 0]}
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
        <sphereGeometry args={[active ? 2.15 : 1.55, 18, 18]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#3c100c" : "#082326"}
          emissiveIntensity={active ? 0.25 : 0.1}
          roughness={0.42}
        />
      </mesh>
      {active && (
        <Html position={[0, 10, 0]} center distanceFactor={18}>
          <button className={selected ? "pinLabel isSelected" : "pinLabel"} onClick={() => onSelect(permit)}>
            {status}
          </button>
        </Html>
      )}
    </group>
  );
}
