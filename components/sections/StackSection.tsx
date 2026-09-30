"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { stack } from "@/data/stack";
import { SectionHeading } from "./SectionHeading";

export function StackSection() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = stack[active];
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % stack.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + stack.length) % stack.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stack.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };

  return <section id="stack" aria-label="Stack and capabilities" className="site-section px-6 py-28 sm:px-8 lg:py-40">
    <div className="mx-auto max-w-7xl">
      <div className="section-reveal"><SectionHeading index="04" kicker="CAPABILITIES" title="Tools in the system." description="The category structure is ready. Specific tools will appear only after they are confirmed." /></div>
      <div className="mt-16 grid border-t border-slate-300/75 lg:grid-cols-[minmax(230px,0.35fr)_1fr]">
        <div role="tablist" aria-label="Stack categories" className="flex gap-2 overflow-x-auto border-b border-slate-300/75 py-5 lg:flex-col lg:gap-0 lg:border-b-0 lg:border-r lg:pr-8">
          {stack.map((group, index) => <button key={group.category} ref={node => { buttons.current[index] = node; }} id={`stack-tab-${index}`} type="button" role="tab" aria-selected={active === index} aria-controls="stack-panel" tabIndex={active === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => move(event, index)} className={`shrink-0 border-l-2 px-4 py-3 text-left font-mono text-[11px] tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cobalt lg:w-full lg:py-5 ${active === index ? "border-cobalt bg-white/55 text-graphite" : "border-transparent text-slate-500 hover:text-cobalt"}`}>
            <span className="mr-4 text-cobalt/60">{String(index + 1).padStart(2, "0")}</span>{group.category}
          </button>)}
        </div>
        <div id="stack-panel" key={current.category} role="tabpanel" aria-labelledby={`stack-tab-${active}`} tabIndex={0} className="stack-panel min-w-0 lg:pl-12">
          <div className="flex items-start justify-between gap-4 border-b border-slate-300/75 py-6">
            <h3 className="font-heading text-3xl tracking-[-0.05em] text-graphite sm:text-4xl">{current.category}</h3>
            <span className="font-mono text-[10px] tracking-[0.15em] text-slate-500">ITEMS / PENDING</span>
          </div>
          <ul className="grid sm:grid-cols-2">
            {current.items.map((item, index) => <li key={item} className="flex items-center gap-5 border-b border-slate-300/75 py-6 pr-4 text-sm text-graphite">
              <span className="h-1.5 w-1.5 shrink-0 bg-cyan" aria-hidden="true" />
              <span className="font-heading text-xl tracking-tight">{item}</span>
              <span className="ml-auto font-mono text-[10px] text-slate-500">{String(index + 1).padStart(2, "0")}</span>
            </li>)}
          </ul>
          {current.note && <p className="pt-6 text-sm text-[#52606F]">{current.note}</p>}
        </div>
      </div>
    </div>
  </section>;
}
