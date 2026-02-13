import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Timer, Users } from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-slate-400">{label}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-white/10 bg-slate-950/60 p-2 text-sky-300">
          {icon}
        </div>
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-400">{body}</div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingHome() {
  return (
    <MarketingShell>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
                <Sparkles className="h-3.5 w-3.5" /> AI-powered content ops
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Turn event posters into IG posts, Stories, and cross-platform content in minutes.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
                Scale X Social OS is built for agencies and multi-outlet teams: upload a poster, generate a brand-fit caption,
                review once, and publish with role-based controls.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="mailto:hello@scalex.my?subject=Scale%20X%20Social%20OS%20Demo"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950"
                >
                  Book a demo <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="https://ai.scalex.my"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-slate-900/40 px-5 py-3 font-semibold text-slate-100"
                >
                  Open the app
                </a>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Stat label="Fewer wrong-outlet posts" value="Role-gated" />
                <Stat label="Faster approvals" value="1 flow" />
                <Stat label="Clear accountability" value="Audit trail" />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-950/60 p-6">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-sm font-semibold text-slate-200">How it works</div>
                <ol className="mt-4 space-y-4 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-slate-950 text-xs font-black">1</span>
                    <div>
                      <div className="font-semibold">Upload poster</div>
                      <div className="mt-1 text-slate-400">Drag and drop JPG/PNG. Cloud-hosted for publishing.</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-slate-950 text-xs font-black">2</span>
                    <div>
                      <div className="font-semibold">Generate caption + hashtags</div>
                      <div className="mt-1 text-slate-400">AI detects outlet vibe and writes a ready-to-post draft.</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-400 text-slate-950 text-xs font-black">3</span>
                    <div>
                      <div className="font-semibold">Publish or queue</div>
                      <div className="mt-1 text-slate-400">Post, Story, or both. Queue for later with one click.</div>
                    </div>
                  </li>
                </ol>
                <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-xs text-slate-300">
                  Built for internal reliability first. Ready to productize when you want.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="text-2xl font-black tracking-tight">Operational features that actually matter</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            This is designed for agencies managing multiple outlets and teams, not creators managing one account.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Feature
              icon={<Users className="h-5 w-5" />}
              title="Role-based outlet control"
              body="Agency managers can publish everywhere. Bar managers can publish only to their outlet."
            />
            <Feature
              icon={<Timer className="h-5 w-5" />}
              title="Queue, retry, and history"
              body="Queued posts, publish history, and failure retries so nothing gets lost in chat groups."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="Audit trail by outlet"
              body="See who published what, when, and where. Reduce mistakes and speed up coordination."
            />
            <Feature
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Story-safe formatting"
              body="Automatically generates a 9:16 padded version for Stories when the poster is square/landscape."
            />
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Ready when you want to sell it</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Add pricing, connect more channels, and layer on SSO and approvals. The workflow stays the same.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-slate-950/40 px-5 py-3 font-semibold"
                >
                  See features
                </Link>
                <a
                  href="mailto:hello@scalex.my?subject=Scale%20X%20Social%20OS%20Pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950"
                >
                  Talk pricing
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
