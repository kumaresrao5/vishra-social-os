"use client";

import { useMemo, useState } from "react";
import type { DocPayload, InvoiceDoc, LineItem, Party, QuoteDoc } from "@/lib/pdf/types";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function asLines(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function partyFromText(name: string, subName: string, addr: string): Party {
  return {
    name: name.trim(),
    subName: subName.trim() || undefined,
    addressLines: asLines(addr),
  };
}

export default function DocsPage() {
  const [docType, setDocType] = useState<"invoice" | "quote">("invoice");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Shared defaults based on your PDFs.
  const [fromName, setFromName] = useState("VERIZONTECH ENTERPRISE");
  const [fromSub, setFromSub] = useState("(RA0077860-U)");
  const [fromAddr, setFromAddr] = useState("8, Jalan Bulan, Bukit Bintang, Kuala Lumpur,\nMalaysia - 55100");

  const [toName, setToName] = useState("Nimbus Cloud Sdn Bhd");
  const [toSub, setToSub] = useState("");
  const [toAddr, setToAddr] = useState("Unit 21-12, Q Sentral, Jalan Stesen Sentral 2,\nKuala Lumpur,\nKuala Lumpur, Malaysia - 50470");

  const [docNo, setDocNo] = useState("A00233");
  const [docDate, setDocDate] = useState("Sep 30, 2024");

  const [items, setItems] = useState<LineItem[]>([
    { description: "Vention CAT8 LAN Cable Braided Ethernet Cable 1M Black", quantity: 25, rate: 15 },
    { description: "Vention CAT8 LAN Cable Braided Ethernet Cable 1.5M Black", quantity: 50, rate: 17 },
    { description: "Vention CAT8 LAN Cable Braided Ethernet Cable 2M Black", quantity: 50, rate: 19 },
    { description: "Vention CAT8 LAN Cable Braided Ethernet Cable 3M Black", quantity: 50, rate: 22 },
    { description: "Vention CAT8 LAN Cable Braided Ethernet Cable 5M Black", quantity: 15, rate: 28 },
    { description: "Vention CAT8 LAN Cable Braided Ethernet Cable 8M Black", quantity: 15, rate: 36 },
  ]);

  const [reductions, setReductions] = useState(0);
  const [enquiryEmail, setEnquiryEmail] = useState("verizontech.enterprise@gmail.com");

  const [termsInvoice, setTermsInvoice] = useState("Please quote invoice number when remitting funds.");
  const [termsQuote, setTermsQuote] = useState(
    [
      "Price Quoted Is Valid For 7 Days Only. Thereafter, It Is Subject To Change Without Prior Notice.",
      "All prices are inclusive of SST.",
      "Once Your Accepted The Lead Time, Cancellation Are Not Accepted.",
    ].join("\n")
  );

  const [bankName, setBankName] = useState("Verizontech Enterprise");
  const [bankNumber, setBankNumber] = useState("141030013002818");
  const [bankBank, setBankBank] = useState("Alliance Bank Malaysia Berhad");

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0),
    [items]
  );

  async function onGenerate() {
    setBusy(true);
    setError(null);
    try {
      const billedBy = partyFromText(fromName, fromSub, fromAddr);
      const billedTo = partyFromText(toName, toSub, toAddr);

      const payload: DocPayload =
        docType === "invoice"
          ? ({
              type: "invoice",
              invoiceNo: docNo.trim(),
              invoiceDate: docDate.trim(),
              billedBy,
              billedTo,
              items,
              reductions: Number(reductions) || 0,
              termsAndConditions: asLines(termsInvoice),
              bankDetails: { accountName: bankName, accountNumber: bankNumber, bank: bankBank },
              enquiryEmail,
            } satisfies InvoiceDoc)
          : ({
              type: "quote",
              quotationNo: docNo.trim(),
              quotationDate: docDate.trim(),
              quotationFrom: billedBy,
              quotationFor: billedTo,
              items,
              reductions: Number(reductions) || 0,
              termsAndConditions: asLines(termsQuote),
              enquiryEmail,
            } satisfies QuoteDoc);

      const res = await fetch("/api/docs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Request failed (${res.status})`);
      }

      const blob = await res.blob();
      const filename = docType === "invoice" ? `invoice-${docNo}.pdf` : `quote-${docNo}.pdf`;
      downloadBlob(blob, filename);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  }

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Invoice + Quote Generator</h1>
            <p className="mt-1 text-sm text-slate-600">Generates PDFs matching the templates from 80901.pdf and 80902.pdf.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`h-9 rounded-full px-4 text-xs font-semibold ${
                docType === "invoice" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-800"
              }`}
              onClick={() => setDocType("invoice")}
              type="button"
            >
              Invoice
            </button>
            <button
              className={`h-9 rounded-full px-4 text-xs font-semibold ${
                docType === "quote" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-800"
              }`}
              onClick={() => setDocType("quote")}
              type="button"
            >
              Quotation
            </button>
            <button
              className="h-9 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white disabled:opacity-60"
              onClick={onGenerate}
              disabled={busy}
              type="button"
            >
              {busy ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Section title={docType === "invoice" ? "Billed By" : "Quotation From"}>
            <Input label="Name" value={fromName} onChange={setFromName} />
            <Input label="Subname" value={fromSub} onChange={setFromSub} placeholder="(Optional)" />
            <Textarea label="Address (one line per row)" value={fromAddr} onChange={setFromAddr} rows={5} />
          </Section>

          <Section title={docType === "invoice" ? "Billed To" : "Quotation For"}>
            <Input label="Name" value={toName} onChange={setToName} />
            <Input label="Subname" value={toSub} onChange={setToSub} placeholder="(Optional)" />
            <Textarea label="Address (one line per row)" value={toAddr} onChange={setToAddr} rows={5} />
          </Section>

          <Section title={docType === "invoice" ? "Invoice Details" : "Details"}>
            <Input label={docType === "invoice" ? "Invoice No" : "Quotation No"} value={docNo} onChange={setDocNo} />
            <Input label={docType === "invoice" ? "Invoice Date (display)" : "Quotation Date (display)"} value={docDate} onChange={setDocDate} />
            <Input label="Reductions" value={String(reductions)} onChange={(v) => setReductions(Number(v) || 0)} />
            <Input label="Enquiry Email" value={enquiryEmail} onChange={setEnquiryEmail} />
            <div className="mt-2 text-xs text-slate-600">
              Current total:{" "}
              <span className="font-mono">
                RM {total.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </Section>

          <Section title="Line Items">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-600">
              <div className="col-span-7">Item</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-1"></div>
            </div>
            <div className="mt-2 space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2">
                  <input
                    className="col-span-7 h-10 rounded-lg border border-slate-200 px-3 text-sm"
                    value={it.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                  />
                  <input
                    className="col-span-2 h-10 rounded-lg border border-slate-200 px-3 text-sm"
                    value={String(it.quantity)}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 0 })}
                  />
                  <input
                    className="col-span-2 h-10 rounded-lg border border-slate-200 px-3 text-sm"
                    value={String(it.rate)}
                    onChange={(e) => updateItem(idx, { rate: Number(e.target.value) || 0 })}
                  />
                  <button
                    className="col-span-1 h-10 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50"
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove row"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              className="mt-3 h-9 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              type="button"
              onClick={() => setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0 }])}
            >
              Add item
            </button>
          </Section>

          {docType === "invoice" ? (
            <Section title="Invoice Terms + Bank">
              <Textarea label="Terms and Conditions (one line per row)" value={termsInvoice} onChange={setTermsInvoice} rows={3} />
              <div className="mt-4 grid gap-3">
                <Input label="Account Name" value={bankName} onChange={setBankName} />
                <Input label="Account Number" value={bankNumber} onChange={setBankNumber} />
                <Input label="Bank" value={bankBank} onChange={setBankBank} />
              </div>
            </Section>
          ) : (
            <Section title="Quote Terms">
              <Textarea label="Terms and Conditions (one line per row)" value={termsQuote} onChange={setTermsQuote} rows={6} />
            </Section>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <h2 className="text-sm font-black tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <input
        className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-600">{label}</div>
      <textarea
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

