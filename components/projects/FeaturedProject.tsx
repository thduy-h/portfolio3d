import { featuredProject as project } from "./project-data";

export function FeaturedProject() {
  return (
    <article
      aria-labelledby="project-title"
      className="mx-auto w-full max-w-[1000px]"
    >
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2
          id="project-title"
          className="font-mono text-sm tracking-widest text-graphite"
        >
          01 / {project.title}
        </h2>
        <span className="font-mono text-[10px] tracking-widest text-slate-500">
          LIVE SYSTEM / PREVIEW
        </span>
      </header>
      <div
        data-project-screen
        className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-cyan/30 bg-bgLight shadow-[0_24px_80px_rgba(10,13,20,0.12)]"
      >
        {/* Local, explicitly labeled placeholder; replace through project-data.ts. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.imageAlt}
          width={1600}
          height={900}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-300/60 pt-4 text-sm text-[#52606F] sm:grid-cols-[1fr_1.3fr_1fr]">
        <div>
          <p className="mb-1 font-mono text-[9px] tracking-widest">ROLE</p>
          {project.role}
        </div>
        <div>
          <p className="mb-1 font-mono text-[9px] tracking-widest">STACK</p>
          {project.stack}
        </div>
        <div>
          <p className="mb-1 font-mono text-[9px] tracking-widest">STATUS</p>
          {project.status}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-6 font-mono text-xs">
        {project.projectUrl ? (
          <a href={project.projectUrl}>View Project ↗</a>
        ) : (
          <span className="text-slate-500">
            View Project ↗ <span className="text-[9px]">URL PENDING</span>
          </span>
        )}
        {project.githubUrl ? (
          <a href={project.githubUrl}>GitHub ↗</a>
        ) : (
          <span className="text-slate-500">
            GitHub ↗ <span className="text-[9px]">URL PENDING</span>
          </span>
        )}
      </div>
    </article>
  );
}
