export function SectionHeading({ index, kicker, title, description, light = false, titleId }: {
  index: string;
  kicker: string;
  title: string;
  description?: string;
  light?: boolean;
  titleId?: string;
}) {
  return (
    <header className="grid gap-5 border-t border-current/15 pt-5 md:grid-cols-[minmax(180px,0.28fr)_1fr] md:gap-10">
      <p className={`font-mono text-[11px] tracking-[0.2em] ${light ? "text-cyan" : "text-cobalt"}`}>
        {index} / {kicker}
      </p>
      <div>
        <h2 id={titleId} className="max-w-4xl font-heading text-4xl font-medium leading-[1.02] tracking-[-0.065em] sm:text-5xl lg:text-7xl">
          {title}
        </h2>
        {description && <p className={`mt-6 max-w-2xl text-base leading-relaxed ${light ? "text-slate-300" : "text-[#52606F]"}`}>{description}</p>}
      </div>
    </header>
  );
}
