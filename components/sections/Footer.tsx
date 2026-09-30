import { profile } from "@/data/profile";

const links = [
  { href: "#work", label: "Work" },
  { href: "#projects", label: "Projects" },
  { href: "#about", label: "About" },
  { href: "#stack", label: "Stack" },
  { href: "#experience", label: "Experience" },
  { href: "#github", label: "Open source" },
  { href: "#contact", label: "Contact" },
];

export function Footer() {
  const year = new Intl.DateTimeFormat("en", { year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date());
  return <footer className="border-t border-slate-300/75 px-6 py-10 sm:px-8" aria-label="Site footer">
    <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="font-heading text-xl tracking-tight text-graphite">{profile.name ?? "[NAME PENDING]"}</p><p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-slate-500">© {year} · LIQUID COMPUTE</p></div>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-3 font-mono text-[10px] uppercase tracking-[0.13em] text-slate-600">{links.map(link => <a key={link.href} href={link.href} className="hover:text-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt">{link.label}</a>)}</nav>
    </div>
  </footer>;
}
