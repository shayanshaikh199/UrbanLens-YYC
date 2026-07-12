import { Html } from "@react-three/drei";
import { useState } from "react";

export function PermitMarker({ permit, position, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered || selected;
  const color = selected ? "#ffffff" : hovered ? "#8fdcff" : "#3aa7e0";
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
        <cylinderGeometry args={[0.32, 0.32, 6.6, 12]} />
        <meshStandardMaterial color="#fff7de" emissive="#55441f" emissiveIntensity={0.18} roughness={0.5} />
      </mesh>
      <mesh
        position={[0, 4.65, 0]}
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
        <sphereGeometry args={[active ? 2.45 : 1.75, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={selected ? "#ffffff" : "#0a5d86"}
          emissiveIntensity={active ? 0.44 : 0.26}
          roughness={0.48}
        />
      </mesh>
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.1, 0]}>
          <ringGeometry args={[2.7, 3.35, 32]} />
          <meshBasicMaterial color="#8fdcff" transparent opacity={0.72} />
        </mesh>
      )}
      {active && (
        <Html position={[0, 8.4, 0]} center distanceFactor={18}>
          <button className={selected ? "pinLabel isSelected" : "pinLabel"} onClick={() => onSelect(permit)}>
            {status}
          </button>
        </Html>
      )}
    </group>
  );
}
