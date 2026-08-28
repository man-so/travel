import Link from 'next/link';

export function Header({ inverse = false }: { inverse?: boolean }) {
  return (
    <header
      className={`flex items-center justify-between px-5 py-5 md:px-10 ${
        inverse ? 'text-white' : 'text-foreground'
      }`}
    >
      <Link className="text-lg font-semibold tracking-[0.18em]" href="/">
        WAYLOG
      </Link>
      <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.16em] md:flex">
        <Link href="/dashboard">Journeys</Link>
        <Link href="/#about">About</Link>
        <Link href="/journeys/new">Start</Link>
      </nav>
      <Link
        className="rounded-full border border-current/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] md:hidden"
        href="/journeys/new"
      >
        Start
      </Link>
    </header>
  );
}
