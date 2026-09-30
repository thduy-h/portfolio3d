import { experience } from "@/data/experience";
import { SectionHeading } from "./SectionHeading";

export function ExperienceSection() {
  return <section id="experience" aria-label="Experience" className="site-section px-6 py-28 sm:px-8 lg:py-40">
    <div className="mx-auto max-w-7xl">
      <div className="section-reveal"><SectionHeading index="05" kicker="EXPERIENCE" title="Work over time." description="This timeline is prepared for verified roles, dates and outcomes." /></div>
      <ol className="mt-16 border-t border-slate-300/75">
        {experience.map((entry, index) => <li key={entry.id} className="relative grid gap-5 border-b border-slate-300/75 py-9 pl-8 sm:pl-10 md:grid-cols-[minmax(150px,0.35fr)_1fr] md:gap-12 lg:py-12">
          <span className="absolute bottom-0 left-0 top-0 w-px bg-slate-300/75" aria-hidden="true" />
          <span className="absolute left-[-3px] top-11 h-[7px] w-[7px] bg-cobalt" aria-hidden="true" />
          <div className="font-mono text-[10px] tracking-[0.14em] text-slate-500">
            <span className="text-cobalt">{String(index + 1).padStart(2, "0")}</span>
            <p className="mt-3">{entry.startDate && entry.endDate ? `${entry.startDate} — ${entry.endDate}` : "[DATE RANGE]"}</p>
            {entry.location && <p className="mt-2">{entry.location}</p>}
          </div>
          <article>
            <h3 className="font-heading text-3xl tracking-[-0.05em] text-graphite sm:text-4xl">{entry.position ?? entry.id}</h3>
            <p className="mt-2 font-mono text-[11px] tracking-[0.14em] text-cobalt">{entry.company ?? "[COMPANY PENDING]"}</p>
            {entry.description && <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#52606F]">{entry.description}</p>}
            {entry.skills.length > 0 && <ul aria-label="Skills used" className="mt-6 flex flex-wrap gap-2">{entry.skills.map(skill => <li key={skill} className="border border-slate-300 px-3 py-1 font-mono text-[10px] text-slate-600">{skill}</li>)}</ul>}
            {entry.links.length > 0 && <div className="mt-6 flex flex-wrap gap-5">{entry.links.map(link => <a key={link.url} href={link.url} className="font-mono text-xs text-cobalt underline underline-offset-4 focus-visible:outline-cobalt">{link.label} ↗</a>)}</div>}
          </article>
        </li>)}
      </ol>
    </div>
  </section>;
}
