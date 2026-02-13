# Vishra Social OS

Social media automation app running fully on Vercel (free tier):
- Next.js frontend
- Vercel API routes for analyze/publish backend logic
- Gemini API for caption generation
- Meta Graph API for Instagram publishing
- Cloudinary (free tier) for public image hosting before Instagram publish

## Local Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default: `gemini-1.5-flash`)
- `META_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_UPLOAD_PRESET` (unsigned preset)

Optional:
- `NEXT_PUBLIC_API_BASE_URL` (leave empty to use same-origin `/api/*` routes)

## Vercel Deploy (Free)

1. Import this GitHub repo into Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Add the required env vars above in Vercel Project Settings.
5. Deploy.

## API Routes

- `POST /api/analyze`
  - Accepts JPG/PNG poster upload
  - Uses Gemini to detect brand and generate caption/hashtags
  - Uploads image to Cloudinary and returns `image_url` + generated copy

- `POST /api/publish`
  - Publishes to Instagram via Meta `media` + `media_publish` endpoints

## Notes

- Existing `main.py` FastAPI server is still in repo as an alternative backend, but not required for free Vercel deployment.
