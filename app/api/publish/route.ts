import { NextResponse } from "next/server";

type PublishPayload = {
  image_url?: string;
  caption?: string;
  brand?: string;
};

function pickInstagramAccountId(brand: string | undefined): string | undefined {
  const normalized = (brand ?? "").toLowerCase();
  if (normalized.includes("dravidian")) return process.env.DRAVIDIAN_IG_ID;
  if (normalized.includes("fire") || normalized.includes("ice")) return process.env.FIREANDICE_IG_ID;
  if (normalized.includes("barley") || normalized.includes("hops")) return process.env.BARLEYHOPS_IG_ID;
  if (normalized.includes("score")) return process.env.SCOREBAR_IG_ID;
  if (normalized.includes("southern") || normalized.includes("spice")) return process.env.SOUTHERNSPICE_IG_ID;
  return process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
}

export async function POST(request: Request) {
  try {
    const { image_url, caption, brand } = (await request.json()) as PublishPayload;
    const accessToken = process.env.META_ACCESS_TOKEN;
    const igAccountId = pickInstagramAccountId(brand);

    if (!accessToken || !igAccountId) {
      return NextResponse.json(
        {
          detail:
            "Meta API credentials are missing. Set META_ACCESS_TOKEN and brand IG IDs " +
            "(DRAVIDIAN_IG_ID/FIREANDICE_IG_ID/BARLEYHOPS_IG_ID) or INSTAGRAM_BUSINESS_ACCOUNT_ID.",
        },
        { status: 500 }
      );
    }
    if (!image_url?.trim()) {
      return NextResponse.json({ detail: "image_url is required." }, { status: 400 });
    }
    if (!caption?.trim()) {
      return NextResponse.json({ detail: "Caption cannot be empty." }, { status: 400 });
    }

    const graphBase = "https://graph.facebook.com/v21.0";
    const createResp = await fetch(`${graphBase}/${igAccountId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        image_url: image_url.trim(),
        caption: caption.trim(),
        access_token: accessToken,
      }),
    });
    const createJson = (await createResp.json()) as { id?: string; error?: { message?: string } };
    if (!createResp.ok || !createJson.id) {
      const msg = createJson.error?.message ?? "Failed creating media container.";
      return NextResponse.json({ detail: msg }, { status: 502 });
    }

    const publishResp = await fetch(`${graphBase}/${igAccountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: createJson.id,
        access_token: accessToken,
      }),
    });
    const publishJson = (await publishResp.json()) as { id?: string; error?: { message?: string } };
    if (!publishResp.ok || !publishJson.id) {
      const msg = publishJson.error?.message ?? "Failed publishing media.";
      return NextResponse.json({ detail: msg }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      media_id: createJson.id,
      instagram_post_id: publishJson.id,
      detail: "Post published successfully to Instagram.",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected error during publishing.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
