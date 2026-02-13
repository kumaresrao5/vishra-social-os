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

    const creationId = createJson.id;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const statusResp = await fetch(
        `${graphBase}/${creationId}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`
      );
      const statusJson = (await statusResp.json()) as {
        status_code?: string;
        status?: string;
        error?: { message?: string };
      };

      if (!statusResp.ok) {
        const msg = statusJson.error?.message ?? "Failed checking media container status.";
        return NextResponse.json({ detail: msg }, { status: 502 });
      }

      const statusCode = (statusJson.status_code ?? statusJson.status ?? "").toUpperCase();
      if (statusCode === "FINISHED" || statusCode === "PUBLISHED") {
        break;
      }
      if (statusCode === "ERROR" || statusCode === "EXPIRED") {
        return NextResponse.json(
          { detail: `Media container is not publishable. Current status: ${statusCode}` },
          { status: 502 }
        );
      }

      await wait(2000);
    }

    const publishResp = await fetch(`${graphBase}/${igAccountId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: creationId,
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
      media_id: creationId,
      instagram_post_id: publishJson.id,
      detail: "Post published successfully to Instagram.",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected error during publishing.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
