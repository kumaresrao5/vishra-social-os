import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarClock,
  Check,
  Layers3,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
      {children}
    </span>
  );
}

function SectionHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-5">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-emerald-700/80">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
      </div>
      <p className="text-sm leading-relaxed text-slate-600 lg:col-span-7 lg:pl-6">{body}</p>
    </div>
  );
}

function BentoCard({
  title,
  body,
  icon,
  tone = "default",
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
  tone?: "default" | "mint" | "sky";
}) {
  const toneCls =
    tone === "mint"
      ? "bg-[radial-gradient(800px_300px_at_10%_0%,rgba(16,185,129,0.18),transparent_60%),linear-gradient(to_bottom,#ffffff,#fbfbf8)]"
      : tone === "sky"
        ? "bg-[radial-gradient(800px_300px_at_10%_0%,rgba(14,165,233,0.16),transparent_60%),linear-gradient(to_bottom,#ffffff,#fbfbf8)]"
        : "bg-white";

  return (
    <div className={`rounded-3xl border border-black/10 p-6 shadow-sm ${toneCls}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white text-slate-950">
          {icon}
        </div>
        <div>
          <div className="text-base font-black tracking-tight">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{body}</div>
        </div>
      </div>
    </div>
  );
}

function MiniMock() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(900px_450px_at_80%_-20%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(900px_450px_at_-10%_120%,rgba(16,185,129,0.16),transparent_55%)]" />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-black tracking-tight text-slate-950">Flext</div>
          <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
            Live draft
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-slate-50 p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Poster</div>
            <div className="mt-3 aspect-[4/5] w-full rounded-xl border border-black/10 bg-[linear-gradient(145deg,#0f172a,#0b1220)]">
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-200">Upload</div>
                  <div className="mt-1 text-[11px] text-slate-400">JPG/PNG</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Caption</div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                Outlet: Barley & Hops
              </span>
            </div>

            <div className="mt-3 rounded-xl border border-black/10 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              Get ready for tonight. DJ set, deals, and a packed floor from 10PM. Bring the crew.
              <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                {["#BukitBintang", "#Nightlife", "#PubLife", "#SaturdayNight"].map((t) => (
                  <span key={t} className="rounded-full border border-black/10 bg-white px-2 py-0.5 text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Post
              </div>
              <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                Story
              </div>
              <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-xs font-semibold text-white">
                Publish
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { k: "Roles", v: "Outlet-safe" },
            { k: "Queue", v: "Retry-ready" },
            { k: "Speed", v: "Batch flow" },
          ].map((x) => (
            <div key={x.k} className="rounded-2xl border border-black/10 bg-white px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{x.k}</div>
              <div className="mt-1 text-sm font-black tracking-tight text-slate-950">{x.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
        {q}
        <span className="float-right text-slate-400 group-open:rotate-180 transition">⌄</span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
    </details>
  );
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5 lg:pt-4">
            <Pill>
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              Internal ops, product-ready later
            </Pill>

            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Posting ops for multi-outlet teams that can not afford mistakes.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700">
              Flext turns event posters into outlet-fit captions and publishes to Instagram with role-based control.
              Batch, queue, audit, retry, and let outlet managers post safely without waiting.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="https://ai.scalex.my"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 transition"
              >
                Open the app <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition"
              >
                See pricing
              </Link>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Outlet control", value: "Role-gated" },
                { label: "Posting speed", value: "Batch-first" },
                { label: "Accountability", value: "Audit trail" },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
                  <div className="text-lg font-black tracking-tight text-slate-950">{s.value}</div>
                  <div className="mt-1 text-sm text-slate-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <MiniMock />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <SectionHead
          eyebrow="Designed for teams"
          title="Built for agency reality"
          body="Not another creator tool. Flext is designed around outlets, roles, and the boring-but-critical controls that prevent wrong-page posting."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <BentoCard
            tone="mint"
            icon={<BadgeCheck className="h-5 w-5" />}
            title="Outlet-safe by permissions"
            body="Even if someone uploads the wrong poster, they cannot publish outside their assigned outlet."
          />
          <BentoCard
            tone="sky"
            icon={<Zap className="h-5 w-5" />}
            title="Fast drafts, easy edits"
            body="Generate caption + hashtags from the poster, then edit quickly before publishing."
          />
          <BentoCard
            icon={<CalendarClock className="h-5 w-5" />}
            title="Queue, retry, and history"
            body="Queue posts, publish in batches, and retry failures without losing context in chat groups."
          />
          <BentoCard
            icon={<Layers3 className="h-5 w-5" />}
            title="Post, Story, and carousels"
            body="Publish feed posts, Stories, or both. Carousels help you post magazine-style when needed."
          />
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Boxes className="h-4 w-4 text-emerald-700" /> Personas and workflows
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Flext is designed around two real users and two real flows. The UI stays fast because it stays opinionated.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    who: "Agency manager",
                    lines: ["Batch posts across outlets", "Fix drafts fast", "Audit + retry failures"],
                  },
                  {
                    who: "Outlet manager",
                    lines: ["Upload poster", "Generate caption", "Publish to their outlet only"],
                  },
                ].map((x) => (
                  <div key={x.who} className="rounded-2xl border border-black/10 bg-slate-50 p-5">
                    <div className="text-sm font-black tracking-tight text-slate-950">{x.who}</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-700">
                      {x.lines.map((t) => (
                        <li key={t} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 text-emerald-700" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Shield className="h-4 w-4 text-sky-700" /> Channels roadmap
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Instagram is live. Add channels as you productize.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {[
                  "Instagram feed + stories (live)",
                  "Facebook Pages per outlet (next)",
                  "TikTok (OAuth + video conversion)",
                  "X (OAuth + posting)",
                  "Threads (API availability dependent)",
                ].map((t) => (
                  <li key={t} className="rounded-2xl border border-black/10 bg-slate-50 px-4 py-2">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:pb-20">
        <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-sm sm:p-10">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700/80">60-second evaluation</p>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Try it with one poster</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Open the app, upload a poster, generate a draft, and publish. If you want a demo video here later, send a Loom link and we will embed it.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-5 md:items-end">
              <a
                href="https://ai.scalex.my"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 transition md:w-auto"
              >
                Open app <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <Link
                href="/features"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition md:w-auto"
              >
                See features
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <SectionHead
          eyebrow="FAQ"
          title="Questions before you ship it to your team"
          body="Short answers to the things agencies and outlet managers ask before they use it daily."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FAQItem
            q="Can bar managers publish without waiting for the agency manager?"
            a="Yes. Bar managers can publish immediately, but only to their assigned outlet(s)."
          />
          <FAQItem
            q="How do you prevent wrong-outlet posting?"
            a="Publishing is permission-gated by outlet. The UI can suggest a brand, but permissions enforce where it can post."
          />
          <FAQItem
            q="Does it support Story formatting?"
            a="Yes. If the poster is not 9:16, Flext generates a padded story-safe version automatically."
          />
          <FAQItem
            q="Can you add TikTok, X, Threads, and Facebook?"
            a="Facebook is straightforward via Meta APIs. TikTok/X/Threads require OAuth and platform constraints. The architecture is ready for multi-channel."
          />
        </div>
      </section>
    </MarketingShell>
  );
}
