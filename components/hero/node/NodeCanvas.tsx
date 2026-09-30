"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { Node7388 } from "./Node7388";
import { useNodeProgress } from "./NodeProgress";

function Ready({ onReady }: { onReady: () => void }) {
  const { invalidate, size } = useThree();
  const progressRef = useNodeProgress();
  useEffect(() => {
    const progress = progressRef.current;
    progress.invalidate = invalidate;
    invalidate();
    onReady();
    window.dispatchEvent(new Event("node-scene-ready"));
    return () => {
      progress.invalidate = () => {};
    };
  }, [invalidate, onReady, progressRef, size.width, size.height]);
  return null;
}

export default function NodeCanvas({
  onReady,
  onFailure,
}: {
  onReady: () => void;
  onFailure: () => void;
}) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 14], zoom: 86, near: 0.1, far: 60 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      resize={{ offsetSize: true }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onFailure();
          },
          { once: true },
        );
      }}
      style={{ background: "transparent", pointerEvents: "none" }}
    >
      <ambientLight intensity={.6} />
      <directionalLight position={[4, 6, 8]} intensity={2.5} color="#f7fcff" />
      <directionalLight position={[-5, 2, 3]} intensity={1.2} color="#c8e5ff" />
      <Environment frames={1} resolution={128}>
        <color attach="background" args={["#bfc8d3"]} />
        <Lightformer position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[8,5,1]} intensity={2} />
        <Lightformer position={[4,1,3]} rotation={[0,-Math.PI/3,0]} scale={[2,6,1]} intensity={3} />
        <Lightformer position={[-4,0,2]} rotation={[0,Math.PI/3,0]} scale={[2,5,1]} intensity={2} />
      </Environment>
      <Suspense fallback={null}>
        <Node7388 />
        <Ready onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
