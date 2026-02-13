import base64
import json
import os
import uuid
from pathlib import Path
from typing import Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "")
INSTAGRAM_BUSINESS_ACCOUNT_ID = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID", "")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")
CORS_ORIGINS_ENV = os.getenv("CORS_ORIGINS", "http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_ENV.split(",") if origin.strip()]

SYSTEM_PROMPT = """
You are the AI Social Media Manager for Vishra Holdings. You manage 3 brands:
1. Dravidian (Nightlife, Indian, Upscale)
2. Fire & Ice (Sports Bar, Loud, Energetic)
3. Barley & Hops (Pub, Casual, Sports)

Task: Analyze the uploaded event poster.
Output a JSON object with:
- brand: Which venue is this for?
- caption: A highly engaging Instagram caption with emojis matching the venue's vibe.
- hashtags: 10 relevant tags (include #BukitBintang).
- is_urgent: Boolean (True if event is today/tomorrow).
""".strip()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Vishra Social OS API", version="1.0.0")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisResult(BaseModel):
    brand: str
    caption: str
    hashtags: list[str] = Field(min_length=1)
    is_urgent: bool
    image_url: str
    filename: str


class PublishRequest(BaseModel):
    image_url: str
    caption: str


class PublishResponse(BaseModel):
    success: bool
    media_id: str
    instagram_post_id: str
    detail: str


def _extract_json_object(raw_text: str) -> dict:
    raw_text = raw_text.strip()
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise HTTPException(status_code=500, detail="Model response did not contain valid JSON.")
        try:
            return json.loads(raw_text[start : end + 1])
        except json.JSONDecodeError as exc:
            raise HTTPException(status_code=500, detail=f"Failed to parse model JSON output: {exc}") from exc


def _build_image_url(request: Request, filename: str) -> str:
    relative_path = f"/uploads/{filename}"
    if PUBLIC_BASE_URL:
        return f"{PUBLIC_BASE_URL}{relative_path}"
    return str(request.base_url).rstrip("/") + relative_path


async def post_to_instagram(image_url: str, caption: str) -> tuple[str, str]:
    if not META_ACCESS_TOKEN or not INSTAGRAM_BUSINESS_ACCOUNT_ID:
        raise HTTPException(
            status_code=500,
            detail="Meta API credentials are missing. Set META_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID.",
        )

    graph_base = "https://graph.facebook.com/v21.0"
    create_media_url = f"{graph_base}/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media"
    publish_media_url = f"{graph_base}/{INSTAGRAM_BUSINESS_ACCOUNT_ID}/media_publish"

    async with httpx.AsyncClient(timeout=45.0) as client:
        create_payload = {"image_url": image_url, "caption": caption, "access_token": META_ACCESS_TOKEN}
        create_resp = await client.post(create_media_url, data=create_payload)
        create_json = create_resp.json()
        if create_resp.status_code >= 400:
            message = create_json.get("error", {}).get("message", "Unknown Meta API error.")
            raise HTTPException(status_code=502, detail=f"Failed creating media container: {message}")

        creation_id: Optional[str] = create_json.get("id")
        if not creation_id:
            raise HTTPException(status_code=502, detail="Meta API did not return media container id.")

        publish_payload = {"creation_id": creation_id, "access_token": META_ACCESS_TOKEN}
        publish_resp = await client.post(publish_media_url, data=publish_payload)
        publish_json = publish_resp.json()
        if publish_resp.status_code >= 400:
            message = publish_json.get("error", {}).get("message", "Unknown Meta API error.")
            raise HTTPException(status_code=502, detail=f"Failed publishing media: {message}")

        instagram_post_id: Optional[str] = publish_json.get("id")
        if not instagram_post_id:
            raise HTTPException(status_code=502, detail="Meta API did not return published post id.")

    return creation_id, instagram_post_id


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_poster(request: Request, file: UploadFile = File(...)) -> AnalysisResult:
    allowed_types = {"image/jpeg", "image/png"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG and PNG files are supported.")

    ext = ".jpg" if file.content_type == "image/jpeg" else ".png"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / filename
    file_bytes = await file.read()
    file_path.write_bytes(file_bytes)

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")
    b64_image = base64.b64encode(file_bytes).decode("utf-8")

    try:
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                "Return only a strict JSON object with keys: brand, caption, hashtags, is_urgent. "
                                "hashtags must be an array of exactly 10 hashtag strings."
                            )
                        },
                        {"inline_data": {"mime_type": file.content_type, "data": b64_image}},
                    ]
                }
            ],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 800},
        }
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        )
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            resp_json = resp.json()
            if resp.status_code >= 400:
                message = resp_json.get("error", {}).get("message", "Gemini API error.")
                raise HTTPException(status_code=502, detail=f"Gemini API call failed: {message}")
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(status_code=502, detail=f"Gemini API call failed: {exc}") from exc

    candidates = resp_json.get("candidates", [])
    response_text = "".join(
        part.get("text", "")
        for candidate in candidates
        for part in candidate.get("content", {}).get("parts", [])
        if isinstance(part, dict)
    )
    parsed = _extract_json_object(response_text)

    brand = str(parsed.get("brand", "")).strip() or "Unknown"
    caption = str(parsed.get("caption", "")).strip()
    hashtags_raw = parsed.get("hashtags", [])
    hashtags: list[str] = []
    if isinstance(hashtags_raw, list):
        hashtags = [str(tag).strip() for tag in hashtags_raw if str(tag).strip()]
    elif isinstance(hashtags_raw, str):
        hashtags = [h.strip() for h in hashtags_raw.split() if h.strip().startswith("#")]

    if len(hashtags) < 10:
        defaults = [
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
        ]
        for tag in defaults:
            if tag not in hashtags:
                hashtags.append(tag)
            if len(hashtags) == 10:
                break
    hashtags = hashtags[:10]

    is_urgent = bool(parsed.get("is_urgent", False))
    image_url = _build_image_url(request, filename)

    return AnalysisResult(
        brand=brand,
        caption=caption,
        hashtags=hashtags,
        is_urgent=is_urgent,
        image_url=image_url,
        filename=filename,
    )


@app.post("/publish", response_model=PublishResponse)
async def publish_post(payload: PublishRequest) -> PublishResponse:
    caption = payload.caption.strip()
    if not caption:
        raise HTTPException(status_code=400, detail="Caption cannot be empty.")
    if not payload.image_url.strip():
        raise HTTPException(status_code=400, detail="image_url is required.")

    media_id, post_id = await post_to_instagram(payload.image_url.strip(), caption)
    return PublishResponse(
        success=True,
        media_id=media_id,
        instagram_post_id=post_id,
        detail="Post published successfully to Instagram.",
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
