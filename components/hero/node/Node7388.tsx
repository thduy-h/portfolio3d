"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useNodeProgress } from "./NodeProgress";

const ASSET_URL = "/models/node-7388.glb";
const axes: Record<string, THREE.Vector3Tuple> = {
  FACE_WEB:[0,0,1], FACE_API:[0,0,-1], FACE_AI:[1,0,0],
  FACE_DATA:[-1,0,0], FACE_SYSTEM:[0,1,0], FACE_INFRA:[0,-1,0],
};

export function Node7388() {
  const { scene } = useGLTF(ASSET_URL);
  const progressRef = useNodeProgress();
  const { gl, viewport, camera } = useThree();
  const assembly = useRef<THREE.Group>(null);
  const web = useRef<THREE.Group>(null);
  const plate = useRef<THREE.Group>(null);
  const screen = useRef<THREE.Mesh>(null);
  const asset = useMemo(() => {
    const source = scene.getObjectByName("NODE_7388");
    if (!source) throw new Error("Missing NODE_7388 root");
    const owned: THREE.MeshStandardMaterial[] = [];
    const parts = source.children.map(original => {
      const object = original.clone(true);
      const rest = original.position.clone();
      const materials = new Map<string, THREE.MeshStandardMaterial>();
      object.traverse(child => {
        if (!(child instanceof THREE.Mesh)) return;
        const input = child.material as THREE.MeshStandardMaterial;
        let material = materials.get(input.name);
        if (!material) {
          material = input.clone();
          material.side = THREE.FrontSide;
          material.transparent = true;
          material.forceSinglePass = true;
          if (input.name === "MAT_CHROME") { material.roughness=.21; material.envMapIntensity=1.25; }
          if (input.name === "MAT_GRAPHITE") { material.color.set("#101827"); material.roughness=.34; material.metalness=.30; }
          if (input.name === "MAT_PCB") { material.color.set("#0a202d"); material.emissiveIntensity=1.1; material.roughness=.4; }
          if (input.name === "MAT_CIRCUIT") material.emissiveIntensity=1.45;
          if (input.name === "MAT_ACRYLIC" || input.name === "MAT_SMOKED_GLASS") {
            material.dispose();
            material = new THREE.MeshPhysicalMaterial({
              name: input.name, color: input.name === "MAT_ACRYLIC" ? "#d9f1ff" : "#536a87",
              transparent:true, opacity:input.name === "MAT_ACRYLIC" ? .18 : .27,
              roughness:.12, metalness:.1, clearcoat:1, clearcoatRoughness:.09,
              depthWrite:false, transmission:0, thickness:.055, ior:1.46,
            });
          }
          material.userData.baseOpacity=material.opacity;
          materials.set(input.name,material); owned.push(material);
        }
        child.material=material;
      });
      return { object, rest, axis: new THREE.Vector3(...(axes[original.name] ?? [0,0,0])), materials:[...materials.values()] };
    });
    const front=parts.find(p=>p.object.name==="FACE_WEB");
    if (!front) throw new Error("Missing FACE_WEB");
    const anchor=front.object.getObjectByName("WEB_SCREEN_ANCHOR");
    if (!anchor) throw new Error("Missing WEB_SCREEN_ANCHOR");
    const anchorPosition=anchor.position.clone();
    const anchorRotation=anchor.quaternion.clone();
    const width=Number(anchor.userData.usable_width), height=Number(anchor.userData.usable_height);
    if (!(width>0 && height>0)) throw new Error("Invalid WEB anchor bounds");
    front.object.position.set(0,0,0);
    return { parts, front, anchorPosition, anchorRotation, width, height, owned };
  },[scene]);
  const assetRef=useRef<typeof asset | null>(null);
  useEffect(()=>{
    assetRef.current=asset;
    return ()=>{ assetRef.current=null; asset.owned.forEach(material=>material.dispose()); };
  },[asset]);
  const scratch=useMemo(()=>({
    orientation:new THREE.Quaternion().setFromEuler(new THREE.Euler(.28,-.48,.02)),
    identity:new THREE.Quaternion(), from:new THREE.Vector3(), destination:new THREE.Vector3(),
    offset:new THREE.Vector3(),
  }),[]);
  useFrame(()=>{
    const asset=assetRef.current;
    if (!asset) return;
    const p=progressRef.current, e=p.explode, f=p.focus;
    for (const part of asset.parts) {
      if (part===asset.front) continue;
      const extra = part.axis.x !== 0 ? 3.5 : 1.2;
      part.object.position.copy(part.rest).addScaledVector(part.axis,e*1.2+f*extra);
      for (const material of part.materials) material.setValues({opacity:material.userData.baseOpacity*(1-f*.72)});
    }
    if (assembly.current) assembly.current.position.z=-f*.65;
    if (!web.current || !plate.current || !screen.current) return;
    const canvas=gl.domElement.getBoundingClientRect();
    const target=p.target?.getBoundingClientRect();
    if (canvas.width===0) return;
    const units=viewport.width/canvas.width;
    const width=target ? target.width*units : 4;
    const height=target ? target.height*units : 2.25;
    const plateScale=1+f*.12;
    scratch.from.copy(asset.front.rest).addScaledVector(asset.front.axis,e*1.2).applyQuaternion(scratch.orientation);
    scratch.destination.set(
      target ? (target.left+target.width/2-canvas.left-canvas.width/2)*units : 0,
      target ? -(target.top+target.height/2-canvas.top-canvas.height/2)*units : 0,
      4,
    );
    // Align the anchor, not an assumed cube center, with the measured DOM target.
    scratch.offset.copy(asset.anchorPosition).multiplyScalar(plateScale);
    scratch.destination.sub(scratch.offset);
    web.current.position.copy(scratch.from).lerp(scratch.destination,f);
    web.current.quaternion.copy(scratch.orientation).slerp(scratch.identity,f);
    plate.current.scale.setScalar(plateScale);
    const fade=1-THREE.MathUtils.smoothstep(f,.55,.98);
    for (const material of asset.front.materials) material.setValues({opacity:material.userData.baseOpacity*fade});
    plate.current.visible=f<.98;
    screen.current.visible=f>.35;
    screen.current.position.copy(asset.anchorPosition).multiplyScalar(plateScale);
    screen.current.quaternion.copy(asset.anchorRotation);
    screen.current.scale.set(THREE.MathUtils.lerp(asset.width,width,f),THREE.MathUtils.lerp(asset.height,height,f),1);
    (screen.current.material as THREE.Material).opacity=Math.max(0,(f-.35)/.65)*(1-p.handoff);
    web.current.visible=p.handoff<1;
    if (process.env.NODE_ENV==="development") {
      screen.current.updateWorldMatrix(true,false);
      const corner=(x:number,y:number)=>{
        const point=new THREE.Vector3(x,y,0).applyMatrix4(screen.current!.matrixWorld).project(camera);
        return [canvas.left+(point.x+1)*canvas.width/2,canvas.top+(1-point.y)*canvas.height/2];
      };
      gl.domElement.setAttribute("data-node-progress",JSON.stringify({explode:e,focus:f,handoff:p.handoff,calls:gl.info.render.calls,triangles:gl.info.render.triangles,screen:[corner(-.5,.5),corner(.5,-.5)]}));
    }
  });
  return <>
    <group ref={assembly} rotation={[.28,-.48,.02]}>
      {asset.parts.filter(p=>p!==asset.front).map(p=><primitive key={p.object.name} object={p.object} />)}
    </group>
    <group ref={web}>
      <group ref={plate}><primitive object={asset.front.object} /></group>
      <RoundedBox ref={screen} args={[1,1,.018]} radius={.014} smoothness={2}>
        <meshStandardMaterial color="#F4F7FA" emissive="#00C8FF" emissiveIntensity={.035} transparent opacity={0} metalness={.12} roughness={.32} />
      </RoundedBox>
    </group>
  </>;
}
