import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { canPublishBrand, SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { addRecord, getAllRecords } from "@/lib/publish-records";
import type { RecordTarget } from "@/lib/publish-records";

type CreateRecordPayload = {
  image_url?: string;
  image_urls?: string[];
  caption?: string;
  brand?: string;
  target?: RecordTarget;
  scheduled_for?: string;
};

export async function GET(request: Request) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") ?? "all";

  const all = await getAllRecords();
  const allowed = all.filter((record) => canPublishBrand(session, record.brand));
  const filtered =
    mode === "queue"
      ? allowed.filter((record) => record.status === "queued")
      : mode === "history"
        ? allowed.filter((record) => record.status !== "queued")
        : allowed;

  return NextResponse.json({ records: filtered });
}

export async function POST(request: Request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

    const payload = (await request.json()) as CreateRecordPayload;
    const urls = Array.isArray(payload.image_urls) ? payload.image_urls.map((u) => String(u).trim()).filter(Boolean) : [];
    const imageUrl = payload.image_url?.trim() || urls[0] || "";
    const caption = payload.caption?.trim();
    const brand = payload.brand?.trim();
    const target: RecordTarget = payload.target === "story" || payload.target === "both" ? payload.target : "post";

    if (!imageUrl || !caption || !brand) {
      return NextResponse.json({ detail: "image_url (or image_urls), caption and brand are required." }, { status: 400 });
    }
    if (!canPublishBrand(session, brand)) {
      return NextResponse.json({ detail: `You are not allowed to queue brand: ${brand}` }, { status: 403 });
    }

    const record = await addRecord({
      brand,
      caption,
      image_url: imageUrl,
      image_urls: urls.length > 0 ? urls : undefined,
      target,
      status: "queued",
      scheduled_for: payload.scheduled_for?.trim() || undefined,
      created_by: session.username,
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Failed to add queue item.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
