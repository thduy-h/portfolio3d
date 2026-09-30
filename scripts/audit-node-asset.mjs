// Read-only geometry analysis; generated reports do not alter the source asset.
// Usage: node scripts/audit-node-asset.mjs /path/to/model.glb
import fs from 'node:fs';
import crypto from 'node:crypto';
import { Box3, DoubleSide, FrontSide, Raycaster, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const input = process.argv[2];
if (!input) throw new Error('Provide the downloaded GLB path');
const bytes = fs.readFileSync(input);
const source = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)));
const { scene } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
scene.updateMatrixWorld(true);
const bounds = new Box3().setFromObject(scene);
const center = bounds.getCenter(new Vector3());
const size = bounds.getSize(new Vector3());
const edge = Math.max(...size.toArray());
const tolerance = edge * 1e-6;
const round = (v) => v.toArray().map(x => Number(x.toFixed(8)));
const boxData = b => ({ min: round(b.min), max: round(b.max), size: round(b.getSize(new Vector3())) });
const axes = ['FACE_AI', 'FACE_DATA', 'FACE_SYSTEM', 'FACE_INFRA', 'FACE_WEB', 'FACE_API'];
const v = new Vector3();

function auditMesh(mesh) {
  const pos = mesh.geometry.attributes.position;
  const normal = mesh.geometry.attributes.normal;
  const index = mesh.geometry.index;
  const points = [], welded = [], lookup = new Map();
  let invalidNormals = 0;
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
    const p = v.clone();
    const key = p.toArray().map(x => Math.round(x / tolerance)).join(',');
    if (!lookup.has(key)) { lookup.set(key, points.length); points.push(p); }
    welded.push(lookup.get(key));
    if (normal) {
      const l = Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i));
      if (!Number.isFinite(l) || Math.abs(l - 1) > .01) invalidNormals++;
    }
  }
  const parents = points.map((_, i) => i);
  const root = i => { while (parents[i] !== i) { parents[i] = parents[parents[i]]; i = parents[i]; } return i; };
  const join = (a, b) => { parents[root(a)] = root(b); };
  const tris = [], edges = new Map();
  let degenerate = 0;
  const ab = new Vector3(), ac = new Vector3(), n = new Vector3();
  const directionArea = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < (index?.count ?? pos.count); i += 3) {
    const t = [0, 1, 2].map(k => welded[index ? index.getX(i + k) : i + k]);
    join(t[0], t[1]); join(t[1], t[2]); tris.push(t);
    for (let k = 0; k < 3; k++) {
      const a = t[k], b = t[(k + 1) % 3];
      if (a === b) continue;
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
    ab.subVectors(points[t[1]], points[t[0]]); ac.subVectors(points[t[2]], points[t[0]]); n.crossVectors(ab, ac);
    const area = n.length() / 2;
    if (area < tolerance * tolerance) { degenerate++; continue; }
    const values = n.toArray();
    const axis = values.map(Math.abs).indexOf(Math.max(...values.map(Math.abs)));
    directionArea[axis * 2 + (values[axis] < 0 ? 1 : 0)] += area;
  }
  const components = new Map();
  for (const t of tris) {
    const id = root(t[0]);
    if (!components.has(id)) components.set(id, { triangles: 0, bounds: new Box3() });
    const c = components.get(id); c.triangles++;
    t.forEach(i => c.bounds.expandByPoint(points[i]));
  }
  const worldBox = new Box3().setFromPoints(points);
  const local = worldBox.clone().translate(center.clone().negate());
  // Classification uses the complete vertex extent, not names or mesh centroid alone.
  // A candidate must lie entirely within a thin outer face slab.
  const candidates = axes.filter((_, i) => {
    const axis = ['x', 'y', 'z'][Math.floor(i / 2)];
    return i % 2 === 0 ? local.min[axis] > edge * .40 : local.max[axis] < -edge * .40;
  });
  const candidate = candidates.length === 1 ? candidates[0] : 'UNASSIGNED';
  const list = [...components.values()].sort((a,b) => b.triangles - a.triangles).map(c => ({ triangles: c.triangles, boundingBox: boxData(c.bounds) }));
  return {
    name: mesh.name, parent: mesh.parent.name, triangles: tris.length,
    vertices: pos.count, weldedVertices: points.length,
    material: Array.isArray(mesh.material) ? mesh.material.map(m => m.name) : mesh.material.name,
    sourceDoubleSided: source.materials[0].doubleSided,
    boundingBox: boxData(worldBox), pivotWorld: round(mesh.getWorldPosition(new Vector3())),
    localMatrix: mesh.matrix.toArray(), worldMatrix: mesh.matrixWorld.toArray(),
    candidateAssembly: candidate, connectedComponents: list,
    boundaryEdges: [...edges.values()].filter(n => n === 1).length,
    nonManifoldEdges: [...edges.values()].filter(n => n > 2).length,
    degenerateTriangles: degenerate, hasNormals: !!normal, invalidNormals,
    normalAreaByAxis: Object.fromEntries(axes.map((a,i) => [a, Number(directionArea[i].toFixed(8))])),
  };
}
const meshes = [];
scene.traverse(o => { if (o.isMesh) meshes.push(auditMesh(o)); });
const nodes = [];
const byName = new Map(meshes.map(m=>[m.name,m]));
scene.traverse(o => {
  const descendants=[];
  o.traverse(c=>{if(c.isMesh) descendants.push(byName.get(c.name));});
  nodes.push({ name: o.name, parent: o.parent?.name ?? null, type: o.type, children: o.children.map(c=>c.name),
    triangles:descendants.reduce((s,m)=>s+m.triangles,0), materials:[...new Set(descendants.flatMap(m=>m.material))],
    candidateAssemblies:[...new Set(descendants.map(m=>m.candidateAssembly))],
    localMatrix:o.matrix.toArray(), worldMatrix:o.matrixWorld.toArray(), pivotWorld:round(o.getWorldPosition(new Vector3())), boundingBox: boxData(new Box3().setFromObject(o)) });
});
const rayDirections = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const interiorRays={};
for(const [label,side] of [['singleSided',FrontSide],['doubleSided',DoubleSide]]) {
  scene.traverse(o=>{if(o.isMesh) o.material.side=side;});
  interiorRays[label] = Object.fromEntries(axes.map((axis,i)=>{
    const hit=new Raycaster(center,new Vector3(...rayDirections[i]),0,edge*2).intersectObject(scene,true)[0];
    return [axis,hit ? {mesh:hit.object.name,distance:hit.distance,point:round(hit.point)} : null];
  }));
}
const aggregate = {};
for (const m of meshes) {
  aggregate[m.candidateAssembly] ??= { meshes:0, triangles:0 };
  aggregate[m.candidateAssembly].meshes++; aggregate[m.candidateAssembly].triangles += m.triangles;
}
const report = {
  source: source.asset, sha256:crypto.createHash('sha256').update(bytes).digest('hex'), bytes:bytes.length,
  method:'Full world-space vertex bounds, position-welded triangle connectivity, edge incidence and triangle geometric-normal area. Weld tolerance is 1e-6 of cube edge. Connectivity is a diagnostic, not a manifold/solid CAD guarantee.',
  bounds:boxData(bounds), center:round(center), edge, weldTolerance:tolerance,
  meshCount:meshes.length, nodeCount:nodes.length, materialCount:source.materials.length,
  triangles:meshes.reduce((s,m)=>s+m.triangles,0), aggregate, interiorRays, nodes, meshes,
};
fs.mkdirSync('public/node-lab', {recursive:true});
fs.mkdirSync('docs/node-lab', {recursive:true});
fs.mkdirSync('components/node-lab', {recursive:true});
fs.writeFileSync('public/node-lab/hierarchy.json', JSON.stringify(report,null,2));
// Lean, generated input for the isolated R3F renderer; full report stays out of its bundle.
fs.writeFileSync('components/node-lab/asset-manifest.json', JSON.stringify({
  bounds: report.bounds, center:report.center, edge:report.edge,
  meshes:meshes.map(({name,candidateAssembly})=>({name,candidateAssembly})),
},null,2));
fs.writeFileSync('docs/node-lab/hierarchy.md', [
  '# Source hierarchy — Sci-Fi Cube 01', '',
  'Generated by `scripts/audit-node-asset.mjs`. Bounds are source world space; no destructive preprocessing. See JSON for every group, transform, pivot and connected component.', '',
  '| Mesh | Parent | Triangles | Material | Bounds min → max | Candidate assembly | Connected islands | Boundary edges |',
  '|---|---|---:|---|---|---|---:|---:|',
  ...meshes.map(m=>`| ${m.name} | ${m.parent} | ${m.triangles} | ${m.material} | ${m.boundingBox.min.join(', ')} → ${m.boundingBox.max.join(', ')} | ${m.candidateAssembly} | ${m.connectedComponents.length} | ${m.boundaryEdges} |`),
].join('\n')+'\n');
console.log(JSON.stringify({meshes:report.meshCount,nodes:report.nodeCount,triangles:report.triangles,aggregate,unassigned:meshes.filter(m=>m.candidateAssembly==='UNASSIGNED').map(m=>({name:m.name,triangles:m.triangles,components:m.connectedComponents,boundaryEdges:m.boundaryEdges,normalArea:m.normalAreaByAxis}))},null,2));
