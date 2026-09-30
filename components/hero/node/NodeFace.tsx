"use client";

import { RoundedBox } from "@react-three/drei";
import { CircuitTraces } from "./CircuitTraces";

export function NodeFace() {
  return (
    <group>
      {/* Open center exposes SYS_CORE instead of hiding it behind a solid motherboard. */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[0, side * 0.93, -0.035]}>
            <boxGeometry args={[2.12, 0.25, 0.06]} />
            <meshStandardMaterial
              color="#111722"
              metalness={0.5}
              roughness={0.38}
            />
          </mesh>
          <mesh position={[side * 0.96, 0, -0.035]}>
            <boxGeometry args={[0.19, 1.64, 0.06]} />
            <meshStandardMaterial
              color="#111722"
              metalness={0.5}
              roughness={0.38}
            />
          </mesh>
          <RoundedBox
            args={[2.3, 0.048, 0.08]}
            radius={0.02}
            smoothness={2}
            position={[0, side * 1.13, 0]}
          >
            <meshStandardMaterial
              color="#c5d5df"
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>
          <RoundedBox
            args={[0.048, 2.3, 0.08]}
            radius={0.02}
            smoothness={2}
            position={[side * 1.13, 0, 0]}
          >
            <meshStandardMaterial
              color="#c5d5df"
              metalness={0.9}
              roughness={0.2}
            />
          </RoundedBox>
          <mesh position={[side * 0.75, 0.92, 0.025]}>
            <boxGeometry args={[0.24, 0.09, 0.06]} />
            <meshStandardMaterial
              color="#8495a8"
              metalness={0.8}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
      <group position={[0, 0, 0.055]}>
        <CircuitTraces />
      </group>
      <RoundedBox
        args={[2.2, 2.2, 0.025]}
        radius={0.045}
        smoothness={2}
        position={[0, 0, 0.08]}
      >
        <meshPhysicalMaterial
          color="#daeeff"
          transparent
          opacity={0.12}
          metalness={0.08}
          roughness={0.13}
          clearcoat={1}
          depthWrite={false}
        />
      </RoundedBox>
    </group>
  );
}
