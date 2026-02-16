import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { formatMYR, sumItems } from "@/lib/pdf/money";
import { numberToWordsTitleCase } from "@/lib/pdf/number_to_words_en";
import { A4, COLORS } from "@/lib/pdf/layout";
import type { DocPayload, InvoiceDoc, LineItem, Party, QuoteDoc } from "@/lib/pdf/types";

type Fonts = {
  slab: any;
  mono: any;
  fallback: any;
};

function safeLines(lines: string[]): string[] {
  return lines.map((l) => l.trim()).filter(Boolean);
}

function normalizeParty(p: Party): Party {
  return { ...p, addressLines: safeLines(p.addressLines) };
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur: string[] = [];
  const widthOf = (s: string) => font.widthOfTextAtSize(s, fontSize);

  for (const w of words) {
    const next = [...cur, w].join(" ");
    if (cur.length === 0 || widthOf(next) <= maxWidth) {
      cur.push(w);
      continue;
    }
    lines.push(cur.join(" "));
    cur = [w];
  }
  if (cur.length) lines.push(cur.join(" "));
  return lines.length ? lines : [""];
}

function fmtDateDisplay(d: string): string {
  // Keep user-provided display string; this generator is template-driven.
  return d;
}

function ensureMoney(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return n;
}

function topRectToPdfRect(r: { x0: number; y0: number; x1: number; y1: number }, pad = 0): { x: number; y: number; w: number; h: number } {
  const x0 = r.x0 - pad;
  const y0 = r.y0 - pad;
  const x1 = r.x1 + pad;
  const y1 = r.y1 + pad;
  return { x: x0, y: A4.h - y1, w: x1 - x0, h: y1 - y0 };
}

function baselineYFromTopRect(r: { y0: number; y1: number }): number {
  // pdf-lib uses baseline-ish y; using a small proportion of the text box height is a decent approximation.
  const h = r.y1 - r.y0;
  const baselineFromBottom = h * 0.22;
  return A4.h - r.y1 + baselineFromBottom;
}

function whiteout(page: any, r: { x0: number; y0: number; x1: number; y1: number }, pad = 1) {
  const pr = topRectToPdfRect(r, pad);
  page.drawRectangle({ x: pr.x, y: pr.y, width: pr.w, height: pr.h, color: rgb(1, 1, 1) });
}

function fillRectColor(page: any, r: { x0: number; y0: number; x1: number; y1: number }, color: any, pad = 0) {
  const pr = topRectToPdfRect(r, pad);
  page.drawRectangle({ x: pr.x, y: pr.y, width: pr.w, height: pr.h, color });
}

async function loadTemplateBytes(kind: "invoice" | "quote"): Promise<Uint8Array> {
  const cwd = process.cwd();
  const p =
    kind === "invoice"
      ? path.join(cwd, "assets", "pdf-templates", "invoice-template.pdf")
      : path.join(cwd, "assets", "pdf-templates", "quote-template.pdf");
  return fs.readFile(p);
}

async function loadAssets(doc: PDFDocument): Promise<{ fonts: Fonts; logoPng: any }> {
  doc.registerFontkit(fontkit);

  const cwd = process.cwd();
  // Prefer full fonts (best compatibility across renderers). Fall back to subset fonts
  // extracted from the reference PDFs if needed.
  const slabPathPrimary = path.join(cwd, "public", "fonts", "RobotoSlab-wght.ttf");
  const slabPathFallback = path.join(cwd, "public", "fonts", "RobotoSlab-Regular-Subset.ttf");

  const monoPathPrimary = path.join(cwd, "public", "fonts", "LiberationMono-Regular.ttf");
  const monoPathFallback = path.join(cwd, "public", "fonts", "LiberationMono-Subset.ttf");
  const logoPath = path.join(cwd, "public", "branding", "verizontech.png");

  const readFirst = async (primary: string, fallback: string) => {
    try {
      return await fs.readFile(primary);
    } catch {
      return await fs.readFile(fallback);
    }
  };

  const [slabBytes, monoBytes, logoBytes] = await Promise.all([
    readFirst(slabPathPrimary, slabPathFallback),
    readFirst(monoPathPrimary, monoPathFallback),
    fs.readFile(logoPath),
  ]);

  // Subset full fonts for size; avoid subsetting already-subset fonts.
  const slab = await doc.embedFont(slabBytes, { subset: slabBytes.length > 50_000 });
  const mono = await doc.embedFont(monoBytes, { subset: monoBytes.length > 50_000 });
  const fallback = await doc.embedFont(StandardFonts.Helvetica);
  const logoPng = await doc.embedPng(logoBytes);
  return { fonts: { slab, mono, fallback }, logoPng };
}

