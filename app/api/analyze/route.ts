import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

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

function parseModelJson(rawText: string): Record<string, unknown> {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model response did not contain valid JSON.");
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ detail: "GROQ_API_KEY is not configured." }, { status: 500 });
    }

    const form = await request.formData();
    const imageUrlFromForm = String(form.get("image_url") ?? "").trim();
    const file = form.get("file");
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    // Batch mode: analyze each file (used for multi-upload per outlet).
    if (files.length > 0) {
      const results = await Promise.all(
        files.map(async (f) => {
          if (!["image/jpeg", "image/png"].includes(f.type)) {
            throw new Error("Only JPG and PNG files are supported.");
          }
          const uploadedUrl = await uploadToCloudinary(f);
          const analyzed = await analyzeOne(uploadedUrl, groqApiKey);
          return { ...analyzed, image_url: uploadedUrl, filename: f.name };
        })
      );
      return NextResponse.json({ results });
    }

    // Single mode: accept either image_url (preferred when already uploaded) OR file.
    let imageUrl = imageUrlFromForm;
    let filename = "image";

    if (!imageUrl) {
      if (!(file instanceof File)) {
        return NextResponse.json({ detail: "File or image_url is required." }, { status: 400 });
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        return NextResponse.json({ detail: "Only JPG and PNG files are supported." }, { status: 400 });
      }
      filename = file.name;
      imageUrl = await uploadToCloudinary(file);
    }

    const analyzed = await analyzeOne(imageUrl, groqApiKey);
    const groqModel = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
    const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        temperature: 0.4,
        max_tokens: 800,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Return only strict JSON with keys: brand, caption, hashtags, is_urgent. " +
                  "hashtags must be an array of exactly 10 hashtag strings.",
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
      }),
    });
    const groqJson = (await groqResp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };
    if (!groqResp.ok) {
      const msg = groqJson.error?.message ?? "Groq API call failed.";
      return NextResponse.json({ detail: msg }, { status: 502 });
    }

    return NextResponse.json({
      ...analyzed,
      image_url: imageUrl,
      filename,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected error during analyze.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}

async function analyzeOne(imageUrl: string, groqApiKey: string) {
  const groqModel = process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
  const groqResp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Return only strict JSON with keys: brand, caption, hashtags, is_urgent. " +
                "hashtags must be an array of exactly 10 hashtag strings.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    }),
  });
  const groqJson = (await groqResp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };
  if (!groqResp.ok) {
    const msg = groqJson.error?.message ?? "Groq API call failed.";
    throw new Error(msg);
  }

  const responseText = groqJson.choices?.[0]?.message?.content ?? "";
  const parsed = parseModelJson(responseText);

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

  return {
    brand,
    caption,
    hashtags,
    is_urgent: Boolean(parsed.is_urgent),
  };
}
