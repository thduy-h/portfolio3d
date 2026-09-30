export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-5 z-30 px-6 lg:px-8">
      <nav
        className="glass-panel navbar-glass mx-auto flex h-14 max-w-3xl items-center justify-between rounded-full px-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)]"
        aria-label="Primary navigation"
      >
        <a href="#" className="font-heading text-sm font-semibold tracking-tight text-graphite">
          <span className="sm:hidden">LC</span>
          <span className="hidden sm:inline">LIQUID COMPUTE</span>
        </a>

        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 sm:gap-7">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>
    </header>
  );
}
