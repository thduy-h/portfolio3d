import { NodeScene } from "./NodeScene";

export function NodeStage() {
  return (
    <div
      className="relative h-full w-full bg-transparent"
      aria-label="NODE_7388 system status"
    >
      <div
        className="pointer-events-none absolute inset-[4%] opacity-[0.12]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15, 23, 42, 0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.18) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        data-node-construction
        aria-hidden="true"
      >
        <div className="absolute left-[4%] right-[8%] top-[29%] h-px bg-cyan/25" />
        <div className="absolute bottom-[24%] left-[16%] right-[2%] h-px bg-cobalt/15" />
        <div className="absolute -left-12 bottom-[24%] h-px w-28 bg-cobalt/15" />
      </div>

      <span
        className="pointer-events-none absolute left-[12%] top-[20%] h-3 w-3 border-l border-t border-slate-500/25"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute right-[15%] top-[34%] h-3 w-3 border-b border-r border-slate-500/20"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute bottom-[17%] left-[30%] h-3 w-3 border-l border-t border-slate-500/20"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-y-0 -left-[30%] w-[160%]">
        <NodeScene />
      </div>

      <div
        className="pointer-events-none absolute left-[3%] top-[9%] z-10 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500/80"
        data-node-primary-ui
      >
        <span className="mb-2 block h-3 w-px bg-cyan/30" aria-hidden="true" />
        NODE_7388 / SPATIAL COMPUTE
      </div>

      <div
        className="pointer-events-none absolute left-[3%] top-[51%] z-10 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500/75"
        data-node-primary-ui
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-signal"
          aria-hidden="true"
        />
        <span>SYS_CORE / ONLINE</span>
        <span
          className="hidden h-px w-12 bg-slate-400/25 sm:block"
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute right-[3%] top-[22%] z-10 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500/75"
        data-node-peripheral-ui
      >
        <span
          className="mb-2 ml-auto block h-px w-10 bg-cyan/25"
          aria-hidden="true"
        />
        NODE_01 / WEB_RUNTIME
      </div>

      <div
        className="pointer-events-none absolute bottom-[10%] right-[3%] z-10 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500/75"
        data-node-peripheral-ui
      >
        NODE_02 / INFERENCE_READY
        <span
          className="ml-auto mt-2 block h-3 w-px bg-cobalt/25"
          aria-hidden="true"
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-0"
        data-node-identifiers
        aria-hidden="true"
      >
        <div className="absolute left-[24%] top-[26%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">
          <span className="h-px w-5 bg-cyan/40" />
          WEB
        </div>
        <div className="absolute right-[24%] top-[38%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">
          <span className="h-1 w-1 bg-cobalt/50" />
          API
        </div>
        <div className="absolute bottom-[39%] left-[20%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">
          AI
          <span className="h-1 w-1 bg-cyan/50" />
        </div>
        <div className="absolute bottom-[29%] right-[28%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">
          DATA
          <span className="h-px w-5 bg-cobalt/40" />
        </div>
        <div className="absolute bottom-[20%] left-[43%] flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">
          <span className="h-1 w-1 bg-slate-500/50" />
          INFRA
        </div>
      </div>
      <div
        data-node-lock
        className="pointer-events-none absolute inset-x-0 bottom-[3%] flex justify-center gap-6 font-mono text-[9px] tracking-widest text-slate-500 opacity-0"
        aria-hidden="true"
      >
        <span>SYS_CORE / STABLE</span>
        <span>DATA_BUS / ONLINE</span>
      </div>
      <div
        data-node-subsystems
        className="pointer-events-none absolute inset-0 font-mono text-[9px] tracking-widest text-slate-500 opacity-0"
        aria-hidden="true"
      >
        <span className="absolute left-[12%] top-[30%]">NODE_04 / DATA</span>
        <span className="absolute right-[3%] top-[38%]">
          NODE_03 / INFERENCE
        </span>
        <span className="absolute left-[38%] top-[16%]">NODE_02 / API</span>
        <span className="absolute bottom-[18%] left-[35%]">
          NODE_05 / INFRA
        </span>
        <span className="absolute right-[10%] bottom-[30%]">NODE_01 / WEB</span>
        <span className="absolute left-[35%] top-[48%]">SYS_CORE / ACTIVE</span>
      </div>
    </div>
  );
}
