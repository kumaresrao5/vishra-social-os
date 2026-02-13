import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  Gauge,
  Layers3,
  Lock,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

const ACCENT = "#155EEF";

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-[#155EEF] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm hover:bg-[#0f4fcf] transition"
    >
      {children}
    </a>
  );
}

function SecondaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-900 shadow-sm hover:bg-slate-50 transition"
    >
      {children}
    </a>
  );
}

function MetricRow() {
  const items = [
    { icon: <Layers3 className="h-4 w-4" />, label: "ROLE-GATED" },
    { icon: <Lock className="h-4 w-4" />, label: "SAFETY" },
    { icon: <ClipboardCheck className="h-4 w-4" />, label: "BATCH + QUEUE" },
    { icon: <Zap className="h-4 w-4" />, label: "SPEED" },
    { icon: <Shield className="h-4 w-4" />, label: "AUDIT TRAIL" },
    { icon: <Gauge className="h-4 w-4" />, label: "CLARITY" },
  ];
  return (
    <div className="mt-10 border-t border-black/10">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 py-8 sm:grid-cols-6">
        {items.map((it) => (
          <div key={it.label} className="text-center">
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg border border-black/10 bg-white text-slate-700">
              {it.icon}
            </div>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DarkFeaturePanel() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/70">
            <Sparkles className="h-3.5 w-3.5" /> Flext OS
          </p>
          <h2 className="font-display mt-5 text-3xl font-black leading-[1.05] tracking-[-0.02em] sm:text-4xl">
            Designed for
            <br />
            agency reality
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Not another creator tool. Flext is designed around outlets, roles, and the boring-but-critical controls that
            prevent wrong-page posting.
          </p>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
                Poster upload
              </p>
              <p className="mt-2 text-xs text-white/70">JPG/PNG, auto-ready for feed + story</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
                Outlet: Barley & Hops
              </p>
              <p className="mt-2 text-xs text-white/70">
                Caption draft + hashtags, matched to venue vibe
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-4 shadow-2xl">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#ffffff_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative rounded-2xl border border-white/10 bg-black/40 p-6">
              <div className="mx-auto max-w-sm">
                <div className="aspect-[9/16] w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-black/30">
                  <div className="grid h-full place-items-center">
                    <div className="text-center">
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
                        <ArrowRight className="h-5 w-5 rotate-90 text-white/60" />
                      </div>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.26em] text-white/60">Preview</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
                  Story-safe formatting
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/70">
                  9:16 padded
                </span>
              </div>
            </div>

            <div className="relative mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/60">
                Publish to Instagram
              </p>
              <a
                href="https://ai.scalex.my"
                className="inline-flex items-center justify-center rounded-xl bg-[#155EEF] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-white"
              >
                Open app <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const items = [
    {
      title: "Outlet-safe controls",
      body: "Permissions stop accidental wrong-page posting. Outlet managers can publish only for their outlet.",
      icon: <BadgeCheck className="h-5 w-5" style={{ color: ACCENT }} />,
    },
    {
      title: "Ops visibility",
      body: "Queue, retry, and history so nothing gets buried in group chats. Accountability by outlet.",
      icon: <ClipboardCheck className="h-5 w-5" style={{ color: ACCENT }} />,
    },
    {
      title: "Fast daily workflow",
      body: "Upload poster, generate draft, publish feed and Stories. Carousels when you need magazine style.",
      icon: <Zap className="h-5 w-5" style={{ color: ACCENT }} />,
    },
    {
      title: "Personas & roles",
      body: "Agency managers post across outlets. Outlet managers post instantly but only for their outlet.",
      icon: <Shield className="h-5 w-5" style={{ color: ACCENT }} />,
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
            Core modules
          </p>
          <h2 className="font-display mt-4 text-2xl font-black leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-3xl">
            A social OS your team can use daily.
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 lg:col-span-7 lg:pl-6">
          Minimal interface. High control. Built for fast posting across multiple outlets without mistakes.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white">
              {it.icon}
            </div>
            <p className="mt-4 text-sm font-black tracking-tight text-slate-950">{it.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Roadmap() {
  const rows = [
    { label: "Instagram feed + stories", badge: "LIVE" },
    { label: "Facebook pages per outlet", badge: "NEXT" },
    { label: "TikTok", badge: "TBD" },
    { label: "X & Threads", badge: "PLANNED" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
      <h3 className="text-center text-xs font-semibold uppercase tracking-[0.26em] text-slate-500">Channels roadmap</h3>
      <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
        {rows.map((r, idx) => (
          <div
            key={r.label}
            className={[
              "flex items-center justify-between gap-4 px-5 py-4",
              idx !== 0 ? "border-t border-black/10" : "",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-slate-900">{r.label}</p>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em]"
              style={{
                background: r.badge === "LIVE" ? "#EAF2FF" : "#F4F4F5",
                color: r.badge === "LIVE" ? ACCENT : "#111827",
                border: "1px solid rgba(2,6,23,0.08)",
              }}
            >
              {r.badge}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Can bar managers publish without waiting?",
      a: "Yes. Outlet managers can publish immediately, but only to their assigned outlet(s).",
    },
    {
      q: "How do you prevent wrong-outlet posting?",
      a: "Posting is permission-gated by outlet. Even if someone uploads the wrong poster, they cannot publish outside their outlet.",
    },
    {
      q: "Does it support story formatting?",
      a: "Yes. If the poster is not 9:16, Flext generates a padded story-safe version automatically.",
    },
    {
      q: "Can you add TikTok, X, and Threads?",
      a: "Facebook is straightforward via Meta APIs. TikTok/X/Threads require OAuth and platform constraints, but the product is designed to add channels cleanly.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
      <h3 className="text-center text-sm font-black tracking-tight text-slate-950">FAQ</h3>
      <div className="mx-auto mt-6 max-w-2xl space-y-2">
        {items.map((it) => (
          <details key={it.q} className="group rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
              {it.q}
              <span className="float-right text-slate-400 group-open:rotate-180 transition">⌄</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-[#155EEF]">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-white">
        <h3 className="font-display text-3xl font-black tracking-[-0.02em] sm:text-4xl">Try it with one poster</h3>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://ai.scalex.my"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-sm hover:bg-slate-50 transition"
          >
            Open app <ArrowRight className="ml-2 h-4 w-4" />
          </a>
          <Link
            href="/features"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm hover:bg-white/15 transition"
          >
            See features
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-14 text-center sm:pb-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
          Built for agencies and outlet teams
        </p>

        <h1 className="font-display mt-8 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl">
          FROM POSTER TO
          <br />
          POST,
          <br />
          <span className="text-slate-400">WITHOUT MISTAKES.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-600">
          Flext is social publishing ops: generate outlet-fit captions from posters, publish feed and Stories, and keep teams
          safe with role-based outlet control.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryButton href="https://ai.scalex.my">
            Open app <ArrowRight className="ml-2 h-4 w-4" />
          </PrimaryButton>
          <SecondaryButton href="/features">See how it works</SecondaryButton>
        </div>
      </section>

      <MetricRow />
      <DarkFeaturePanel />
      <FeatureGrid />
      <Roadmap />
      <FAQ />
      <CTA />
    </MarketingShell>
  );
}