function drawFooter(args: { page: any; fonts: Fonts; docNo: string; docDate: string; toName: string; pageNo: number; pageCount: number; docLabel: string }) {
  const { page, fonts, docNo, docDate, toName, pageNo, pageCount, docLabel } = args;
  const y = 26;
  const x0 = 28;
  const x1 = A4.w - 28;

  // Divider line
  page.drawLine({ start: { x: x0, y: y + 18 }, end: { x: x1, y: y + 18 }, thickness: 1, color: rgb(0.75, 0.8, 0.9) });

  const font = fonts.mono;
  const fs = 6;
  page.drawText(`${docLabel} No`, { x: x0, y: y + 8, size: fs, font, color: COLORS.muted });
  page.drawText(docNo, { x: x0, y: y, size: fs, font, color: COLORS.text });

  page.drawText(`${docLabel} Date`, { x: x0 + 70, y: y + 8, size: fs, font, color: COLORS.muted });
  page.drawText(docDate, { x: x0 + 70, y: y, size: fs, font, color: COLORS.text });

  page.drawText(`${docLabel === "Invoice" ? "Billed To" : "Quotation For"}`, { x: x0 + 150, y: y + 8, size: fs, font, color: COLORS.muted });
  page.drawText(toName, { x: x0 + 150, y: y, size: fs, font, color: COLORS.text });

  page.drawText(`Page ${pageNo} of ${pageCount}`, { x: x1 - 55, y: y, size: fs, font, color: COLORS.text });

  const msg = "This is an electronically generated document, no signature is required.";
  const msgW = font.widthOfTextAtSize(msg, fs);
  page.drawText(msg, { x: (A4.w - msgW) / 2, y: 10, size: fs, font, color: COLORS.muted });
}

function drawLogoAndTitle(args: { page: any; fonts: Fonts; logoPng: any; title: "Invoice" | "Quotation" }) {
  const { page, fonts, logoPng, title } = args;
  // Logo (top-left)
  const logoW = 42;
  const scale = logoW / logoPng.width;
  const logoH = logoPng.height * scale;
  page.drawImage(logoPng, { x: 34, y: A4.h - 64, width: logoW, height: logoH });

  // Title (top-right)
  const size = 28;
  const font = fonts.slab;
  const w = font.widthOfTextAtSize(title, size);
  page.drawText(title, { x: A4.w - 34 - w, y: A4.h - 86, size, font, color: COLORS.text });
}

function drawPartyBlock(args: { page: any; fonts: Fonts; label: string; party: Party; x: number; top: number; width: number }) {
  const { page, fonts, label, party, x, top, width } = args;
  const y0 = A4.h - top;
  const slab = fonts.slab;
  const mono = fonts.mono;

  page.drawText(label, { x, y: y0, size: 7.5, font: slab, color: COLORS.muted });
  page.drawText(party.name, { x, y: y0 - 18, size: 9, font: slab, color: COLORS.text });
  if (party.subName) {
    page.drawText(party.subName, { x, y: y0 - 30, size: 7.5, font: slab, color: COLORS.text });
  }

  let yy = y0 - 46;
  for (const line of safeLines(party.addressLines)) {
    const lines = wrapText(line, width, mono, 7.25);
    for (const l of lines) {
      page.drawText(l, { x, y: yy, size: 7.25, font: mono, color: COLORS.text });
      yy -= 11;
    }
  }
}

