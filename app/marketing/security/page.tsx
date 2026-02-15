import { BadgeCheck, CheckCircle2, Lock, Shield, Users } from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

const ACCENT = "#155EEF";

function StatPill({ label }: { label: string }) {
  return (
    <span
      className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em]"
      style={{ background: "#EAF2FF", color: ACCENT, border: "1px solid rgba(2,6,23,0.08)" }}
    >
      {label}
    </span>
  );
}

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center sm:pb-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
          Security + control
        </p>
        <h1 className="font-display mt-8 text-4xl font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl">
          POSTING OPS
          <br />
          <span className="text-slate-400">WITH GUARDRAILS.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-600">
          Built for internal control now, with a clean path to enterprise requirements later.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <StatPill label="ROLE-GATED" />
          <StatPill label="AUDIT TRAIL" />
          <StatPill label="TOKENS SERVER-SIDE" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:pb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Role-based access",
              body: "Agency managers publish across all outlets. Bar managers are restricted to assigned outlet(s).",
              icon: <Users className="h-5 w-5" style={{ color: ACCENT }} />,
            },
            {
              title: "Audit trail",
              body: "History records outlet, creator, timestamps, and platform result IDs (post + story).",
              icon: <Shield className="h-5 w-5" style={{ color: ACCENT }} />,
            },
            {
              title: "Token storage",
              body: "Credentials live server-side as environment variables. The client never sees Meta tokens.",
              icon: <Lock className="h-5 w-5" style={{ color: ACCENT }} />,
            },
            {
              title: "Enterprise path",
              body: "Add SSO, approvals, per-outlet OAuth, and permissioned audit exports when you productize.",
              icon: <BadgeCheck className="h-5 w-5" style={{ color: ACCENT }} />,
            },
          ].map((it) => (
            <div key={it.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-black/10 bg-white">
                {it.icon}
              </div>
              <p className="mt-4 text-sm font-black tracking-tight text-slate-950">{it.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-black/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: ACCENT }}>
                When you sell it
              </p>
              <h2 className="mt-2 font-display text-2xl font-black tracking-[-0.02em] text-slate-950">
                Recommended controls
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: ACCENT }} />
              Enterprise ready
            </span>
          </div>
          <ul className="grid gap-3 p-6 text-sm text-slate-700 sm:grid-cols-2">
            {[
              "SSO (SAML/OIDC) and enforced MFA",
              "Per-customer OAuth connections (no shared tokens)",
              "Approval workflows and publishing locks",
              "Granular permissions by outlet + channel",
              "Audit export and immutable logs",
              "Rate limits, abuse detection, and IP allowlists",
            ].map((text) => (
              <li key={text} className="rounded-xl border border-black/10 bg-white px-4 py-3">
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
