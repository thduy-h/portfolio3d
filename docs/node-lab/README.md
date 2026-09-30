# NODE_7388 asset validation spike

Historical external-asset audit. The current `/node-lab` now previews the separately authored asset documented in [assets/node-7388/README.md](../../assets/node-7388/README.md). The findings and screenshots below remain the record of the rejected Giimann candidate, not the current model.

## Decision: FAIL

Discard Giimann's **Sci-Fi Cube 01 as the NODE_7388 shell** and use a custom-authored Blender GLB with six physical face assemblies. This does not question the quality of the source as a standalone prop. Its assembly topology is incompatible with the locked six-axis story without substantial remodelling.

Production Hero, HeroMotion, GSAP timeline, progress contract, NODE geometry and FeaturedProject have not been changed. `/node-lab` is a development-only diagnostic route; it returns not-found in production. No dependencies were added.

## Inputs verified

Four newest Downloads files were inspected:

| Download | Contents / use |
|---|---|
| `sci-fi-cube-01.zip` | Original `source/thing.fbx`, 6,266,640 bytes; parsed independently with Three.js FBXLoader |
| `sci-fi_cube_01.zip` | `scene.gltf`, `scene.bin`, `license.txt` |
| `sci-fi_cube_01.glb` | Self-contained Sketchfab conversion; geometry and runtime inspection source |
| `Sci-Fi_Cube_01.usdz` | Alternate AR delivery format; not used for R3F topology conclusions |

Original FBX and GLB both contain **185 mesh objects and 238,600 triangles**. FBX groups are repeated generic part names, not six assemblies: Part1 ×8, Part2 ×1, Part3 ×120, Part4 ×8, Part5 ×48.

GLB SHA-256: `500d3cdea9c2f1a5ab50d509750360d0420364ee205849603267021462983481`.

## Hierarchy gate: C — cross-face shell, unsuitable without geometry surgery

| Geometry family | Meshes | Total triangles | Actual geometry / candidate mapping |
|---|---:|---:|---|
| Part1 | 8 | 24,832 | One connected shell per cube corner, wrapping three perpendicular faces; cannot assign to exactly one moving face |
| Part2 | 1 | 40,888 | One connected body spanning the cube in X, Y and Z; not six loose face islands |
| Part3 | 120 | 161,232 | Face-local fasteners/trim details; 20 meshes per side |
| Part4 | 8 | 2,432 | Corner insert geometry; diagonal corner location, not a planar face |
| Part5 | 48 | 9,216 | Face-local details; 8 meshes per side |
| SYS_CORE | 0 | 0 | No processor or interior computing assembly in the source |

Each of WEB, API, AI, DATA, SYSTEM and INFRA can receive **28 detail meshes / 28,408 triangles**, but **none is a complete substrate/panel**. The 17 cross-face structural meshes total 68,152 triangles. Keeping these stationary while translating the details exposes the failure clearly. It must not be mistaken for a successful exploded assembly.

### Evidence and limits

- Inspected actual position/index/normal buffers, world-space bounds, transform matrices and triangle adjacency after position welding. No assignment was derived from `Part1`–`Part5` names.
- Every mesh is one position-connected component at weld tolerance `cube edge × 1e-6`; Part2 remains a single 40,888-triangle component across all three axes. The shell does not contain six disconnected islands that can simply be separated.
- Bounds: min `[-0.14250776, -0.04250777, -0.18250776]`; max `[0.14250776, 0.24250776, 0.10250776]`. Edge approximately `0.28501552`, center `[0, 0.1, -0.04]`, in imported world units. Do not infer physical metres from an exporter scale alone.
- All mesh pivots are `[0,0,0]` in source world space. Vertices are positioned in the asset, not around sensible panel-local pivots. Import root matrices include axis conversion and approximately `0.01` scale; full matrices are in the JSON report.
- One material slot, `Default`, no textures. The original material is double-sided. All vertex normals are present and approximately unit length; there are no degenerate triangles under the audit threshold.
- Position-welded edge analysis reports 0 boundary edges and 336 incidences with more than two adjacent triangles. This is a diagnostic, not a claim of a watertight manufacturing solid: coincident/contact geometry can affect edge incidence.
- Six axial rays from the cube center hit Part2 at distance approximately `0.14` when double-sided. All six miss when front-sided. Thus those central regions expose the back of an exterior skin, not a separately modeled inward-facing panel surface. The inside-camera single-sided view confirms incomplete interior presentation. This test does not claim that no small internal-facing surfaces exist anywhere.

Full per-mesh table: [hierarchy.md](hierarchy.md). Full groups/meshes, parentage, triangles, material, bounds, transforms, pivots, candidate assemblies, connectivity and interior ray probes: [hierarchy.json](../../public/node-lab/hierarchy.json).

## Lab states and screenshots

