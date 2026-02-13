import { CheckCircle2, Clock3, Layers, Shield, Sparkles, Users } from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

function Item({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm">
      <div className="text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-slate-600">{body}</div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
        <h1 className="text-4xl font-black tracking-tight">Features</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          Built for teams managing multiple outlets and high-frequency event promos.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Item title="Poster to caption (vision + brand style)" body="Upload a poster and generate a caption + hashtags that match the outlet vibe." />
          <Item title="Publish destinations" body="Instagram feed, Instagram Stories, and expandable to Facebook/TikTok/Threads." />
          <Item title="Queue and scheduling" body="Add items to a queue and publish when ready. Great for batching content." />
          <Item title="History + retry" body="Every publish has a record: success IDs, errors, and a one-click retry for failures." />
          <Item title="Role-based access" body="Agency managers can publish everywhere. Bar managers are scoped to their outlets." />
          <Item title="Admin user management" body="Create users and assign outlet permissions without engineering." />
        </div>

        <div className="mt-10 grid gap-4 rounded-3xl border border-black/10 bg-white/70 p-8 shadow-sm md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-black/10 bg-white p-2 text-sky-700"><Sparkles className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Draft quality</div>
              <div className="mt-1 text-sm text-slate-600">Consistent tone by outlet with fast edits.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-black/10 bg-white p-2 text-sky-700"><Users className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Team ops</div>
              <div className="mt-1 text-sm text-slate-600">No more approvals lost in chat threads.</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-black/10 bg-white p-2 text-sky-700"><Shield className="h-5 w-5" /></div>
            <div>
              <div className="font-semibold">Control</div>
              <div className="mt-1 text-sm text-slate-600">Prevent wrong-outlet posting by design.</div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><Layers className="h-4 w-4 text-sky-700" /> Designed to extend</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {[
                "Facebook Pages publishing",
                "TikTok posting (OAuth + video conversion)",
                "Threads publishing when enabled",
                "Approval workflows",
                "SSO and SCIM provisioning",
              ].map((text) => (
                <li key={text} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4 text-sky-700" /> Built for speed</div>
            <p className="mt-4 text-sm text-slate-700">
              Agencies win on throughput. The UI is optimized for repeated daily use: upload, draft, publish, repeat.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
