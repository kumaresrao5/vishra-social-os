import { NextResponse } from "next/server";
import { generateDocPdf } from "@/lib/pdf/generate";
import type { DocPayload } from "@/lib/pdf/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let payload: DocPayload;
  try {
    payload = (await req.json()) as DocPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || (payload.type !== "invoice" && payload.type !== "quote")) {
    return NextResponse.json({ error: "Invalid payload.type (expected 'invoice' or 'quote')" }, { status: 400 });
  }

  try {
    const pdfBytes = await generateDocPdf(payload);
    const filename =
      payload.type === "invoice" ? `invoice-${payload.invoiceNo}.pdf` : `quote-${payload.quotationNo}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "PDF generation failed" }, { status: 500 });
  }
}

