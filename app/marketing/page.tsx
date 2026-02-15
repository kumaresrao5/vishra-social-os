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

function TrustBar() {
  const items = [
    { icon: <Shield className="h-4 w-4" />, label: "META GRAPH API" },
    { icon: <Layers3 className="h-4 w-4" />, label: "FEED + STORIES" },
    { icon: <BadgeCheck className="h-4 w-4" />, label: "OUTLET PERMISSIONS" },
    { icon: <ClipboardCheck className="h-4 w-4" />, label: "QUEUE + HISTORY" },
    { icon: <Zap className="h-4 w-4" />, label: "FAST DRAFTS" },
    { icon: <Gauge className="h-4 w-4" />, label: "OPS CLARITY" },
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

function Problem() {
  const pains = [
    {
      title: "Wrong outlet, wrong account",
      body: "A single mistake can damage trust. Teams need guardrails, not just a scheduler.",
    },
    {
      title: "Drafts buried in WhatsApp groups",
      body: "Approvals, edits, and files get lost. Nobody knows what posted, what failed, or what’s next.",
    },
    {
      title: "High frequency, low consistency",
      body: "Daily promos need speed. Captions drift, formatting breaks Stories, and ops gets messy.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
            The problem
          </p>
          <h2 className="font-display mt-4 text-2xl font-black leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-3xl">
            Social posting breaks in operations, not creativity.
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 lg:col-span-7">
          If you manage multiple outlets, the risks are operational: wrong account, messy approvals, and no reliable trail of
          what happened.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pains.map((p) => (
          <div key={p.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-black tracking-tight text-slate-950">{p.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
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

function SolutionModules() {
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
            The solution
          </p>
          <h2 className="font-display mt-4 text-2xl font-black leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-3xl">
            A social OS your team can actually run.
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 lg:col-span-7">
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

function Portfolio() {
  const samples = [
    {
      outlet: "Barley & Hops",
      hook: "Saturday night takeover. 10PM onwards.",
      caption: "Get ready for tonight. DJ set, deals, and a packed floor from 10PM. Bring the crew.",
      tags: ["#BukitBintang", "#KualaLumpur", "#SaturdayNight", "#PubLife"],
    },
    {
      outlet: "Fire & Ice",
      hook: "Match night + big screens.",
      caption: "Game on. Big screens, cold drinks, loud crowd. Bring your jersey and let’s run it.",
      tags: ["#SportsBar", "#MatchDay", "#BukitBintang", "#Cheers"],
    },
    {
      outlet: "Dravidian",
      hook: "Upscale late night event.",
      caption: "A night of sound and style. Dress sharp, arrive early, and stay late.",
      tags: ["#Nightlife", "#BukitBintang", "#KL", "#AfterDark"],
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
            Portfolio
          </p>
          <h2 className="font-display mt-4 text-2xl font-black leading-[1.06] tracking-[-0.02em] text-slate-950 sm:text-3xl">
            Show, don’t tell.
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600 lg:col-span-7">
          Examples of outlet-fit drafts Flext can generate from posters. Replace these with real screenshots and results as you scale.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {samples.map((s) => (
          <div key={s.outlet} className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
            <div className="border-b border-black/10 px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
                Outlet
              </p>
              <p className="mt-2 text-sm font-black tracking-tight text-slate-950">{s.outlet}</p>
              <p className="mt-2 text-sm text-slate-600">{s.hook}</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">Draft caption</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{s.caption}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { who: "Agency manager", quote: "We stopped double-checking accounts. Outlet permissions removed the biggest posting risk." },
    { who: "Outlet manager", quote: "No waiting in group chat. Upload the poster, get the caption, post it. Done." },
    { who: "Ops lead", quote: "Queue + history finally makes posting accountable. We can see what happened and retry fast." },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
          Testimonials
        </p>
        <h2 className="font-display mt-4 text-2xl font-black tracking-[-0.02em] text-slate-950 sm:text-3xl">
          Built for real teams.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
          Add real client quotes here as you productize. The layout is ready.
        </p>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {quotes.map((q) => (
          <div key={q.who} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-slate-700">“{q.quote}”</p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">{q.who}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { title: "Upload", body: "Drop a poster. Flext reads it and detects the outlet." },
    { title: "Generate", body: "Get caption + hashtags (and story-safe formatting). Edit if needed." },
    { title: "Publish", body: "Post feed, story, or both. Everything is recorded with IDs and retry." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
          Process
        </p>
        <h2 className="font-display mt-4 text-2xl font-black tracking-[-0.02em] text-slate-950 sm:text-3xl">
          How it works in 3 steps.
        </h2>
      </div>
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
        {steps.map((s, idx) => (
          <div key={s.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-700">
              <span className="grid h-5 w-5 place-items-center rounded-full text-white" style={{ background: ACCENT }}>
                {idx + 1}
              </span>
              {s.title}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{s.body}</p>
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
        <h3 className="font-display text-3xl font-black tracking-[-0.02em] sm:text-4xl">Try it with one poster today</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
          Open the app, upload a poster, and get a publish-ready draft in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://ai.scalex.my"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-sm hover:bg-slate-50 transition"
          >
            Open app <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/70">
          Limited time: onboard your outlets and roles this week
        </p>
      </div>
    </section>
  );
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      {/* 1) Hero (clear promise + one CTA) */}
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
        </div>
        <div className="mt-4 text-[11px] text-slate-600">
          <Link href="/pricing" className="font-semibold text-slate-950 hover:underline">See pricing</Link>
          <span className="mx-2 text-slate-300">•</span>
          <Link href="/security" className="font-semibold text-slate-950 hover:underline">Security</Link>
        </div>
      </section>

      {/* 2) Trust bar (proof) */}
      <TrustBar />

      {/* 3) Problem */}
      <Problem />

      {/* 4) Solution */}
      <DarkFeaturePanel />
      <SolutionModules />

      {/* 5) Portfolio */}
      <Portfolio />

      {/* 6) Testimonials */}
      <Testimonials />

      {/* 7) Process */}
      <Process />

      {/* 8) FAQ */}
      <FAQ />

      {/* 9) Final CTA */}
      <CTA />
    </MarketingShell>
  );
}
