import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the AI Social Media Manager for Vishra Holdings. You manage 3 brands:
1. Dravidian (Nightlife, Indian, Upscale)
2. Fire & Ice (Sports Bar, Loud, Energetic)
3. Barley & Hops (Pub, Casual, Sports)

Task: Analyze the uploaded event poster.
Output a JSON object with:
- brand: Which venue is this for?
- caption: A highly engaging Instagram caption with emojis matching the venue's vibe.
- hashtags: 10 relevant tags (include #BukitBintang).
- is_urgent: Boolean (True if event is today/tomorrow).`;

function parseClaudeJson(rawText: string): Record<string, unknown> {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Claude response did not contain valid JSON.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const uploadResp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const uploadJson = (await uploadResp.json()) as { secure_url?: string; error?: { message?: string } };

  if (!uploadResp.ok || !uploadJson.secure_url) {
    const msg = uploadJson.error?.message ?? "Cloudinary upload failed.";
    throw new Error(msg);
  }
  return uploadJson.secure_url;
}

export async function POST(request: Request) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json({ detail: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "File is required." }, { status: 400 });
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      return NextResponse.json({ detail: "Only JPG and PNG files are supported." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: file.type as "image/jpeg" | "image/png", data: base64Data },
            },
            {
              type: "text",
              text:
                "Return only strict JSON with keys: brand, caption, hashtags, is_urgent. " +
                "hashtags must be an array of exactly 10 hashtag strings.",
            },
          ],
        },
      ],
    });

    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const parsed = parseClaudeJson(responseText);

    const brand = String(parsed.brand ?? "").trim() || "Unknown";
    const caption = String(parsed.caption ?? "").trim();
    const rawHashtags = parsed.hashtags;
    let hashtags: string[] = [];
    if (Array.isArray(rawHashtags)) {
      hashtags = rawHashtags.map((h) => String(h).trim()).filter(Boolean);
    } else if (typeof rawHashtags === "string") {
      hashtags = rawHashtags.split(/\s+/).filter((h) => h.startsWith("#"));
    }

    const defaults = [
      "#BukitBintang",
      "#KualaLumpur",
      "#Nightlife",
      "#FoodAndDrinks",
      "#EventNight",
      "#KLFoodie",
      "#WeekendVibes",
      "#LiveMusic",
      "#PartyTime",
      "#SocialScene",
    ];
    for (const tag of defaults) {
      if (hashtags.length >= 10) break;
      if (!hashtags.includes(tag)) hashtags.push(tag);
    }
    hashtags = hashtags.slice(0, 10);

    const imageUrl = await uploadToCloudinary(file);

    return NextResponse.json({
      brand,
      caption,
      hashtags,
      is_urgent: Boolean(parsed.is_urgent),
      image_url: imageUrl,
      filename: file.name,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected error during analyze.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}
