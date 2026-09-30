import { social } from "@/data/social";
import { SectionHeading } from "./SectionHeading";

const channels = [
  { label: "EMAIL", href: social.email ? `mailto:${social.email}` : null, display: social.email },
  { label: "GITHUB", href: social.githubUrl, display: social.githubUsername ? `@${social.githubUsername}` : social.githubUrl },
  { label: "LINKEDIN", href: social.linkedinUrl, display: social.linkedinUrl },
  { label: "RESUME", href: social.resumeUrl, display: social.resumeUrl ? "View resume" : null },
];

export function ContactSection() {
  const available = channels.filter(channel => channel.href);
  return <section id="contact" aria-label="Contact" className="site-section px-6 py-28 sm:px-8 lg:py-40">
    <div className="mx-auto max-w-7xl">
      <div className="section-reveal"><SectionHeading index="07" kicker="CONTACT" title="Let’s build something useful." description="The contact channels below will become active when verified details are supplied." /></div>
      <div className="mt-16 grid gap-12 border-t border-slate-300/75 pt-7 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)] lg:gap-20">
        <div>
          <p className="font-mono text-[10px] tracking-[0.18em] text-cobalt">TRANSMISSION / {available.length ? "CHANNEL READY" : "AWAITING ADDRESS"}</p>
          <p className="mt-8 max-w-xl font-heading text-3xl leading-snug tracking-[-0.055em] text-graphite sm:text-4xl">{available.length ? "Choose a channel to get in touch." : "[Contact information pending]"}</p>
          <div className="contact-trace mt-16 h-px w-full origin-left bg-cobalt/60" aria-hidden="true" />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-500" aria-hidden="true"><span>REQUEST</span><span>TRANSMIT</span><span>RESOLVE</span></div>
        </div>
        <div className="border-t border-slate-300/75">
          {channels.map((channel, index) => <div key={channel.label} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4 border-b border-slate-300/75 py-5">
            <span className="pt-1 font-mono text-[10px] text-cobalt">{String(index + 1).padStart(2, "0")}</span>
            <div className="min-w-0"><p className="font-mono text-[10px] tracking-[0.16em] text-slate-500">{channel.label}</p>
              {channel.href ? <a href={channel.href} className="mt-2 inline-block max-w-full break-all font-heading text-xl text-graphite underline decoration-cyan/50 underline-offset-8 transition-colors hover:text-cobalt focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt" target={channel.href.startsWith("mailto:") ? undefined : "_blank"} rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}>{channel.display ?? channel.label} ↗</a>
                : <p className="mt-2 font-heading text-xl text-slate-500">[{channel.label} PENDING]</p>}
            </div>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}
