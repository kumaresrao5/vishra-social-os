import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { canPublishBrand, SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getRecordById, updateRecord } from "@/lib/publish-records";
import { publishToInstagram } from "@/lib/instagram";

export async function POST(
  _request: Request,
  context: { params: { id: string } }
) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const id = context.params.id;
  if (!id) return NextResponse.json({ detail: "Record id is required." }, { status: 400 });

  const record = await getRecordById(id);
  if (!record) return NextResponse.json({ detail: "Record not found." }, { status: 404 });

  if (!canPublishBrand(session, record.brand)) {
    return NextResponse.json({ detail: `You are not allowed to publish for brand: ${record.brand}` }, { status: 403 });
  }

  try {
    const published = await publishToInstagram({
      imageUrl: record.image_url,
      imageUrls: record.image_urls,
      caption: record.caption,
      brand: record.brand,
      target: record.target,
    });

    const updated = await updateRecord(record.id, {
      status: "published",
      published_at: new Date().toISOString(),
      post_id: published.postId,
      story_id: published.storyId,
      error: undefined,
    });

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    const updated = await updateRecord(record.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Failed to publish",
    });
    return NextResponse.json(
      { detail: updated?.error ?? "Failed to publish queued record." },
      { status: 500 }
    );
  }
}
