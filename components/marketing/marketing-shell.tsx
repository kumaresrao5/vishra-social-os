import Link from "next/link";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-300 hover:text-white transition"
    >
      {label}
    </Link>
  );
}

export default function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="leading-none">
              <div className="text-lg font-black tracking-tight">SCALE X</div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-sky-300/85">Social OS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/features" label="Features" />
            <NavLink href="/security" label="Security" />
            <NavLink href="/pricing" label="Pricing" />
            <a
              href="https://ai.scalex.my"
              className="inline-flex items-center justify-center rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Login
            </a>
          </nav>

          <a
            href="https://ai.scalex.my"
            className="md:hidden inline-flex items-center justify-center rounded-lg bg-sky-400 px-3 py-2 text-sm font-semibold text-slate-950"
          >
            Login
          </a>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="text-base font-bold">Scale X</div>
            <p className="mt-2 text-sm text-slate-400">
              Internal-grade social automation that becomes enterprise-ready when you decide to sell.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Product</div>
            <div className="mt-2 space-y-2 text-slate-300">
              <Link href="/features" className="block hover:text-white">Features</Link>
              <Link href="/security" className="block hover:text-white">Security</Link>
              <Link href="/pricing" className="block hover:text-white">Pricing</Link>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold">Get Started</div>
            <div className="mt-2 space-y-2 text-slate-300">
              <a className="block hover:text-white" href="https://ai.scalex.my">Open App</a>
              <a className="block hover:text-white" href="mailto:hello@scalex.my">hello@scalex.my</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