function drawDetailsBlock(args: {
  page: any;
  fonts: Fonts;
  heading: string;
  x: number;
  top: number;
  label1: string;
  value1: string;
  label2: string;
  value2: string;
}) {
  const { page, fonts, heading, x, top, label1, value1, label2, value2 } = args;
  const y0 = A4.h - top;
  const slab = fonts.slab;
  const mono = fonts.mono;

  page.drawText(heading, { x, y: y0, size: 7.5, font: slab, color: COLORS.muted });
  page.drawText(label1, { x, y: y0 - 26, size: 7.25, font: slab, color: COLORS.muted });
  page.drawText(value1, { x: x + 120, y: y0 - 26, size: 7.25, font: mono, color: COLORS.text });

  page.drawText(label2, { x, y: y0 - 42, size: 7.25, font: slab, color: COLORS.muted });
  page.drawText(value2, { x: x + 120, y: y0 - 42, size: 7.25, font: mono, color: COLORS.text });
}

function drawTable(args: { page: any; fonts: Fonts; items: LineItem[]; x: number; top: number; width: number; includeTotalRow: boolean }) {
  const { page, fonts, items, x, top, width, includeTotalRow } = args;
  const slab = fonts.slab;
  const mono = fonts.mono;

  const headerH = 20;
  const rowPadY = 6;

  const colItem = x + 32;
  const colQty = x + width * 0.62;
  const colRate = x + width * 0.77;
  const colAmt = x + width * 0.90;

  let yTop = A4.h - top;

  // header background
  page.drawRectangle({ x, y: yTop - headerH, width, height: headerH, color: COLORS.headerBg, borderColor: COLORS.line, borderWidth: 1 });
  page.drawText("Item", { x: colItem, y: yTop - 14, size: 7.5, font: slab, color: COLORS.muted });
  page.drawText("Quantity", { x: colQty, y: yTop - 14, size: 7.5, font: slab, color: COLORS.muted });
  page.drawText("Rate", { x: colRate, y: yTop - 14, size: 7.5, font: slab, color: COLORS.muted });
  page.drawText("Amount", { x: colAmt, y: yTop - 14, size: 7.5, font: slab, color: COLORS.muted });

  let y = yTop - headerH;
  const lineH = 11.5;

  for (let idx = 0; idx < items.length; idx++) {
    const it = items[idx]!;
    const descLines = wrapText(it.description, (colQty - colItem) - 28, slab, 7.5);
    const rowH = Math.max(22, rowPadY * 2 + descLines.length * lineH);

    // row border
    page.drawRectangle({ x, y: y - rowH, width, height: rowH, borderColor: COLORS.line, borderWidth: 1, color: COLORS.white });

    // index
    page.drawText(`${idx + 1}.`, { x: x + 10, y: y - 16, size: 7.25, font: mono, color: COLORS.muted });

    // description
    let yy = y - 16;
    for (const l of descLines) {
      page.drawText(l, { x: colItem, y: yy, size: 7.5, font: slab, color: COLORS.text });
      yy -= lineH;
    }

    // qty/rate/amount (top-aligned)
    page.drawText(String(it.quantity), { x: colQty + 4, y: y - 16, size: 7.25, font: mono, color: COLORS.text });
    page.drawText(formatMYR(it.rate), { x: colRate + 4, y: y - 16, size: 7.25, font: mono, color: COLORS.text });
    page.drawText(formatMYR(it.quantity * it.rate), { x: colAmt + 4, y: y - 16, size: 7.25, font: mono, color: COLORS.text });

    y -= rowH;
  }

  if (includeTotalRow) {
    const totalQty = items.reduce((a, it) => a + it.quantity, 0);
    const totalAmt = sumItems(items);
    const rowH = 22;
    page.drawRectangle({ x, y: y - rowH, width, height: rowH, borderColor: COLORS.line, borderWidth: 1, color: COLORS.white });
    page.drawText("Total", { x: colItem, y: y - 16, size: 7.75, font: slab, color: COLORS.text });
    page.drawText(String(totalQty), { x: colQty + 4, y: y - 16, size: 7.25, font: mono, color: COLORS.text });
    page.drawText(formatMYR(totalAmt), { x: colAmt + 4, y: y - 16, size: 7.25, font: mono, color: COLORS.text });
    y -= rowH;
  }

  return { bottomY: y };
}

