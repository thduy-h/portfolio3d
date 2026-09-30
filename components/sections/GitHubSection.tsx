import { getGitHubSnapshot, type GitHubSnapshot } from "@/lib/github";
import { SectionHeading } from "./SectionHeading";

const levelStyles = ["bg-slate-200", "bg-[#8AD8E9]", "bg-[#4DB9DB]", "bg-cyan", "bg-cobalt"];
const graphCells = Array.from({ length: 52 * 7 }, (_, index) => index);

export function GitHubLoading() {
  return <section id="github" aria-label="GitHub and open source" className="site-section px-6 py-28 sm:px-8 lg:py-40">
    <div className="mx-auto max-w-7xl">
      <SectionHeading index="06" kicker="OPEN SOURCE" title="Work in the open." description="A verified contribution history and repository selection will appear when an account is connected." />
      <div role="status" aria-live="polite" className="mt-14 border-y border-slate-300/75 py-10 font-mono text-xs text-slate-500">GITHUB / LOADING DATA…</div>
    </div>
  </section>;
}

function GitHubPanel({ snapshot }: { snapshot: GitHubSnapshot }) {
  const days = snapshot.status === "ready" ? snapshot.contributions : [];
  const repos = snapshot.status === "ready" ? snapshot.repositories : [];
  return <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.6fr)] lg:gap-16">
    <div className="min-w-0 border-t border-slate-300/75 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] tracking-[0.14em] text-slate-600">
        <span>CONTRIBUTION FIELD / {snapshot.status === "ready" && days.length ? "VERIFIED DATA" : "DATA PENDING"}</span>
        <span>{snapshot.username ? `@${snapshot.username}` : "ACCOUNT NOT CONNECTED"}</span>
      </div>
      <div className="mt-8 overflow-x-auto pb-2">
        <div className="grid w-full min-w-[660px] grid-flow-col grid-rows-[repeat(7,minmax(0,1fr))] gap-[3px]" role="img" aria-label={days.length ? "Contribution activity graph" : "Contribution graph placeholder; no activity data is available"}>
          {graphCells.map(index => {
            const day = days[index];
            return <span key={index} aria-hidden="true" className={`aspect-square w-full ${day ? levelStyles[day.level] : "border border-slate-300/80 bg-transparent"}`} title={day ? `${day.date}: contribution level ${day.level}` : undefined} />;
          })}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-5 font-mono text-[10px] tracking-widest text-slate-600">
        <span>GRAPH STATUS</span><span className="h-px w-8 bg-cobalt/50" aria-hidden="true" />
        <span>{snapshot.status === "unconfigured" ? "[GITHUB USERNAME PENDING]" : snapshot.status === "empty" ? "NO VERIFIED ACTIVITY AVAILABLE" : snapshot.status === "error" ? snapshot.message : "ACTIVITY LOADED"}</span>
      </div>
    </div>
    <div className="border-t border-slate-300/75 pt-6">
      <p className="font-mono text-[10px] tracking-[0.14em] text-slate-600">REPOSITORY HIGHLIGHTS</p>
      {repos.length ? <ul className="mt-5">{repos.map((repo, index) => <li key={repo.name} className="border-b border-slate-300/75 py-5">
        <div className="flex gap-4"><span className="font-mono text-[10px] text-cobalt">{String(index + 1).padStart(2, "0")}</span>
          <div className="min-w-0"><h3 className="break-words font-heading text-lg text-graphite">{repo.name}</h3>{repo.description && <p className="mt-2 text-sm text-[#52606F]">{repo.description}</p>}{repo.language && <p className="mt-3 font-mono text-[10px] text-slate-500">{repo.language}</p>}{repo.url && <a href={repo.url} className="mt-3 inline-block text-xs text-cobalt underline underline-offset-4 focus-visible:outline-cobalt">Open repository ↗</a>}</div>
        </div>
      </li>)}</ul> : <div className="mt-5 space-y-0" aria-label="Repository highlights pending">
        {["REPOSITORY_01", "REPOSITORY_02"].map((item, index) => <div key={item} className="flex items-center gap-4 border-b border-slate-300/75 py-6 font-mono text-xs text-slate-500"><span className="text-cobalt/70">{String(index + 1).padStart(2, "0")}</span><span>[{item} PENDING]</span></div>)}
      </div>}
    </div>
  </div>;
}

export function GitHubSection() {
  const snapshot = getGitHubSnapshot();
  return <section id="github" aria-label="GitHub and open source" className="site-section px-6 py-28 sm:px-8 lg:py-40">
    <div className="mx-auto max-w-7xl">
      <div className="section-reveal"><SectionHeading index="06" kicker="OPEN SOURCE" title="Work in the open." description="A verified contribution history and repository selection will appear when an account is connected." /></div>
      <GitHubPanel snapshot={snapshot} />
    </div>
  </section>;
}
