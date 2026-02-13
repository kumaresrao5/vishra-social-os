import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Sparkles, Timer, Users } from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
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
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-black/10 bg-white p-2 text-sky-700">
          {icon}
        </div>
        <div>
          <div className="text-base font-semibold">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{body}</div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
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
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> AI-powered posting ops
              </p>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                Turn event posters into consistent posts in minutes, across outlets and staff.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700">
                Flext Social OS is built for agencies and multi-outlet teams. Upload a poster, generate a brand-fit caption,
                review quickly, then publish or queue with role-based permissions.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="mailto:hello@scalex.my?subject=Flext%20Social%20OS%20Demo"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
                >
                  Book a demo <ArrowRight className="ml-2 h-4 w-4" />
                </a>
                <a
                  href="https://ai.scalex.my"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-5 py-3 font-semibold text-slate-900 shadow-sm"
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

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <div className="text-sm font-semibold text-slate-900">How it works</div>
                <ol className="mt-4 space-y-4 text-sm text-slate-700">
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-black">1</span>
                    <div>
                      <div className="font-semibold">Upload poster</div>
                      <div className="mt-1 text-slate-600">Drag and drop JPG/PNG. Stored and prepared for publishing.</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-black">2</span>
                    <div>
                      <div className="font-semibold">Generate caption + hashtags</div>
                      <div className="mt-1 text-slate-600">AI writes a ready-to-post draft matched to the outlet vibe.</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-white text-xs font-black">3</span>
                    <div>
                      <div className="font-semibold">Publish or queue</div>
                      <div className="mt-1 text-slate-600">Post, Story, or both. Queue for later and retry failures.</div>
                    </div>
                  </li>
                </ol>
                <div className="mt-6 rounded-xl border border-black/10 bg-sky-50 p-4 text-xs text-slate-700">
                  Built for internal reliability first. Product-ready when you decide to sell.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="text-2xl font-black tracking-tight">Operational features that actually matter</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
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
                <p className="mt-2 text-sm text-slate-700">
                  Add pricing, connect more channels, and layer on SSO and approvals. The workflow stays the same.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white/70 px-5 py-3 font-semibold shadow-sm"
                >
                  See features
                </Link>
                <a
                  href="mailto:hello@scalex.my?subject=Flext%20Social%20OS%20Pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
                >
                  Talk pricing
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-2xl font-black tracking-tight">A real look at the product</h2>
              <p className="mt-2 text-sm text-slate-600">
                These are screenshots from the live app experience: create, queue, history, and admin controls.
              </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { src: "/marketing/screens/app-create.svg", label: "Composer workflow" },
                  { src: "/marketing/screens/app-queue.svg", label: "Publishing queue" },
                  { src: "/marketing/screens/app-history.svg", label: "History + retry" },
                  { src: "/marketing/screens/app-admin.svg", label: "User admin + roles" },
                ].map((img) => (
                  <div key={img.src} className="overflow-hidden rounded-2xl border border-black/10 bg-white/70 shadow-sm">
                    <div className="aspect-[16/10]">
                      <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
                    </div>
                    <div className="px-4 py-3 text-sm font-semibold text-slate-900">{img.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm">
              <h3 className="text-xl font-black tracking-tight">60-second walkthrough</h3>
              <p className="mt-2 text-sm text-slate-600">
                Short demo video of the real workflow: login, create a draft, check queue/history.
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-white p-5">
                <p className="text-sm text-slate-700">
                  Want a clean demo video here? Record a 60s Loom and we will embed it.
                </p>
                <a
                  href="https://ai.scalex.my"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white"
                >
                  View live app
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-black tracking-tight">FAQ</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              The real questions agencies and outlet managers ask.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <FAQItem
                q="Can bar managers publish without waiting for an agency manager?"
                a="Yes. Bar managers can publish immediately, but only to their assigned outlets."
              />
              <FAQItem
                q="How do you prevent posting to the wrong outlet?"
                a="Users are scoped to outlets. Even if the AI detects a brand incorrectly, the publish step is permission-gated."
              />
              <FAQItem
                q="Do you support Stories correctly (9:16)?"
                a="Yes. If the poster is not 9:16, the system generates a padded story-safe version automatically."
              />
              <FAQItem
                q="Can we add TikTok, Facebook, X, and Threads?"
                a="Facebook is straightforward via Meta APIs. TikTok/X/Threads require OAuth and platform approvals. The product is designed to add channels cleanly when you're ready."
              />
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
