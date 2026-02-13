import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

    const form = await request.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    const file = form.get("file");

    const normalized: File[] = files.length > 0 ? files : file instanceof File ? [file] : [];
    if (normalized.length === 0) {
      return NextResponse.json({ detail: "At least one file is required." }, { status: 400 });
    }

    for (const f of normalized) {
      if (!["image/jpeg", "image/png"].includes(f.type)) {
        return NextResponse.json({ detail: "Only JPG and PNG files are supported." }, { status: 400 });
      }
    }

    const results = await Promise.all(
      normalized.map(async (f) => ({
        filename: f.name,
        image_url: await uploadToCloudinary(f),
      }))
    );

    // Compatibility: if they sent a single file, include top-level fields too.
    if (results.length === 1) {
      return NextResponse.json({ ...results[0], results });
    }
    return NextResponse.json({ results });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unexpected error during upload.";
    return NextResponse.json({ detail }, { status: 500 });
  }
}

