import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-slate-600 hover:text-slate-950 transition"
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
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="leading-none">
              <div className="font-display text-base font-black tracking-tight text-slate-950">
                Flext<span className="text-[#155EEF]">.</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.34em] text-slate-600">Social OS</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink href="/security" label="Security" />
            <NavLink href="/pricing" label="Pricing" />
            <a
              href="https://ai.scalex.my"
              className="inline-flex items-center justify-center rounded-xl bg-[#155EEF] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0f4fcf] transition"
            >
              Open app <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </nav>

          <details className="relative md:hidden">
            <summary className="list-none inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm">
              <Menu className="mr-2 h-4 w-4" /> Menu
            </summary>
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
              <div className="p-3 space-y-2">
                <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" href="/security">Security</Link>
                <Link className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50" href="/pricing">Pricing</Link>
                <a
                  href="https://ai.scalex.my"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-[#155EEF] px-3 py-2 text-sm font-semibold text-white"
                >
                  Open app <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </details>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3">
          <div>
            <div className="text-base font-black tracking-tight">Flext</div>
            <p className="mt-2 max-w-sm text-sm text-slate-600">
              Social publishing control center for agencies and multi-outlet teams. Fast drafts, safer posting.
            </p>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-slate-900">Product</div>
            <div className="mt-3 space-y-2 text-slate-700">
              <Link href="/security" className="block hover:text-slate-950">Security</Link>
              <Link href="/pricing" className="block hover:text-slate-950">Pricing</Link>
            </div>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-slate-900">Contact</div>
            <div className="mt-3 space-y-2 text-slate-700">
              <a className="block hover:text-slate-950" href="mailto:hello@scalex.my">hello@scalex.my</a>
              <a className="block hover:text-slate-950" href="https://ai.scalex.my">ai.scalex.my</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
