# Approved GLB — production Hero integration

The approved `public/models/node-7388.glb` is now rendered in the homepage Hero. No geometry was rebuilt, no asset bytes were changed, and node-lab was not modified.

## Files changed

- `components/hero/node/Node7388.tsx`: replaces procedural face/core rendering with cloned semantic GLB assemblies; preserves the existing mutable progress contract and measured display/DOM handoff.
- `components/hero/node/NodeCanvas.tsx`: light studio reflections, balanced key/fill, asset-aware Suspense readiness and canvas-size readiness notification.
- `components/hero/HeroMotion.tsx`: adds/removes a viewport resize listener using the existing refresh-after-layout helper. No timeline, phase durations, pin/scrub configuration, transform choreography or selectors changed.
- `scripts/check-node-hero.mjs`: browser validation and screenshots.
- This directory: captured screenshots and `runtime.json`.

No dependencies added. Hero markup, typography, navbar, NodeStage DOM annotations, mobile/reduced-motion SVG, FeaturedProject and project data are unchanged. Old procedural helper files remain unused rather than being deleted as unrelated cleanup.

## Motion wiring

`useGLTF` loads the approved asset only inside the existing lazy desktop Canvas. Each semantic assembly is cloned so changes cannot mutate the loader cache. Materials are cloned and disposed separately; cached geometry/textures are shared.

- WEB +Z, API −Z, AI +X, DATA −X, SYSTEM +Y, INFRA −Y.
- Each face starts from its exported rest origin (axis × 1.19) and receives the existing `explode × 1.2` offset. Child meshes move rigidly with the assembly.
- SYS_CORE and INTERNAL_FRAME receive no explosion displacement. The existing whole-background recession of `−focus × 0.65` during WEB focus remains intact.
- Non-WEB assemblies retain the existing peripheral displacement/fade during focus. WEB follows the existing camera-facing focus path and uniform 1→1.12 hardware scale.
- `WEB_SCREEN_ANCHOR` supplies local center, orientation and 1.60 × 0.90 usable bounds. Its offset is accounted for when solving the WEB destination from the actual DOM rectangle and orthographic viewport.
- Hardware remains square. The existing separate rounded transition surface grows from the anchor bounds, then crossfades with FeaturedProject using the unchanged `handoff` value. No mesh geometry is stretched into a monitor.
- All transforms are recomputed from rest and progress every demand frame, so reverse scrolling does not accumulate drift. No React state updates on scroll.

The original `+=330%`, `top top`, pin, scrub 0.8, anticipatePin 1 and chapter timing remain unchanged. During testing, live resizing from a pinned state retained an old pin width when the Canvas itself stayed at max-width. Explicitly refreshing through the existing layout helper on viewport resize resolves this without a new ScrollTrigger or altered timeline.

## Production material / lighting tuning

Chrome roughness 0.21 and environment intensity 1.25; graphite uses restrained dark-blue/graphite contrast; PCB emissive mask intensity 1.1; cyan accents 1.45. Acrylic/smoked glass use physical reflection/clearcoat with alpha 0.18/0.27, front-side rendering and no depth writes. This retains the approved lightweight glass approximation, not physically accurate multilayer refraction.

Studio reflection map is generated locally once from three broad Lightformers (128 resolution); ambient 0.6, broad key 2.5, cool fill 1.2. The Canvas stays transparent over the approved page. No external HDR, bloom, postprocessing, new decorative UI or animated lighting.

## Validation

- Lint and typecheck: passed, no warnings.
- Production build: `npm run build -- --webpack` passed. An earlier sandboxed run failed parsing TypeScript `--showConfig`; the unrestricted retry completed. No build config was changed.
- Browser runtime on homepage: zero console errors. This is the real Hero, not node-lab.
- Start → centered → exploded → WEB focus → handoff → project: captured and inspected.
- Reverse scroll restores exploded/centered/start; identity opacity returns to 1 and explode/focus/handoff return to zero.
- Fresh loads at 1280 / 1440 / 1728: centered stage and zero horizontal overflow.
- Live resizing while pinned across all three widths: center error under 0.001 px.
- Final projected transition-surface corners vs DOM screen bounds: error under 0.001 px at all three widths (floating-point noise; not a claim about subjective crossfade quality).
- Reload at middle/top: one pin, correct reconstructed state. Navbar stays hit-testable at its fixed viewport position throughout.
- Reduced motion and 390px mobile: zero Canvas elements, zero pin spacers, readable identity, normal-flow accessible project.
- Performance envelope: steady intact/exploded GLB 75,392 triangles / 38 draw calls; WEB transition peaks at 39 calls / 76,108 submitted triangles; completed handoff 32 calls. DPR capped at 1.5, frameloop demand, no per-scroll mesh traversal/material allocation. Test browser used software WebGL, so this does **not** certify hardware GPU FPS or thermals. Real-device performance profiling remains a separate check.

Screenshots: [start](start.png), [centered](centered.png), [exploded](exploded.png), [WEB focus](web-focus.png), [handoff](handoff.png), [project](project.png), [reduced motion](reduced-motion.png), [mobile](mobile.png).

Raw measured states and errors: [runtime.json](runtime.json). To reproduce, start the dev server on 3100 and an isolated Chromium CDP session on 9226, then run `node scripts/check-node-hero.mjs`.

## Content still pending

VNNETZERO uses the existing explicitly marked screenshot placeholder, unverified metadata placeholders and pending URLs. This integration does not invent project content or replace those assets. No About, Experience, GitHub or other sections were added.
