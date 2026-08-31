export function Header({ inverse = false }: { inverse?: boolean }) {
  return (
    <header
      className={`flex h-20 items-center justify-between border-b px-5 py-4 backdrop-blur-xl md:px-10 ${
        inverse
          ? 'border-white/20 bg-black/10 text-white'
          : 'border-border/70 bg-background/95 text-foreground'
      }`}
    >
      <a
        className={`font-heading text-3xl leading-none tracking-[-0.02em] md:text-4xl ${
          inverse ? 'text-white' : 'text-primary'
        }`}
        href="/"
      >
        WAYLOG
      </a>
      <nav className="hidden items-center gap-9 text-sm font-semibold uppercase tracking-[0.12em] md:flex">
        <a href="/dashboard">Journeys</a>
        <a href="/passport">Passport</a>
        <a href="/#about">About</a>
        <a href="/journeys/new">Start</a>
      </nav>
      <a
        className="rounded border border-current/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] md:hidden"
        href="/journeys/new"
      >
        Start
      </a>
    </header>
  );
}