function drawEnquiryBox(args: { page: any; fonts: Fonts; enquiryEmail: string; top: number }) {
  const { page, fonts, enquiryEmail, top } = args;
  const yTop = A4.h - top;
  const x = 28;
  const width = A4.w - 56;
  const h = 26;
  page.drawRectangle({ x, y: yTop - h, width, height: h, borderColor: COLORS.line, borderWidth: 1, color: COLORS.white });
  const text = `For any enquiry, reach out via email at ${enquiryEmail}`;
  const fs = 7.25;
  const font = fonts.slab;
  const w = font.widthOfTextAtSize(text, fs);
  page.drawText(text, { x: x + (width - w) / 2, y: yTop - 17, size: fs, font, color: COLORS.text });
}

function drawTotalsBox(args: { page: any; fonts: Fonts; total: number; reductions: number; top: number }) {
  const { page, fonts, total, reductions, top } = args;
  const slab = fonts.slab;
  const mono = fonts.mono;
  const yTop = A4.h - top;
  const x = 330;

  // Reductions row
  page.drawText("Reductions", { x, y: yTop - 10, size: 7.25, font: slab, color: COLORS.muted });
  page.drawText(formatMYR(reductions), { x: x + 200, y: yTop - 10, size: 7.25, font: mono, color: COLORS.text });

  // Total blue box
  const boxY = yTop - 38;
  const boxW = 220;
  const boxH = 28;
  page.drawRectangle({ x, y: boxY - boxH, width: boxW, height: boxH, color: COLORS.totalBlue });

  page.drawText("Total (MYR)", { x: x + 10, y: boxY - 18, size: 8, font: slab, color: COLORS.white });
  const totalStr = formatMYR(total);
  const tw = mono.widthOfTextAtSize(totalStr, 8);
  page.drawText(totalStr, { x: x + boxW - 10 - tw, y: boxY - 18, size: 8, font: mono, color: COLORS.white });
}

function drawInvoiceExtras(args: { page: any; fonts: Fonts; total: number; terms: string[]; bank: InvoiceDoc["bankDetails"] }) {
  const { page, fonts, total, terms, bank } = args;
  const slab = fonts.slab;
  const mono = fonts.mono;

  // Terms
  page.drawText("Terms and Conditions", { x: 28.5, y: A4.h - 471, size: 7.5, font: slab, color: COLORS.muted });
  let y = A4.h - 486;
  for (const t of safeLines(terms)) {
    const lines = wrapText(t, 250, slab, 7.25);
    for (const l of lines) {
      page.drawText(l, { x: 28.5, y, size: 7.25, font: slab, color: COLORS.text });
      y -= 11;
    }
  }

  // Total in words
  const words = `${numberToWordsTitleCase(total)} Ringgit`;
  page.drawText("Total (in words) :", { x: 329.4, y: A4.h - 553, size: 7.25, font: slab, color: COLORS.muted });
  const ww = wrapText(words, 230, slab, 7.25);
  let wy = A4.h - 567;
  for (const l of ww) {
    page.drawText(l, { x: 329.4, y: wy, size: 7.25, font: slab, color: COLORS.text });
    wy -= 11;
  }
  page.drawText("Only", { x: 329.4, y: wy, size: 7.25, font: slab, color: COLORS.text });

  // Bank details
  page.drawText("Bank Details", { x: 28.5, y: A4.h - 640, size: 7.5, font: slab, color: COLORS.muted });

  const labelX = 28.5;
  const valueX = 120;
  let by = A4.h - 656;
  const row = (label: string, value: string) => {
    page.drawText(label, { x: labelX, y: by, size: 7.25, font: slab, color: COLORS.muted });
    page.drawText(value, { x: valueX, y: by, size: 7.25, font: mono, color: COLORS.text });
    by -= 14;
  };
  row("Account Name", bank.accountName);
  row("Account Number", bank.accountNumber);
  row("Bank", bank.bank);
}

