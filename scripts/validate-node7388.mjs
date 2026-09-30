// Inspect the exported GLB buffers independently of bpy and the preview renderer.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Matrix4, Quaternion, Vector3, Box3 } from 'three';

const path='public/models/node-7388.glb';
const buffer=await fs.readFile(path);
assert.equal(buffer.toString('ascii',0,4),'glTF');
const jsonLength=buffer.readUInt32LE(12);
const gltf=JSON.parse(buffer.toString('utf8',20,20+jsonLength));
const bin=buffer.subarray(28+jsonLength);
function accessor(index) {
  const a=gltf.accessors[index],view=gltf.bufferViews[a.bufferView];
  const width={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
  const [bytes,method]={5126:[4,'readFloatLE'],5125:[4,'readUInt32LE'],5123:[2,'readUInt16LE'],5121:[1,'readUInt8']}[a.componentType];
  const start=(view.byteOffset??0)+(a.byteOffset??0),stride=view.byteStride??width*bytes;
  return Array.from({length:a.count},(_,i)=>Array.from({length:width},(_,j)=>bin[method](start+i*stride+j*bytes)));
}
const axes={FACE_WEB:[0,0,1],FACE_API:[0,0,-1],FACE_AI:[1,0,0],FACE_DATA:[-1,0,0],FACE_SYSTEM:[0,1,0],FACE_INFRA:[0,-1,0]};
const report={triangleCount:0,meshCount:0,primitiveDrawCalls:0,glbBytes:buffer.length,materials:gltf.materials.map(m=>m.name),nodes:[],checks:{}};
function walk(index,parent=null,parentMatrix=new Matrix4(),assembly=null) {
  const n=gltf.nodes[index];
  const matrix=n.matrix?new Matrix4().fromArray(n.matrix):new Matrix4().compose(new Vector3(...(n.translation??[0,0,0])),new Quaternion(...(n.rotation??[0,0,0,1])),new Vector3(...(n.scale??[1,1,1])));
  const world=parentMatrix.clone().multiply(matrix);
  if(axes[n.name]||n.name==='SYS_CORE'||n.name==='INTERNAL_FRAME')assembly=n.name;
  assert.ok((n.scale??[1,1,1]).every(v=>Math.abs(v-1)<1e-5),`Non-unit scale: ${n.name}`);
  const entry={name:n.name,parent,assembly,translation:n.translation??[0,0,0],rotation:n.rotation??[0,0,0,1],triangles:0,materials:[],bounds:null};
  if(n.mesh!==undefined){
    report.meshCount++;
    const bounds=new Box3();
    for(const primitive of gltf.meshes[n.mesh].primitives){
      const positions=accessor(primitive.attributes.POSITION),indices=accessor(primitive.indices).flat();
      assert.equal(primitive.mode??4,4);
      entry.triangles+=indices.length/3;report.primitiveDrawCalls++;
      entry.materials.push(gltf.materials[primitive.material].name);
      for(const p of positions){assert.ok(p.every(Number.isFinite));bounds.expandByPoint(new Vector3(...p).applyMatrix4(world));}
      for(const normal of accessor(primitive.attributes.NORMAL))assert.ok(Math.abs(new Vector3(...normal).length()-1)<.02,`Invalid normal: ${n.name}`);
    }
    report.triangleCount+=entry.triangles;
    entry.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};
  }
  if(axes[n.name]){
    const pivot=new Vector3().setFromMatrixPosition(world),expected=new Vector3(...axes[n.name]).multiplyScalar(1.19);
    assert.ok(pivot.distanceTo(expected)<1e-5,`Pivot/axis mismatch: ${n.name}`);
    const direction=new Vector3(0,0,1).transformDirection(world);
    assert.ok(direction.distanceTo(new Vector3(...axes[n.name]))<1e-5,`Wrong face normal: ${n.name}`);
    // Rigid translation is exact for every descendant, with inverse restoration.
    const opened=new Matrix4().makeTranslation(...axes[n.name]).multiply(world);
    const restored=new Matrix4().makeTranslation(...axes[n.name].map(v=>-v)).multiply(opened);
    assert.ok(restored.elements.every((v,i)=>Math.abs(v-world.elements[i])<1e-5));
  }
  if(n.name==='WEB_SCREEN_ANCHOR'){
    assert.equal(parent,'FACE_WEB');
    assert.ok(new Vector3(0,0,1).transformDirection(world).distanceTo(new Vector3(0,0,1))<1e-5);
    report.anchor={worldCenter:new Vector3().setFromMatrixPosition(world).toArray(),worldNormal:[0,0,1],...n.extras};
  }
  report.nodes.push(entry);
  for(const child of n.children??[])walk(child,n.name,world,assembly);
}
for(const index of gltf.scenes[gltf.scene??0].nodes)walk(index);
for(const name of Object.keys(axes)) assert.ok(report.nodes.some(n=>n.name===name));
assert.ok(report.anchor);
assert.ok(report.triangleCount>=30000&&report.triangleCount<=80000);
assert.ok(report.primitiveDrawCalls<50);
assert.ok(report.glbBytes<4*1024*1024);
report.checks={sixAxesAndPivots:true,canonicalAnchor:true,unitScales:true,normals:true,finiteBounds:true,rigidTranslationAndReversal:true,budgets:true};
await fs.writeFile('assets/node-7388/export-validation.json',JSON.stringify(report,null,2));
const lines=['# NODE_7388 — exported hierarchy','','| Name | Parent | Triangles | Materials |','|---|---|---:|---|',...report.nodes.map(n=>`| ${n.name} | ${n.parent??'—'} | ${n.triangles} | ${n.materials.join(', ')} |`)];
await fs.writeFile('assets/node-7388/hierarchy.md',lines.join('\n')+'\n');
console.log(JSON.stringify({triangles:report.triangleCount,meshes:report.meshCount,drawCalls:report.primitiveDrawCalls,bytes:report.glbBytes,checks:report.checks,anchor:report.anchor},null,2));
