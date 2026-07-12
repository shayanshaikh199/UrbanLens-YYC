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
        <cylinderGeometry args={[0.34, 0.34, 8.6, 18]} />
        <meshStandardMaterial
          color={active ? "#b8e6ff" : "#6ecbff"}
          depthTest={false}
          depthWrite={false}
          emissive="#145c86"
          emissiveIntensity={active ? 0.58 : 0.36}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, 4.9, 0]} castShadow>
        <boxGeometry args={[3.35, 1.55, 3.35]} />
        <meshStandardMaterial
          color={active ? "#ecf8ff" : "#d9f0ff"}
          depthTest={false}
          depthWrite={false}
          emissive="#1f6f9e"
          emissiveIntensity={active ? 0.34 : 0.2}
          roughness={0.44}
        />
      </mesh>
      <mesh position={[0, 6.05, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
        <ringGeometry args={[1.65, 2.1, 4]} />
        <meshBasicMaterial color="#20a8f2" depthTest={false} depthWrite={false} transparent opacity={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4.35, 0]}>
        <ringGeometry args={[2.35, 3.05, 32]} />
        <meshBasicMaterial
          color="#5ec7ff"
          depthTest={false}
          depthWrite={false}
          transparent
          opacity={active ? 0.76 : 0.48}
        />
      </mesh>
      <Html position={[0, 8.25, 0]} center distanceFactor={18}>
        <div className={active ? "transitLabel isActive" : "transitLabel"}>
          <strong>{stop.name}</strong>
          <span>{stop.type}</span>
        </div>
      </Html>
    </group>
  );
}