function drawQuoteTermsPage(args: { page: any; fonts: Fonts; total: number; reductions: number; terms: string[]; enquiryEmail: string }) {
  const { page, fonts, total, reductions, terms, enquiryEmail } = args;
  const slab = fonts.slab;

  // Terms and conditions (top-left area on page 2 in sample)
  page.drawText("Terms and Conditions", { x: 29.25, y: A4.h - 35.6, size: 7.5, font: slab, color: COLORS.muted });
  let y = A4.h - 52;
  for (const t of safeLines(terms)) {
    const lines = wrapText(t, 310, slab, 7.25);
    for (const l of lines) {
      page.drawText(l, { x: 29.25, y, size: 7.25, font: slab, color: COLORS.text });
      y -= 11;
    }
  }

  // Totals box (top-right in sample)
  drawTotalsBox({ page, fonts, total, reductions, top: 22 });

  // Enquiry bar (center-ish)
  drawEnquiryBox({ page, fonts, enquiryEmail, top: 200 });
}

export async function generateDocPdf(payload: DocPayload): Promise<Uint8Array> {
  if (payload.type === "invoice") return generateInvoice(payload);
  return generateQuote(payload);
}

async function generateInvoice(raw: InvoiceDoc): Promise<Uint8Array> {
  const d: InvoiceDoc = {
    ...raw,
    billedBy: normalizeParty(raw.billedBy),
    billedTo: normalizeParty(raw.billedTo),
    items: raw.items ?? [],
    reductions: ensureMoney(raw.reductions),
    termsAndConditions: raw.termsAndConditions ?? [],
  };

  if (d.items.length > 6) {
    throw new Error("Invoice template supports up to 6 line items.");
  }

  const tplBytes = await loadTemplateBytes("invoice");
  const tpl = await PDFDocument.load(tplBytes);

  const out = await PDFDocument.create();
  const [p1, p2] = await out.copyPages(tpl, [0, 1]);
  out.addPage(p1);
  out.addPage(p2);

  const { fonts } = await loadAssets(out);
  const slab = fonts.slab;
  const mono = fonts.mono;

  const total = sumItems(d.items);

  // Body blocks: whiteout then redraw (keeps template shapes/spacing aligned).
  // Billed By
  whiteout(p1, { x0: 28.5, y0: 156, x1: 190, y1: 238 }, 1.5);
  // Billed To
  whiteout(p1, { x0: 209.9, y0: 156, x1: 390, y1: 238 }, 1.5);

  // Details values
  const invNoRect = { x0: 481.2, y0: 158.1, x1: 552, y1: 169.6 };
  const invDateRect = { x0: 481.2, y0: 179.8, x1: 552, y1: 191.4 };
  whiteout(p1, invNoRect, 1.2);
  whiteout(p1, invDateRect, 1.2);

  // Table rows
  const rowYs = [298.3, 321.6, 344.8, 367.3, 390.6, 413.8];
  for (let i = 0; i < 6; i++) {
    const y0 = rowYs[i]!;
    const y1 = y0 + 11.6;
    // index, desc, qty, rate, amount
    whiteout(p1, { x0: 34.5, y0, x1: 52, y1 }, 0.6);
    whiteout(p1, { x0: 68, y0, x1: 338, y1 }, 0.6);
    whiteout(p1, { x0: 350, y0, x1: 392, y1 }, 0.6);
    whiteout(p1, { x0: 410, y0, x1: 470, y1 }, 0.6);
    whiteout(p1, { x0: 495, y0, x1: 555, y1 }, 0.6);
  }

  // Terms line
  whiteout(p1, { x0: 28.5, y0: 480.5, x1: 300, y1: 495.5 }, 1.2);

  // Reductions + Total value
  whiteout(p1, { x0: 500, y0: 461, x1: 548.5, y1: 479 }, 1.2);
  // Keep the total amount cell blue while replacing the old amount text.
  fillRectColor(p1, { x0: 470, y0: 490.5, x1: 548.5, y1: 509 }, COLORS.totalBlue, 0.6);

  // Total in words
  whiteout(p1, { x0: 329.4, y0: 558.5, x1: 560, y1: 588 }, 1.2);

  // Bank detail values
  whiteout(p1, { x0: 110.5, y0: 645.5, x1: 560, y1: 706 }, 1.2);

  // Footer values (p1 + p2)
  const footerDocNo = { x0: 22.5, y0: 807.0, x1: 60, y1: 818.5 };
  const footerDate = { x0: 89.0, y0: 807.0, x1: 150, y1: 818.5 };
  const footerTo = { x0: 168.9, y0: 807.0, x1: 300, y1: 818.5 };
  whiteout(p1, footerDocNo, 0.6);
  whiteout(p1, footerDate, 0.6);
  whiteout(p1, footerTo, 0.6);
  whiteout(p2, footerDocNo, 0.6);
  whiteout(p2, footerDate, 0.6);
  whiteout(p2, footerTo, 0.6);

  // Enquiry email p2 (clear text only, preserve box border)
  whiteout(p2, { x0: 145.6, y0: 31.3, x1: 449.9, y1: 42.9 }, 0.8);

  // Draw new content
  const partyFontSizeName = 9;
  const partyFontSizeSub = 7.5;
  const partyFontSizeAddr = 7.25;

  const billedByX = 28.5;
  let by = baselineYFromTopRect({ y0: 158.9, y1: 173.2 });
  p1.drawText(d.billedBy.name, { x: billedByX, y: by, size: partyFontSizeName, font: slab, color: COLORS.text });
  if (d.billedBy.subName) {
    const subY = baselineYFromTopRect({ y0: 173.2, y1: 187.4 });
    p1.drawText(d.billedBy.subName, { x: billedByX, y: subY, size: partyFontSizeSub, font: slab, color: COLORS.text });
  }
  let addrY = baselineYFromTopRect({ y0: 194.1, y1: 205.6 });
  for (const line of safeLines(d.billedBy.addressLines)) {
    const lines = wrapText(line, 165, mono, partyFontSizeAddr);
    for (const l of lines) {
      p1.drawText(l, { x: billedByX, y: addrY, size: partyFontSizeAddr, font: slab, color: COLORS.text });
      addrY -= 11;
    }
  }

  const billedToX = 209.9;
  const toNameY = baselineYFromTopRect({ y0: 158.9, y1: 173.2 });
  p1.drawText(d.billedTo.name, { x: billedToX, y: toNameY, size: partyFontSizeName, font: slab, color: COLORS.text });
  if (d.billedTo.subName) {
    const subY = baselineYFromTopRect({ y0: 173.2, y1: 187.4 });
    p1.drawText(d.billedTo.subName, { x: billedToX, y: subY, size: partyFontSizeSub, font: slab, color: COLORS.text });
  }
  let toAddrY = baselineYFromTopRect({ y0: 181.3, y1: 192.9 });
  for (const line of safeLines(d.billedTo.addressLines)) {
    const lines = wrapText(line, 180, mono, partyFontSizeAddr);
    for (const l of lines) {
      p1.drawText(l, { x: billedToX, y: toAddrY, size: partyFontSizeAddr, font: slab, color: COLORS.text });
      toAddrY -= 11;
    }
  }

  // Details values (mono)
  p1.drawText(d.invoiceNo, { x: 481.2, y: baselineYFromTopRect({ y0: 158.1, y1: 169.6 }), size: 7.25, font: slab, color: COLORS.text });
  p1.drawText(fmtDateDisplay(d.invoiceDate), { x: 481.2, y: baselineYFromTopRect({ y0: 179.8, y1: 191.4 }), size: 7.25, font: slab, color: COLORS.text });

  // Table values
  for (let i = 0; i < d.items.length; i++) {
    const it = d.items[i]!;
    const y0 = rowYs[i]!;
    const y1 = y0 + 11.6;
    const y = baselineYFromTopRect({ y0, y1 });
    p1.drawText(`${i + 1}.`, { x: 36.7, y, size: 7.25, font: mono, color: COLORS.muted });
    p1.drawText(it.description, { x: 69.0, y, size: 7.5, font: slab, color: COLORS.text });
    p1.drawText(String(it.quantity), { x: 352.4, y, size: 7.25, font: slab, color: COLORS.text });
    p1.drawText(formatMYR(it.rate), { x: 411.5, y, size: 7.25, font: slab, color: COLORS.text });
    p1.drawText(formatMYR(it.quantity * it.rate), { x: 496.5, y, size: 7.25, font: slab, color: COLORS.text });
  }

  // Terms
  const terms = safeLines(d.termsAndConditions).join(" ");
  p1.drawText(terms, { x: 28.5, y: baselineYFromTopRect({ y0: 482.1, y1: 493.6 }), size: 7.25, font: slab, color: COLORS.text });

  // Reductions + total
  p1.drawText(formatMYR(d.reductions), { x: 506.6, y: baselineYFromTopRect({ y0: 463.4, y1: 477.7 }), size: 7.25, font: slab, color: COLORS.text });
  p1.drawText(formatMYR(total), { x: 484.2, y: baselineYFromTopRect({ y0: 492.7, y1: 506.9 }), size: 8, font: slab, color: COLORS.white });

  // Total words
  const words = `${numberToWordsTitleCase(total)} Ringgit`;
  p1.drawText(words, { x: 329.4, y: baselineYFromTopRect({ y0: 560.8, y1: 572.4 }), size: 7.25, font: slab, color: COLORS.text });
  p1.drawText("Only", { x: 329.4, y: baselineYFromTopRect({ y0: 575.1, y1: 586.6 }), size: 7.25, font: slab, color: COLORS.text });

  // Bank details values
  p1.drawText(d.bankDetails.accountName, { x: 110.9, y: baselineYFromTopRect({ y0: 647.1, y1: 658.6 }), size: 7.25, font: slab, color: COLORS.text });
  p1.drawText(d.bankDetails.accountNumber, { x: 110.9, y: baselineYFromTopRect({ y0: 668.8, y1: 680.4 }), size: 7.25, font: slab, color: COLORS.text });
  p1.drawText(d.bankDetails.bank, { x: 110.9, y: baselineYFromTopRect({ y0: 690.6, y1: 702.1 }), size: 7.25, font: slab, color: COLORS.text });

  // Enquiry p2
  const enquiry = `For any enquiry, reach out via email at ${d.enquiryEmail}`;
  const enquiryFs = 7.25;
  const enquiryW = slab.widthOfTextAtSize(enquiry, enquiryFs);
  const enquiryBox = { x0: 80, y0: 22, x1: 520, y1: 55 };
  p2.drawText(enquiry, { x: enquiryBox.x0 + ((enquiryBox.x1 - enquiryBox.x0) - enquiryW) / 2, y: baselineYFromTopRect({ y0: 31.3, y1: 42.9 }), size: enquiryFs, font: slab, color: COLORS.text });

  // Footer values: match template footer format "30 Sep 2024"
  const footerDateStr = toTemplateFooterDate(d.invoiceDate);
  const footerY = baselineYFromTopRect({ y0: 807.5, y1: 816.0 });
  p1.drawText(d.invoiceNo, { x: 22.5, y: footerY, size: 6, font: mono, color: COLORS.text });
  p1.drawText(footerDateStr, { x: 89.0, y: footerY, size: 6, font: mono, color: COLORS.text });
  p1.drawText(d.billedTo.name, { x: 168.9, y: footerY, size: 6, font: mono, color: COLORS.text });

  p2.drawText(d.invoiceNo, { x: 22.5, y: footerY, size: 6, font: mono, color: COLORS.text });
  p2.drawText(footerDateStr, { x: 89.0, y: footerY, size: 6, font: mono, color: COLORS.text });
  p2.drawText(d.billedTo.name, { x: 168.9, y: footerY, size: 6, font: mono, color: COLORS.text });

  return out.save();
}

