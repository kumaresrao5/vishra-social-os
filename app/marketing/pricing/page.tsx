import MarketingShell from "@/components/marketing/marketing-shell";

const ACCENT = "#155EEF";

function Card({ title, price, body, cta }: { title: string; price: string; body: string[]; cta: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
        {title}
      </div>
      <div className="font-display mt-4 text-4xl font-black tracking-[-0.02em] text-slate-950">{price}</div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {body.map((line) => (
          <li key={line} className="rounded-xl border border-black/10 bg-white px-4 py-2">{line}</li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center sm:pb-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
          Pricing
        </p>
        <h1 className="font-display mt-8 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl">
          OUTLET-BASED,
          <br />
          <span className="text-slate-400">AGENCY-FRIENDLY.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-600">
          Simple outlet pricing. Add channels per outlet only when needed.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card
            title="Starter"
            price="RM 59"
            body={["1 outlet", "Instagram feed + story", "Queue + history", "Role-based posting (basic)"]}
            cta={
              <a
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#155EEF] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm hover:bg-[#0f4fcf] transition"
                href="mailto:hello@scalex.my?subject=Starter%20Plan"
              >
                Get starter
              </a>
            }
          />
          <Card
            title="Agency"
            price="RM 199"
            body={["Up to 5 outlets", "Roles + admin", "Audit trail", "Queue + retries", "Priority support"]}
            cta={
              <a
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#155EEF] px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm hover:bg-[#0f4fcf] transition"
                href="mailto:hello@scalex.my?subject=Agency%20Plan"
              >
                Get agency
              </a>
            }
          />
          <Card
            title="Enterprise"
            price="Custom"
            body={["Unlimited outlets", "SSO + approvals", "Per-customer OAuth", "Exportable audit logs", "Custom channels + workflows"]}
            cta={
              <a
                className="inline-flex w-full items-center justify-center rounded-xl border border-black/10 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-900 shadow-sm hover:bg-slate-50 transition"
                href="mailto:hello@scalex.my?subject=Enterprise%20Plan"
              >
                Request quote
              </a>
            }
          />
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
          <div className="border-b border-black/10 px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
              Positioning
            </p>
            <h2 className="font-display mt-2 text-2xl font-black tracking-[-0.02em] text-slate-950">
              What you should sell
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Sell it as a posting operations system for multi-location nightlife and F&B brands.
            </p>
          </div>
          <ul className="grid gap-3 p-6 text-sm text-slate-700 sm:grid-cols-2">
            {[
              "Outlet detection + brand-safe copy",
              "Queue + scheduling + retries",
              "Permissions to prevent mistakes",
              "Cross-platform publishing",
              "Optional channels per outlet (charge add-ons when needed)",
            ].map((text) => (
              <li key={text} className="rounded-xl border border-black/10 bg-white px-4 py-3">
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[28px] border border-black/10 bg-white p-6 text-sm text-slate-700 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
            Add-ons
          </div>
          <div className="mt-2 font-display text-xl font-black tracking-[-0.02em] text-slate-950">
            Channels per outlet
          </div>
          <p className="mt-2 text-slate-600">
            Some outlets only need Instagram. Others need Facebook, TikTok, X, and Threads. Keep base plans outlet-based and
            add channels per outlet as needed.
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              "Facebook Pages per outlet (add-on)",
              "TikTok per outlet (add-on, requires OAuth)",
              "X per outlet (add-on, requires OAuth)",
              "Threads per outlet (add-on, depends on API availability)",
            ].map((text) => (
              <li key={text} className="rounded-xl border border-black/10 bg-white px-4 py-3">
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 rounded-[28px] border border-black/10 bg-[#155EEF] p-8 text-center text-white shadow-sm">
          <h3 className="font-display text-3xl font-black tracking-[-0.02em] sm:text-4xl">Talk to us to enable more outlets</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            We can onboard outlets quickly and add channels as your clients expand.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:hello@scalex.my?subject=Flext%20Pricing"
              className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-950 shadow-sm hover:bg-slate-50 transition sm:w-auto"
            >
              Contact sales
            </a>
            <a
              href="https://ai.scalex.my"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-sm hover:bg-white/15 transition sm:w-auto"
            >
              Open app
            </a>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
