import { CheckCircle2, Lock, Shield, Users } from "lucide-react";
import MarketingShell from "@/components/marketing/marketing-shell";

export default function SecurityPage() {
  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h1 className="text-4xl font-black tracking-tight">Security</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Built for internal control now, with a clear path to enterprise requirements later.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-sky-300" /> Role-based access</div>
            <p className="mt-3 text-sm text-slate-300">
              Agency managers can publish across all outlets. Bar managers are restricted to their assigned outlets.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><Shield className="h-4 w-4 text-sky-300" /> Audit trail</div>
            <p className="mt-3 text-sm text-slate-300">
              Publishing activity is recorded in history: outlet, creator, timestamps, and platform result IDs.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-sky-300" /> Token storage</div>
            <p className="mt-3 text-sm text-slate-300">
              API credentials are stored as server-side environment variables. Client never sees Meta tokens.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 text-sky-300" /> Enterprise path</div>
            <p className="mt-3 text-sm text-slate-300">
              Add SSO, approvals, per-outlet OAuth, and permissioned audit exports when you productize.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/60 p-8">
          <h2 className="text-2xl font-black tracking-tight">Recommended when selling</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            {[
              "SSO (SAML/OIDC) and enforced MFA",
              "Per-customer OAuth connections (no shared tokens)",
              "Approval workflows and publishing locks",
              "Granular permissions by outlet + channel",
              "Audit export and immutable logs",
              "Rate limits, abuse detection, and IP allowlists",
            ].map((text) => (
              <li key={text} className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">{text}</li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
