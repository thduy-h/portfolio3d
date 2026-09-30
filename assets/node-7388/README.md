# NODE_7388 — authored hardware asset

Purpose-built in Blender 5.1.1 from `scripts/build_node7388.py`. No external cube geometry, paid assets, HDR downloads or Blender add-ons. Production Hero, HeroMotion and the GSAP chapter are unchanged. Visual acceptance remains a review decision; this asset is only loaded by the development-only `/node-lab` route.

## Deliverables

- [Blender source](node-7388.blend): assembled rest state, semantic groups, review camera/lights, packed circuit mask, hidden unjoined source collection with bevel/weighted-normal modifiers.
- [GLB](node-7388.glb): identical to `public/models/node-7388.glb`; applied geometry, no authoring collection, lights or camera.
- [Hierarchy](hierarchy.md), [Blender geometry report](hierarchy.json), [independent exported-buffer checks](export-validation.json).
- Browser screenshots: [assembled](assembled.png), [exploded](exploded.png), [WEB focus](web-focus.png).
- [Runtime results](runtime.json).

## Geometry / budget

75,392 triangles, 38 mesh objects / material primitives, six materials. GLB: 1,733,276 bytes (1.65 MiB). This meets the 30k–80k envelope and payload limit, but exceeds the 40k–60k soft target. No destructive silhouette simplification, Draco dependency or cross-assembly joining.

Polish pass: processor dimensions increased in-place (1.22× XY, 1.65× depth), two core carrier bridges, stronger docking buses and subsystem packages, WEB backing seat, and higher-contrast lab materials. All assembly pivots, hierarchy, anchor bounds and explosion axes are unchanged.

All modeled pieces are closed volumes. The Blender build asserts zero boundary edges on every final mesh, including the processor lettering after welding its coincident font-conversion vertices. Closed surfaces use front-sided materials; inner faces are actual geometry, not double-sided shading disguising missing backs. This is a rendering/topology check, not a manufacturing or collision certification.

The optical covers use explicit rounded outlines with independent corner radius and thickness, not thin boxes with a clamped bevel radius. Each face has an acrylic cover, machined perimeter, recessed graphite seating gasket, open PCB, service lip, four captive fasteners and board-edge contacts. Fine circuit traces use one generated 512×512 emissive PNG; only major buses and contacts use geometry.

Face variants: WEB landscape bezel/driver pair; API recessed service connectors; AI paired accelerator packages; DATA storage lanes; SYSTEM routing controllers/cross bus; INFRA power sockets/network backplane. The processor has a socket, retention frame, lid, die inset, edge illumination and rear heat spreader. Four slim internal spines and six radial docking buses stay stationary.

## Motion and coordinate contract

```text
NODE_7388
├── FACE_WEB       +Z
│   └── WEB_SCREEN_ANCHOR
├── FACE_API       −Z
├── FACE_AI        +X
├── FACE_DATA      −X
├── FACE_SYSTEM    +Y
├── FACE_INFRA     −Y
├── SYS_CORE           stationary
└── INTERNAL_FRAME     stationary
```

There is one anchor, nested under WEB as required for rigid inheritance, not a second root-level anchor. Six face origins are at their axis × 1.19. Rest transforms are assembled. All object scales are identity; face rotations intentionally align local +Z with their explosion direction. In the lab each face receives a world-axis displacement of 0–1 units; no descendant independently drifts. Reverse returns to exact rest, not an accumulated integration result.

Blender uses its normal Z-up basis; exported GLB uses +Y up / +Z front. The exporter is given a temporarily converted Y-up scene with its own conversion disabled, preserving canonical local face and anchor bases. The saved `.blend` remains Z-up. Blender and GLB units are consistent (one unit = one metre); these are presentation dimensions, not a claim that this is a manufacturing-scale device. A later stage can scale the entire NODE uniformly without changing this contract.

Anchor in GLB: local XY plane, +Z normal, usable width **1.60**, height **0.90**, radius **0.055**. Assembled world center approximately **[0, 0, 1.117]**. Those are inner visible bounds, not exterior frame bounds. The later DOM surface should project anchor corners through the existing camera; no DOM handoff is implemented here.

WEB FOCUS moves WEB further forward, rotates it gently toward the inspection camera and reduces other assemblies' opacity. SYS_CORE remains fixed and readable. No ScrollTrigger, timeline, automatic orbit or full-page Canvas.

## Materials

`MAT_ACRYLIC`, `MAT_CHROME`, `MAT_GRAPHITE`, `MAT_PCB`, `MAT_CIRCUIT`, `MAT_SMOKED_GLASS`.

Blender/GLB store transmission-capable glass. The lab explicitly replaces glass with lightweight MeshPhysicalMaterial reflective alpha coverage: no stacked transmission render passes. This is a performance-oriented review approximation, **not physically accurate refraction**. Chrome, graphite, PCB and emissive details retain exported material identities. No environment lighting is baked into textures.

## Compromises / review notes

- Fixed internal docking buses do not telescope to the opened faces. They communicate docking positions; a later production connector treatment can be driven by the existing progress contract.
- Open PCB perimeters deliberately prioritize transparency over realistic board density. No full motherboard is modeled.
- No real-time shadows, bloom, AO postprocess or depth blur in the lab. Lighting is a local studio environment built with Lightformers.
- Geometry budget is near the upper end; 38 material batches stay below 50. Export is optimized through semantic batching, not aggressive decimation.
- No production integration or claim of final visual approval. Review all three screenshots before considering integration.

## Validation results

- Blender 5.1.1 headless build and zero-boundary-edge assertions: passed.
- Independent GLB checks: all six face pivots/normals, anchor plane/bounds, identity scales, finite buffers, unit normals, reversible axis transforms and asset budgets passed.
- `npm run lint` and `npm run typecheck`: passed.
- `npm run build -- --webpack`: passed on retry (an earlier run failed parsing TypeScript `--showConfig`). No build configuration was changed. Webpack is explicitly used because default Turbopack was blocked by process/port permissions in the prior spike.
- Browser: **38 draw calls / 75,392 submitted triangles in all three states**, after studio environment warmup. These are main-scene counters, not a GPU frame-time benchmark. DPR capped at 1.5; screenshots tested at DPR 1.
- Zero console errors, zero horizontal overflow, no pin spacers; assembled/exploded/WEB-focus, restoration and reload tested. Runtime report records widths 1280 / 1440 / 1728.
- The lab has no autoplay or scrub animation; controls apply discrete/manual poses. Loading text and WebGL/error fallbacks exist, but forced GPU/context-loss recovery has not been tested.

## Reproduce commands

```sh
nix shell nixpkgs#blender --command blender --version
nix shell nixpkgs#blender --command blender --background --python scripts/build_node7388.py
node scripts/validate-node7388.mjs
npm run dev -- --port 3100
```

For CI, add Blender's `--python-exit-code 1` before `--python` so assertion failures propagate as a nonzero process exit. The script regenerates the `.blend`, both GLB copies, packed PNG and geometry report. No Nix/system configuration was modified. `nixpkgs#blender` follows the local registry; this output was tested with **5.1.1**, not arbitrary future Blender releases.

An isolated Chromium instance with CDP port 9226 lets `node scripts/check-node-lab.mjs` regenerate the three screenshots and runtime measurements. No browser automation dependency is added to the application.
