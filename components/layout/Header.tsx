export function Header({ inverse = false }: { inverse?: boolean }) {
  return (
    <header
      className={`flex items-center justify-between px-5 py-5 md:px-10 ${
        inverse ? 'text-white' : 'text-foreground'
      }`}
    >
      <a className="text-lg font-semibold tracking-[0.18em]" href="/">
        WAYLOG
      </a>
      <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.16em] md:flex">
        <a href="/dashboard">Journeys</a>
        <a href="/passport">Passport</a>
        <a href="/#about">About</a>
        <a href="/journeys/new">Start</a>
      </nav>
      <a
        className="rounded-full border border-current/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] md:hidden"
        href="/journeys/new"
      >
        Start
      </a>
    </header>
  );
}
