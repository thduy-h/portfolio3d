"use client";

import { RoundedBox } from "@react-three/drei";
import { CircuitTraces } from "./CircuitTraces";

export function SystemCore() {
  return (
    <group>
      <RoundedBox args={[0.92, 0.92, 0.65]} radius={0.07} smoothness={2}>
        <meshStandardMaterial
          color="#0A0D14"
          metalness={0.65}
          roughness={0.28}
        />
      </RoundedBox>
      <RoundedBox
        args={[0.74, 0.74, 0.04]}
        position={[0, 0, 0.35]}
        radius={0.03}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#111722"
          emissive="#315BFF"
          emissiveIntensity={0.35}
          metalness={0.5}
          roughness={0.23}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.375]}>
        <boxGeometry args={[0.5, 0.035, 0.015]} />
        <meshBasicMaterial color="#00C8FF" />
      </mesh>
      <group position={[0, 0, 0.39]} scale={0.7}>
        <CircuitTraces />
      </group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.5, 0, 0]}>
          <boxGeometry args={[0.06, 0.65, 0.3]} />
          <meshStandardMaterial
            color="#c1ccd8"
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}
