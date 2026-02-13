import { NextResponse } from "next/server";

type PublishPayload = {
  image_url?: string;
  caption?: string;
  brand?: string;
  target?: "post" | "story";
};

async function waitUntilContainerReady(graphBase: string, creationId: string, accessToken: string): Promise<void> {
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
      throw new Error(statusJson.error?.message ?? "Failed checking media container status.");
    }

    const statusCode = (statusJson.status_code ?? statusJson.status ?? "").toUpperCase();
    if (statusCode === "FINISHED" || statusCode === "PUBLISHED") return;
    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      throw new Error(`Media container is not publishable. Current status: ${statusCode}`);
    }

    await wait(2000);
  }
}

async function createAndPublishContainer(
  graphBase: string,
  igAccountId: string,
  accessToken: string,
  body: URLSearchParams
): Promise<{ creationId: string; publishedId: string }> {
  const createResp = await fetch(`${graphBase}/${igAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const createJson = (await createResp.json()) as { id?: string; error?: { message?: string } };
  if (!createResp.ok || !createJson.id) {
    throw new Error(createJson.error?.message ?? "Failed creating media container.");
  }

  const creationId = createJson.id;
  await waitUntilContainerReady(graphBase, creationId, accessToken);

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
    throw new Error(publishJson.error?.message ?? "Failed publishing media.");
  }

  return { creationId, publishedId: publishJson.id };
}

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
    const { image_url, caption, brand, target } = (await request.json()) as PublishPayload;
    const publishTarget = target === "story" ? "story" : "post";
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
    if (publishTarget === "post") {
      const feedResult = await createAndPublishContainer(
        graphBase,
        igAccountId,
        accessToken,
        new URLSearchParams({
          image_url: image_url.trim(),
          caption: caption.trim(),
          access_token: accessToken,
        })
      );

      return NextResponse.json({
        success: true,
        target: "post",
        media_id: feedResult.creationId,
        instagram_post_id: feedResult.publishedId,
        detail: "Post published successfully to Instagram.",
      });
    }

    const storyResult = await createAndPublishContainer(
      graphBase,
      igAccountId,
      accessToken,
      new URLSearchParams({
        image_url: image_url.trim(),
        media_type: "STORIES",
        access_token: accessToken,
      })
    );

    return NextResponse.json({
      success: true,
      target: "story",
      story_media_id: storyResult.creationId,
      instagram_story_id: storyResult.publishedId,
      detail: "Story published successfully to Instagram.",
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected error during publishing.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
