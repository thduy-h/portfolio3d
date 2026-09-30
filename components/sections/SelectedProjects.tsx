import { projects, type Project } from "@/data/projects";
import { SectionHeading } from "./SectionHeading";

function ProjectVisual({ project, number }: { project: Project; number: string }) {
  return (
    <div className="project-visual relative aspect-[16/10] overflow-hidden bg-white/55" aria-label={`${project.title} visual preview`}>
      {project.image ? (
        // Project images are data-driven local or approved remote assets.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.image} alt={`${project.title} project preview`} className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" role="img" aria-label={`Preview pending for ${project.title}`}>
          <div className="project-visual-grid absolute inset-0" />
          <div className="absolute inset-[13%] border border-slate-300/70" />
          <div className="absolute inset-[18%] border border-cobalt/20" />
          <div className="absolute left-[18%] right-[18%] top-[42%] h-px bg-cyan/60" />
          <div className="absolute left-[42%] top-[18%] bottom-[18%] w-px bg-cobalt/30" />
          <div className="absolute left-[18%] top-[18%] h-2 w-2 border-l border-t border-cobalt/50" />
          <div className="absolute right-[18%] bottom-[18%] h-2 w-2 border-b border-r border-cyan/70" />
          <span className="absolute left-6 top-6 font-mono text-[10px] tracking-[0.18em] text-slate-500">FIG. {number} / PREVIEW_PENDING</span>
          <span className="absolute bottom-6 right-6 font-mono text-[10px] tracking-[0.18em] text-slate-500">{project.title}</span>
        </div>
      )}
    </div>
  );
}

export function SelectedProjects() {
  return (
    <section id="projects" aria-labelledby="selected-projects-title" className="site-section px-6 py-28 sm:px-8 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="section-reveal"><SectionHeading index="02" kicker="SELECTED PROJECTS" title="Systems in practice." titleId="selected-projects-title" description="A place for project work and focused case studies. Details will be added after review." /></div>
        <div className="mt-14 lg:mt-24">
          {projects.map((project, index) => {
            const number = String(index + 2).padStart(2, "0");
            return (
              <article key={project.id} className="project-row group grid gap-7 border-t border-slate-300/75 py-9 last:border-b md:grid-cols-[90px_minmax(0,1fr)_minmax(290px,0.8fr)] md:gap-10 lg:py-14">
                <p className="pt-1 font-mono text-sm text-cobalt">/{number}</p>
                <div className="flex min-w-0 flex-col">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-slate-500">{project.eyebrow ?? "PROJECT"}{project.year ? ` / ${project.year}` : ""}</p>
                  <h3 id={`project-${project.id}`} className="mt-4 break-words font-heading text-4xl leading-none tracking-[-0.06em] text-graphite sm:text-5xl lg:text-6xl">{project.title}</h3>
                  {project.description && <p className="mt-5 max-w-md text-base leading-relaxed text-[#52606F]">{project.description}</p>}
                  {(project.role?.length || project.stack?.length) ? (
                    <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-slate-600">
                      {project.role?.map(value => <span key={`role-${value}`}>{value}</span>)}
                      {project.stack?.map(value => <span key={`stack-${value}`}>{value}</span>)}
                    </div>
                  ) : null}
                  {(project.liveUrl || project.githubUrl) && (
                    <div className="mt-auto flex gap-6 pt-8 font-mono text-xs">
                      {project.liveUrl && <a className="text-cobalt underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-cobalt" href={project.liveUrl} target="_blank" rel="noreferrer">Visit project ↗</a>}
                      {project.githubUrl && <a className="text-cobalt underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-cobalt" href={project.githubUrl} target="_blank" rel="noreferrer">Source ↗</a>}
                    </div>
                  )}
                </div>
                <ProjectVisual project={project} number={number} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