async function generateQuote(raw: QuoteDoc): Promise<Uint8Array> {
  const d: QuoteDoc = {
    ...raw,
    quotationFrom: normalizeParty(raw.quotationFrom),
    quotationFor: normalizeParty(raw.quotationFor),
    items: raw.items ?? [],
    reductions: ensureMoney(raw.reductions),
    termsAndConditions: raw.termsAndConditions ?? [],
  };

  const pdf = await PDFDocument.create();
  const { fonts, logoPng } = await loadAssets(pdf);

  const page1 = pdf.addPage([A4.w, A4.h]);
  const page2 = pdf.addPage([A4.w, A4.h]);

  drawLogoAndTitle({ page: page1, fonts, logoPng, title: "Quotation" });
  drawPartyBlock({ page: page1, fonts, label: "Quotation From", party: d.quotationFrom, x: 29.3, top: 154, width: 170 });
  drawPartyBlock({ page: page1, fonts, label: "Quotation For", party: d.quotationFor, x: 210, top: 154, width: 170 });

  // Details block (right)
  drawDetailsBlock({
    page: page1,
    fonts,
    heading: "Details",
    x: 394.4,
    top: 157.1,
    label1: "Quotation No #",
    value1: d.quotationNo,
    label2: "Quotation Date",
    value2: fmtDateDisplay(d.quotationDate),
  });

  const table = drawTable({ page: page1, fonts, items: d.items, x: 29.3, top: 270, width: A4.w - 58.6, includeTotalRow: true });

  // Page2 terms + totals + enquiry
  drawQuoteTermsPage({ page: page2, fonts, total: sumItems(d.items), reductions: d.reductions, terms: d.termsAndConditions, enquiryEmail: d.enquiryEmail });

  // Footer
  drawFooter({
    page: page1,
    fonts,
    docNo: d.quotationNo,
    docDate: fmtDateDisplay(d.quotationDate),
    toName: d.quotationFor.name,
    pageNo: 1,
    pageCount: 2,
    docLabel: "Quotation",
  });
  drawFooter({
    page: page2,
    fonts,
    docNo: d.quotationNo,
    docDate: fmtDateDisplay(d.quotationDate),
    toName: d.quotationFor.name,
    pageNo: 2,
    pageCount: 2,
    docLabel: "Quotation",
  });

  return pdf.save();
}

function toTemplateFooterDate(input: string): string {
  // Template footer uses "30 Sep 2024".
  const s = input.trim();
  // Handle "Sep 30, 2024" deterministically without timezone shifts.
  const m1 = s.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (m1) {
    const monRaw = m1[1]!.slice(0, 3);
    const day = String(Number(m1[2]));
    const year = m1[3]!;
    const monthMap: Record<string, string> = {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    };
    const mm = monthMap[monRaw.toLowerCase()];
    if (mm) return `${day} ${mm} ${year}`;
  }
  // Already in "30 Sep 2024".
  const m2 = s.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (m2) {
    const day = String(Number(m2[1]));
    const monRaw = m2[2]!.slice(0, 3).toLowerCase();
    const year = m2[3]!;
    const monthMap: Record<string, string> = {
      jan: "Jan",
      feb: "Feb",
      mar: "Mar",
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
      oct: "Oct",
      nov: "Nov",
      dec: "Dec",
    };
    const mm = monthMap[monRaw];
    if (mm) return `${day} ${mm} ${year}`;
  }
  return s.replaceAll(",", "");
}
