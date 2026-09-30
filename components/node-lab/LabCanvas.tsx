"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls, useGLTF } from "@react-three/drei";
import { memo, Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { FrontSide, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

type Props = { explode: number; focus: boolean; statsRef: RefObject<HTMLOutputElement | null> };
const AXES: Record<string, [number, number, number]> = {
  FACE_WEB: [0,0,1], FACE_API: [0,0,-1], FACE_AI: [1,0,0],
  FACE_DATA: [-1,0,0], FACE_SYSTEM: [0,1,0], FACE_INFRA: [0,-1,0],
};
const StudioEnvironment = memo(function StudioEnvironment() {
  return <Environment frames={1} resolution={128}>
    <color attach="background" args={["#bfc8d3"]} />
    <Lightformer position={[0,5,0]} rotation={[Math.PI/2,0,0]} scale={[8,5,1]} intensity={2} />
    <Lightformer position={[4,1,3]} rotation={[0,-Math.PI/3,0]} scale={[2,6,1]} intensity={3} />
    <Lightformer position={[-4,0,2]} rotation={[0,Math.PI/3,0]} scale={[2,5,1]} intensity={2} />
  </Environment>;
});

function AuthoredAsset({ explode, focus }: Props) {
  const { scene } = useGLTF("/models/node-7388.glb");
  const assemblies = useMemo(() => {
    const root = scene.getObjectByName("NODE_7388");
    if (!root) throw new Error("NODE_7388 semantic root missing");
    const materials = new Map<string, MeshStandardMaterial>();
    return root.children.map(source => {
      const object = source.clone(true);
      const rest = object.position.toArray();
      object.position.set(0,0,0);
      const receded = focus && source.name !== "FACE_WEB" && source.name !== "SYS_CORE";
      object.traverse(child => {
        if (!(child instanceof Mesh)) return;
        const sourceMaterial = child.material as MeshStandardMaterial;
        const key = `${sourceMaterial.name}/${receded}`;
        let material = materials.get(key);
        if (!material) {
          material = sourceMaterial.clone();
          material.side = FrontSide;
          if (material.name === "MAT_CHROME") { material.roughness = .19; material.envMapIntensity = 1.35; }
          if (material.name === "MAT_GRAPHITE") { material.color.set("#101827"); material.roughness = .34; material.metalness = .30; }
          if (material.name === "MAT_PCB") { material.color.set("#0a202d"); material.emissiveIntensity = 1.15; material.roughness = .40; }
          if (material.name === "MAT_CIRCUIT") { material.emissiveIntensity = 1.65; }
          if (material.name === "MAT_ACRYLIC" || material.name === "MAT_SMOKED_GLASS") {
            // Lightweight review approximation: physical reflections with alpha
            // coverage; no stacked full-scene transmission passes or fake bloom.
            const glass = new MeshPhysicalMaterial({
              name: material.name, color: material.name === "MAT_ACRYLIC" ? "#d9f1ff" : "#536a87",
              transparent: true, opacity: material.name === "MAT_ACRYLIC" ? .22 : .32,
              roughness: .10, metalness: .12, clearcoat: 1, clearcoatRoughness: .08,
              depthWrite: false, transmission: 0, thickness: .055, ior: 1.46,
            });
            material.dispose(); material = glass;
          }
          if (receded) { material.transparent = true; material.opacity *= .48; material.depthWrite = false; }
          materials.set(key, material);
        }
        child.material = material;
      });
      return { object, name: source.name, rest };
    });
  }, [scene, focus]);
  useEffect(() => () => {
    const owned = new Set<MeshStandardMaterial>();
    assemblies.forEach(({ object }) => object.traverse(child => {
      if (child instanceof Mesh) owned.add(child.material as MeshStandardMaterial);
    }));
    owned.forEach(material => material.dispose());
  }, [assemblies]);
  return <group>
    {assemblies.map(({ object, name, rest }) => {
      const axis = AXES[name] ?? [0,0,0];
      const distance = focus ? (name === "FACE_WEB" ? 1.5 : .95) : explode;
      return <group key={name} name={`LAB_${name}`}
        rotation={focus && name === "FACE_WEB" ? [-.28,.40,0] : [0,0,0]}
        position={axis.map((n,i) => rest[i] + n * distance) as [number,number,number]}>
        <primitive object={object} />
      </group>;
    })}
  </group>;
}

function RenderMetrics({ statsRef }: Pick<Props, "statsRef">) {
  const { gl, scene, camera, invalidate } = useThree();
  const warmup = useRef(0);
  useFrame(() => {
    gl.info.reset(); gl.render(scene, camera);
    if (gl.info.render.triangles > 100 && warmup.current < 3) { warmup.current++; invalidate(); }
    const output = statsRef.current;
    if (output) {
      output.textContent = `${gl.info.render.triangles.toLocaleString("en-US")} submitted triangles · ${gl.info.render.calls} draw calls · DPR ${gl.getPixelRatio()}`;
      output.dataset.triangles = String(gl.info.render.triangles);
      output.dataset.calls = String(gl.info.render.calls);
    }
  }, 1);
  return null;
}
export default function LabCanvas(props: Props) {
  return <Canvas frameloop="demand" dpr={[1,1.5]} camera={{ position:[5,3.6,6.8], fov:43, near:.1, far:50 }}
    gl={{ antialias:true, alpha:false }} fallback={<p className="p-8">WebGL unavailable. See the hierarchy report.</p>}>
    <color attach="background" args={["#F4F7FA"]} />
    <ambientLight intensity={.6} />
    <directionalLight position={[4,6,8]} intensity={2.5} />
    <directionalLight position={[-4,2,-3]} intensity={1.2} color="#c8e5ff" />
    <StudioEnvironment />
    <Suspense fallback={null}><AuthoredAsset {...props} /></Suspense>
    <OrbitControls makeDefault enableDamping={false} minDistance={4} maxDistance={16} />
    <RenderMetrics statsRef={props.statsRef} />
  </Canvas>;
}
