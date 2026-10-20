import Link from "next/link";
import { SITE } from "@/lib/site";
import { InquiryDialog } from "@/components/InquiryDialog";

export function Header() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="wrap flex items-center justify-between py-4">
        <Link href="/" className="font-serif text-xl tracking-tight no-underline">
          {SITE.name}
          <span className="ml-2 hidden text-xs uppercase tracking-[0.2em] text-muted sm:inline">Catalonia</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/venues" className="no-underline hover:underline">Venues</Link>
          <Link href="/for-venues" className="hidden no-underline hover:underline sm:inline">For venue owners</Link>
          <InquiryDialog label="Request a shortlist" size="sm" contactEmail={SITE.contactEmail} />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="wrap grid gap-8 py-12 text-sm sm:grid-cols-3">
        <div>
          <p className="font-serif text-lg">{SITE.name}</p>
          <p className="mt-2 text-muted">{SITE.tagline}.</p>
        </div>
        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link href="/venues">All venues</Link></li>
            <li><Link href="/regions/penedes">Penedès</Link></li>
            <li><Link href="/regions/emporda">Empordà</Link></li>
            <li><Link href="/for-venues">For venue owners</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">About</p>
          <p className="mt-3 text-muted">
            {SITE.name} is operated by{" "}
            <a href={SITE.operator.url} className="underline">{SITE.operator.name}</a>, an executive coaching and
            offsite facilitation firm based in Barcelona.
          </p>
          <p className="mt-3"><Link href="/privacy">Privacy notice</Link></p>
        </div>
      </div>
    </footer>
  );
}
