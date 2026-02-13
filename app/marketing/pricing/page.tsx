import MarketingShell from "@/components/marketing/marketing-shell";

function Card({ title, price, body, cta }: { title: string; price: string; body: string[]; cta: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
      <div className="text-sm font-semibold text-slate-200">{title}</div>
      <div className="mt-3 text-4xl font-black tracking-tight">{price}</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {body.map((line) => (
          <li key={line} className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2">{line}</li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-4xl font-black tracking-tight">Pricing</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          When you sell this, charge for throughput and number of outlets. Keep onboarding simple.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Card
            title="Starter"
            price="$99"
            body={["1 outlet", "IG post + story", "Queue + history"]}
            cta={<a className="inline-flex w-full justify-center rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950" href="mailto:hello@scalex.my?subject=Starter%20Plan">Talk to sales</a>}
          />
          <Card
            title="Agency"
            price="$299"
            body={["Up to 5 outlets", "Roles + admin", "Audit trail", "Priority support"]}
            cta={<a className="inline-flex w-full justify-center rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950" href="mailto:hello@scalex.my?subject=Agency%20Plan">Talk to sales</a>}
          />
          <Card
            title="Enterprise"
            price="Custom"
            body={["Unlimited outlets", "SSO + approvals", "Per-customer OAuth", "Exportable audit logs"]}
            cta={<a className="inline-flex w-full justify-center rounded-xl border border-white/15 bg-slate-950/40 px-5 py-3 font-semibold" href="mailto:hello@scalex.my?subject=Enterprise%20Plan">Request quote</a>}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-black tracking-tight">What you should sell</h2>
          <p className="mt-2 text-sm text-slate-300">
            Position it as a posting operations system for multi-location nightlife and F&B brands.
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            {[
              "Outlet detection + brand-safe copy",
              "Queue + scheduling + retries",
              "Permissions to prevent mistakes",
              "Cross-platform publishing",
            ].map((text) => (
              <li key={text} className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">{text}</li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
