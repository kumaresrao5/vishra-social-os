import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileSpreadsheet,
  Layers3,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

const PRODUCT_NAME = "Quotiva";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f2ee] text-slate-950">
      <TopNav />
      <Hero />
      <FeatureGrid />
      <FlowSection />
      <QualitySection />
      <FinalCTA />
      <SiteFooter />
    </main>
  );
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={["mx-auto w-full max-w-[1160px] px-6", className ?? ""].join(" ")}>{children}</div>;
}

function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f4f2ee]/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0f172a] text-[#f8fafc]">
            <Layers3 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-base font-black tracking-tight">{PRODUCT_NAME}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Invoice + Quote Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          >
            Open Builder
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Create PDF
          </Link>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-14 md:pt-20">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#1f4b99]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#b45309]/15 blur-3xl" />

      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="sx-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-[#b45309]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">Template-Locked PDF Engine</span>
            </div>

            <h1 className="mt-6 font-display text-[50px] font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[62px] lg:text-[74px]">
              Make Invoices
              <span className="block text-[#1d4ed8]">and Quotations</span>
              <span className="block">That Match Exactly.</span>
            </h1>

            <p className="mt-6 max-w-[38rem] text-[15px] leading-7 text-slate-700">
              {PRODUCT_NAME} generates production-ready PDFs using your real document style. Same structure, same spacing, same branding.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#0f172a] px-5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Launch Generator <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-8 grid max-w-[34rem] grid-cols-1 gap-2 text-xs text-slate-700 sm:grid-cols-3">
              <Stat label="Exact Template Match" value="Pixel-locked" />
              <Stat label="Generator Modes" value="Invoice + Quote" />
              <Stat label="Output" value="A4 PDF" />
            </div>
          </div>

          <div className="sx-fade-in lg:pl-4">
            <PreviewCard />
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-300/70 bg-white/80 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function PreviewCard() {
  const lines = [
    ["Vention CAT8 LAN Cable 1M", "25", "RM 15.00", "RM 375.00"],
    ["Vention CAT8 LAN Cable 1.5M", "50", "RM 17.00", "RM 850.00"],
    ["Vention CAT8 LAN Cable 2M", "50", "RM 19.00", "RM 950.00"],
  ];

  return (
    <div className="rounded-[22px] border border-slate-300/80 bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.14)]">
      <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Preview</p>
            <p className="mt-1 text-sm font-bold text-slate-900">Invoice A00233</p>
          </div>
          <span className="rounded-full bg-[#1d4ed8] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">Ready</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="grid grid-cols-[1fr_70px_90px_100px] gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            <span>Item</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Amount</span>
          </div>
          {lines.map((line) => (
            <div key={line[0]} className="grid grid-cols-[1fr_70px_90px_100px] gap-2 border-b border-slate-100 px-3 py-2 text-xs text-slate-700">
              <span>{line[0]}</span>
              <span>{line[1]}</span>
              <span>{line[2]}</span>
              <span>{line[3]}</span>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_100px] items-center bg-[#1d4ed8] px-3 py-2 text-xs font-semibold text-white">
            <span>Total (MYR)</span>
            <span className="text-right">RM 4,235.00</span>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Template: 2-page A4 invoice</div>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">Footer + enquiry bar included</div>
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const cards = [
    {
      icon: <Wand2 className="h-5 w-5 text-[#1d4ed8]" />,
      title: "Template-Locked Rendering",
      body: "Uses your original layout as the base and writes only dynamic fields. Output stays aligned with your approved format.",
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5 text-[#1d4ed8]" />,
      title: "Item Table Builder",
      body: "Edit quantities, rates, and descriptions in one form. Totals and amounts are calculated and formatted automatically.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-[#1d4ed8]" />,
      title: "Production Safe PDFs",
      body: "Consistent A4 output with stable typography and footer data for clean customer-facing invoices and quotations.",
    },
  ];

  return (
    <section className="pb-18">
      <Container>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-slate-300/70 bg-white p-6 shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 bg-slate-50">{card.icon}</div>
              <h3 className="mt-4 text-base font-black tracking-tight text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FlowSection() {
  const steps = [
    {
      title: "Pick Document Type",
      body: "Start with Invoice or Quotation inside the builder.",
    },
    {
      title: "Fill Parties + Items",
      body: "Enter billed/quoted parties, dates, terms, and line items.",
    },
    {
      title: "Download Final PDF",
      body: "Generate a finished PDF with your exact visual structure.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16">
      <Container>
        <div className="rounded-3xl border border-slate-300/70 bg-[#0f172a] p-8 text-white md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">Workflow</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">Fast Path to Ready-to-Send Documents</h2>
            </div>
            <Link
              href="/docs"
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-semibold text-slate-900 hover:bg-slate-100"
            >
              Open Builder
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/30 text-xs font-black">
                  {index + 1}
                </div>
                <h3 className="mt-3 text-sm font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function QualitySection() {
  const points = [
    "Invoice and quote generator in one workflow",
    "Totals, words, footer fields, and enquiry line included",
    "Built to match your reference PDFs",
    "Simple form UI for daily operations",
  ];

  return (
    <section className="pb-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Why {PRODUCT_NAME}</p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Looks Complete Because It Is Complete</h2>
            <p className="mt-4 max-w-[36rem] text-sm leading-7 text-slate-700">
              This homepage and builder are focused on one job: producing accurate, client-ready invoices and quotations quickly, with the exact style you approved.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-300/70 bg-white p-6">
            <ul className="space-y-3">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-800">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="pb-20 pt-4">
      <Container>
        <div className="rounded-3xl border border-slate-300/70 bg-gradient-to-r from-[#1d4ed8] to-[#0f172a] px-8 py-10 text-white md:px-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-200">Ready</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight md:text-4xl">Start Generating with {PRODUCT_NAME}</h2>
              <p className="mt-3 max-w-[34rem] text-sm text-white/85">
                Open the builder, fill your details, and download invoice or quotation PDFs instantly.
              </p>
            </div>

            <Link
              href="/docs"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-xs font-semibold text-slate-900 hover:bg-slate-100"
            >
              Go to /docs <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-300/60 bg-[#f4f2ee] py-8">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 text-sm text-slate-600 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4" />
            <span className="font-semibold text-slate-900">{PRODUCT_NAME}</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.15em]">Invoice + Quotation Generator</div>
        </div>
      </Container>
    </footer>
  );
}
