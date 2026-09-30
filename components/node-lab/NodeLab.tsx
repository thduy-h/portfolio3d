"use client";

import dynamic from "next/dynamic";
import { Component, useRef, useState, type ReactNode } from "react";

const LabCanvas = dynamic(() => import("./LabCanvas"), {
  ssr: false,
  loading: () => <p className="p-8 font-mono text-sm">Loading NODE_7388 inspector…</p>,
});
class LabBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed
      ? <p role="alert" className="p-8">Asset or WebGL unavailable. Read the hierarchy report below. No substitute object is shown.</p>
      : this.props.children;
  }
}
export function NodeLab() {
  const [explode, setExplode] = useState(0);
  const [focus, setFocus] = useState(false);
  const statsRef = useRef<HTMLOutputElement>(null);
  const button = "rounded-full border border-slate-300 bg-white px-5 py-2 text-xs hover:border-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt";
  const state = focus ? "WEB FOCUS" : explode === 0 ? "ASSEMBLED" : `EXPLODED / ${explode.toFixed(2)}`;
  function preset(value: number, front = false) { setExplode(value); setFocus(front); }
  return <main className="mx-auto max-w-[1600px] px-5 py-7 text-slate-900 sm:px-10">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="font-mono text-xs tracking-widest text-cobalt">LIQUID COMPUTE / HARDWARE STUDY 01</p>
        <h1 className="mt-2 font-heading text-3xl tracking-tight">NODE_7388</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">Purpose-built Blender asset · six rigid face assemblies · stationary SYS_CORE. Drag to inspect, scroll to zoom.</p>
      </div>
      <span className="rounded-full border border-slate-300 px-4 py-2 font-mono text-xs">ISOLATED REVIEW / NOT IN HERO</span>
    </header>
    <section aria-label="Geometry controls" className="mt-6 flex flex-wrap items-center gap-3 font-mono">
      <button className={button} onClick={() => preset(0)}>ASSEMBLED</button>
      <button className={button} onClick={() => preset(1)}>EXPLODED</button>
      <button className={button} onClick={() => preset(1, true)}>WEB FOCUS</button>
      <label className="flex items-center gap-3 text-xs">explodeProgress
        <input aria-label="explodeProgress" type="range" min="0" max="1" step="0.01" value={explode} onChange={e => { setExplode(Number(e.target.value)); setFocus(false); }} className="w-36 accent-blue-600" />
        <span className="w-10">{explode.toFixed(2)}</span>
      </label>
    </section>
    <div className="relative mt-4 h-[min(70vh,800px)] min-h-[400px] overflow-hidden rounded-xl border border-slate-200 bg-[#F4F7FA]" data-lab-viewport>
      <div className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-xs text-slate-500" data-lab-state>{state} / +Y UP</div>
      <LabBoundary><LabCanvas explode={explode} focus={focus} statsRef={statsRef} /></LabBoundary>
      <output ref={statsRef} className="pointer-events-none absolute bottom-5 left-5 font-mono text-xs text-slate-500" data-lab-stats>Loading authored GLB…</output>
    </div>
    <div className="mt-5 grid gap-5 text-sm md:grid-cols-3">
      <section><h2 className="font-mono text-xs text-cobalt">MECHANICAL CONTRACT</h2><p className="mt-2">WEB +Z · API −Z · AI +X · DATA −X<br />SYSTEM +Y · INFRA −Y<br />SYS_CORE / INTERNAL_FRAME stationary.</p></section>
      <section><h2 className="font-mono text-xs text-cobalt">MATERIAL REVIEW</h2><p className="mt-2">Acrylic · chrome · graphite · PCB · cyan circuits · smoked glass. Lightweight reflective transparency; no bloom or postprocessing.</p></section>
      <section><h2 className="font-mono text-xs text-cobalt">ASSET / HANDOFF</h2><p className="mt-2"><a className="underline" href="/models/node-7388.glb" download>Download authored GLB</a> · <a className="underline" href="/models/node-7388-hierarchy.json">Hierarchy report</a><br />WEB_SCREEN_ANCHOR belongs to FACE_WEB. No DOM handoff or ScrollTrigger.</p></section>
    </div>
  </main>;
}