- [Assembled](assembled.png): unchanged source geometry in neutral light studio.
- [Exploded diagnostic](exploded-diagnostic.png): 168 face-local details moved along locked axes; cross-face body stays intact. **Not an accepted six-face explode.**
- [WEB focus diagnostic](web-focus-diagnostic.png): only front-facing details, demonstrating the absent complete WEB panel.
- [Structural meshes alone](structure.png): cube silhouette remains even with every face-local detail hidden.
- [Inside camera](inside.png): front-sided interior inspection, not a polished material preview.

Controls: orbit/zoom, explodeProgress 0–1, three presets, structure-only, inside camera and single/double-sided normals check. No automatic motion, ScrollTrigger, GSAP, DOM handoff or connection to HeroMotion.

The manifest-generated R3F adapter preserves every original mesh and provides semantic groups only for the proven face-local details. Cross-face objects stay `UNASSIGNED`; they are deliberately not relabeled `SYS_CORE`. This is the equivalent generated R3F path, not a gltfjsx-optimized asset. No mesh joining is performed.

## Cost and scope stop

| State | Submitted triangles | Main-scene draw calls |
|---|---:|---:|
| Assembled | 238,600 | 185 |
| Diagnostic explode | 238,600 | 185 |
| WEB details only | 28,408 | 28 |
| Structure only | 68,152 | 17 |

GLB payload: **9,005,024 bytes (8.59 MiB)**, unchanged. Metrics are steady-state renderer counters after environment/shader warmup, at DPR 1 in the test browser; environment initialization is excluded. No claimed GPU frame-time benchmark.

**No final optimized GLB exists.** The hierarchy gate failed, so preprocessing, six new pivots, simplification, final semantic assembly export, acrylic prototype and procedural internals were intentionally not pursued. The light neutral material is for inspection, not a substitute for the requested full Liquid Compute material spike. The renderer centers/scales via a display wrapper only; source transforms/geometry are not rewritten.

## Acceptance criteria

| Criterion | Assessment |
|---|---|
| Premium in light theme | Bevel/recess detail holds up, but dense armored/crate language is a poor match for clear compute architecture |
| Reads as cube | Yes, intact |
| Six mechanically believable opening faces | No; key shell geometry crosses faces |
| Visible core | No source core, opaque body and no complete inward-facing face interiors |
| Avoid gaming-prop appearance | Not convincing enough in this inspection |
| WEB face for handoff | No complete independently movable front substrate |
| Performance target | Source exceeds 80k / 50 draws; no optimized result validated because the structural gate failed |

Keeping only the decorative pieces would still require authoring every functional face and the interior. That is not a useful enough salvage for this signature object; it does not change the FAIL recommendation.

## License / attribution

Source: [Sci-Fi Cube 01](https://sketchfab.com/3d-models/sci-fi-cube-01-bb70561ab6d44540a55c0752fa5e0857) by [Giimann](https://sketchfab.com/giimann), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The downloaded license and embedded GLB metadata agree.

Display credit used in the lab: “Sci-Fi Cube 01” by Giimann, CC BY 4.0, with creator/source/license links and modification notice. Sharing an adaptation requires appropriate attribution, a license link and indication of changes; do not imply endorsement or apply incompatible additional restrictions. The copied GLB is unchanged. Display-only changes are uniform centering/scale, neutral material/lighting and diagnostic offsets. See [ATTRIBUTION.md](../../public/node-lab/ATTRIBUTION.md).

## Validation

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build -- --webpack`: passed. Default Turbopack build could not complete in this environment: its PostCSS worker failed creating a process/binding a port with `Operation not permitted`, including the permission retry. No production configuration was changed to work around this.
- Production HTTP smoke test: `/` returns 200; `/node-lab` returns 404 as intended.
- Isolated Chromium runtime: zero console errors; no horizontal overflow at 1280, 1440 and 1728 pixels; no pin spacers; assembled/exploded/WEB controls, return to assembled and reload passed. See `runtime.json` for measured counters.
- Screenshots captured from the actual WebGL lab, not mockups. Rendering uses on-demand frames and contains no autoplay or scroll animation.
- Loading text and an asset/WebGL error boundary are implemented. Forced WebGL failure, context-loss recovery and hardware performance across devices were not tested. Production Hero was not changed; this is not a new full Hero regression run.

## Reproduction

1. `node scripts/audit-node-asset.mjs /path/to/sci-fi_cube_01.glb`
2. `npm run dev -- --port 3100`, open `/node-lab`.
3. Start an isolated Chromium browser with remote debugging on port 9226.
4. `node scripts/check-node-lab.mjs` saves screenshots and [runtime.json](runtime.json).

The lab is not linked from production, and its page is disabled outside development. Source asset/report/attribution under `public/node-lab` are static files, not access-controlled secrets; they remain distributable under CC BY 4.0.
