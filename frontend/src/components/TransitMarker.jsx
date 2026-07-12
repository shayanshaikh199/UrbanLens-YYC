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
        <cylinderGeometry args={[0.22, 0.22, 4.4, 12]} />
        <meshStandardMaterial
          color={active ? "#f4d6ff" : "#d6a6ee"}
          depthWrite={false}
          emissive="#4e2168"
          emissiveIntensity={active ? 0.36 : 0.2}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0, 2.72, 0]} castShadow>
        <boxGeometry args={[2.15, 1.2, 1.15]} />
        <meshStandardMaterial
          color={active ? "#fff3c6" : "#f0c75f"}
          depthWrite={false}
          emissive="#7a5413"
          emissiveIntensity={active ? 0.28 : 0.16}
          roughness={0.42}
        />
      </mesh>
      <mesh position={[0, 3.48, 0]}>
        <sphereGeometry args={[0.82, 20, 20]} />
        <meshStandardMaterial
          color={active ? "#f7dcff" : "#c778ee"}
          depthWrite={false}
          emissive="#67298b"
          emissiveIntensity={active ? 0.38 : 0.24}
          roughness={0.38}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <ringGeometry args={[1.25, 1.7, 28]} />
        <meshBasicMaterial
          color="#d78fff"
          depthWrite={false}
          transparent
          opacity={active ? 0.6 : 0.36}
        />
      </mesh>
      <Html position={[0, 4.85, 0]} center distanceFactor={24} occlude>
        <div className={active ? "transitLabel isActive" : "transitLabel"}>
          <strong>BUS</strong>
          <span>{stop.type}</span>
        </div>
      </Html>
    </group>
  );
}
