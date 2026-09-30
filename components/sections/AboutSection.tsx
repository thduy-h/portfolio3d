import { profile } from "@/data/profile";
import { SectionHeading } from "./SectionHeading";

const modules = [
  { code: "01", label: "FOCUS", values: profile.focus ? [profile.focus] : [], placeholder: "[Focus pending]" },
  { code: "02", label: "DISCIPLINES", values: profile.disciplines, placeholder: "[Disciplines pending]" },
  { code: "03", label: "CURRENT INTERESTS", values: profile.interests, placeholder: "[Interests pending]" },
];

export function AboutSection() {
  return (
    <section id="about" aria-label="About / system profile" className="site-section bg-darkSurface px-6 py-28 text-[#F4F7FA] sm:px-8 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="section-reveal"><SectionHeading index="03" kicker="SYSTEM PROFILE" title="The human behind the system." light /></div>
        <div className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:gap-24">
          <div className="relative border-l border-cyan/50 pl-7 sm:pl-10">
            <span className="absolute -left-1 top-0 h-2 w-2 bg-cyan" aria-hidden="true" />
            <p className="font-mono text-[10px] tracking-[0.18em] text-cyan">PROFILE_TEXT / AWAITING_INPUT</p>
            <p className="mt-6 max-w-3xl font-heading text-3xl leading-snug tracking-[-0.045em] text-slate-100 sm:text-4xl lg:text-5xl">{profile.summary}</p>
            {profile.location && <p className="mt-8 font-mono text-xs text-slate-400">LOCATION / {profile.location}</p>}
          </div>
          <div className="border-t border-white/15">
            {modules.map(module => <div key={module.code} className="grid grid-cols-[35px_1fr] gap-5 border-b border-white/15 py-6">
              <span className="font-mono text-[10px] text-cyan">{module.code}</span>
              <div><h3 className="font-mono text-[10px] tracking-[0.18em] text-slate-400">{module.label}</h3>
                <p className="mt-3 text-base text-slate-100">{module.values.length ? module.values.join(" · ") : module.placeholder}</p>
              </div>
            </div>)}
          </div>
        </div>
        <div className="mt-24 flex items-center gap-5 font-mono text-[10px] tracking-[0.16em] text-slate-500" aria-hidden="true"><span>IDENTITY / PENDING</span><span className="h-px flex-1 bg-white/15" /><span>NODE_7388</span></div>
      </div>
    </section>
  );
}
