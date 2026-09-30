"use client";

import { useMemo } from "react";
import * as THREE from "three";

// One line draw per board: right-angle buses, contacts and chip outlines.
export function CircuitTraces() {
  const geometry = useMemo(() => {
    const points: number[] = [];
    const segment = (x: number, y: number, a: number, b: number) =>
      points.push(x, y, 0, a, b, 0);
    for (const sign of [-1, 1]) {
      for (let i = 0; i < 7; i++) {
        const y = (i - 3) * 0.18;
        const bend = sign * (0.57 + (i % 3) * 0.09);
        segment(sign * 0.28, y * 0.5, bend, y * 0.5);
        segment(bend, y * 0.5, bend, y);
        segment(bend, y, sign * 1.03, y);
        segment(sign * 1.03, y - 0.025, sign * 1.03, y + 0.025);
      }
    }
    return new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    );
  }, []);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#00C8FF" transparent opacity={0.68} />
    </lineSegments>
  );
}
