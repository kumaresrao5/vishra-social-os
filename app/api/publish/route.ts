import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { canPublishBrand, SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { addRecord, updateRecord } from "@/lib/publish-records";
import { publishToInstagram, PublishTarget } from "@/lib/instagram";

type PublishPayload = {
  image_url?: string;
  caption?: string;
  brand?: string;
  target?: PublishTarget;
};

export async function POST(request: Request) {
  let recordId = "";
  try {
    const { image_url, caption, brand, target } = (await request.json()) as PublishPayload;
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const publishTarget: PublishTarget = target === "story" || target === "both" ? target : "post";

    if (!image_url?.trim()) {
      return NextResponse.json({ detail: "image_url is required." }, { status: 400 });
    }
    if (!caption?.trim()) {
      return NextResponse.json({ detail: "Caption cannot be empty." }, { status: 400 });
    }
    if (!brand?.trim()) {
      return NextResponse.json({ detail: "brand is required." }, { status: 400 });
    }
    if (!canPublishBrand(session, brand)) {
      return NextResponse.json(
        { detail: `You are not allowed to publish for brand: ${brand}` },
        { status: 403 }
      );
    }

    const record = await addRecord({
      brand: brand.trim(),
      caption: caption.trim(),
      image_url: image_url.trim(),
      target: publishTarget,
      status: "queued",
      created_by: session.username,
    });
    recordId = record.id;

    const published = await publishToInstagram({
      imageUrl: image_url.trim(),
      caption: caption.trim(),
      brand: brand.trim(),
      target: publishTarget,
    });

    await updateRecord(record.id, {
      status: "published",
      published_at: new Date().toISOString(),
      post_id: published.postId,
      story_id: published.storyId,
      error: undefined,
    });

    return NextResponse.json({
      success: true,
      record_id: record.id,
      target: publishTarget,
      instagram_post_id: published.postId,
      instagram_story_id: published.storyId,
      detail: "Published successfully to Instagram.",
    });
  } catch (error) {
    if (recordId) {
      await updateRecord(recordId, {
        status: "failed",
        error: error instanceof Error ? error.message : "Unexpected publish error.",
      });
    }
    const detail = error instanceof Error ? error.message : "Unexpected error during publishing.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
