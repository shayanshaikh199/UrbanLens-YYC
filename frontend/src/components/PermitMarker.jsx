import { Html } from "@react-three/drei";

export function PermitMarker({ permit, position, onSelect }) {
  return (
    <group position={position}>
      <mesh
        castShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect(permit);
        }}
      >
        <cylinderGeometry args={[1.2, 1.2, 20, 16]} />
        <meshStandardMaterial color="#167c80" roughness={0.5} />
      </mesh>
      <mesh position={[0, 12, 0]} castShadow>
        <sphereGeometry args={[3.6, 20, 20]} />
        <meshStandardMaterial color="#f15b4a" emissive="#54130e" emissiveIntensity={0.25} />
      </mesh>
      <Html position={[0, 18, 0]} center distanceFactor={16}>
        <button className="pinLabel" onClick={() => onSelect(permit)}>
          Permit
        </button>
      </Html>
    </group>
  );
}
