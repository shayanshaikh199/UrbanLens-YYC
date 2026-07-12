import { Html } from "@react-three/drei";
import { useState } from "react";

export function TransitMarker({ stop, position }) {
  const [hovered, setHovered] = useState(false);
  const active = hovered;

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
      >
        <cylinderGeometry args={[1.15, 1.15, 0.55, 32]} />
        <meshStandardMaterial
          color={active ? "#9edbff" : "#5fb7ef"}
          emissive="#145c86"
          emissiveIntensity={active ? 0.4 : 0.24}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[2.25, 1.15, 2.25]} />
        <meshStandardMaterial
          color={active ? "#ecf8ff" : "#d9f0ff"}
          emissive="#1f6f9e"
          emissiveIntensity={active ? 0.22 : 0.12}
          roughness={0.44}
        />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[1.1, 1.42, 4]} />
        <meshBasicMaterial color="#0f6fa5" transparent opacity={0.86} />
      </mesh>
      {active ? (
        <Html position={[0, 3.35, 0]} center distanceFactor={18}>
          <div className="transitLabel">
            <strong>{stop.name}</strong>
            <span>{stop.type}</span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
