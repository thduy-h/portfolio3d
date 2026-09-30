import { HeroMotion } from "./hero/HeroMotion";
import { NodeStage } from "./hero/NodeStage";
import { FeaturedProject } from "./projects/FeaturedProject";

export function Hero() {
  return (
    <HeroMotion featuredProject={<FeaturedProject />}>
      <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-8 pt-24 lg:grid-cols-[42%_58%] lg:gap-0 lg:px-8 lg:py-0">
        <div className="relative z-10 max-w-2xl lg:pr-10" data-hero-identity>
          <p className="font-mono text-xs tracking-widest text-cyan">
            [ SOFTWARE / SYSTEMS ENGINEER ]
          </p>

          <h1
            id="hero-heading"
            className="mt-5 font-heading text-5xl font-medium leading-tight tracking-tighter text-graphite sm:text-6xl xl:text-7xl"
          >
            I build intelligent digital{" "}
            <span className="bg-gradient-to-r from-cyan to-cobalt bg-clip-text text-transparent">
              systems.
            </span>
          </h1>

          <p className="mt-4 font-body text-xl text-[#52606F]">
            Web <span aria-hidden="true">·</span> AI <span aria-hidden="true">·</span>{" "}
            Infrastructure
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#work"
              className="rounded-full bg-cobalt px-6 py-3 font-body text-sm font-medium text-white shadow-[0_10px_30px_rgba(49,91,255,0.25)] transition-colors hover:bg-cobalt/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt"
            >
              Explore Work
            </a>
            <a
              href="https://github.com"
              className="rounded-full border border-slate-300 bg-transparent px-6 py-3 font-body text-sm font-medium text-graphite transition-colors hover:border-slate-400 hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cobalt"
            >
              GitHub
            </a>
          </div>
        </div>

        <div
          className="relative h-[38vh] min-h-[290px] w-full lg:h-[min(760px,82vh)] lg:min-h-0"
          data-node-stage
        >
          <NodeStage />
        </div>
      </div>
    </HeroMotion>
  );
}
