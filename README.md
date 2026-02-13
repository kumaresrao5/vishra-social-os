# Vishra Social OS

Social media automation app running fully on Vercel (free tier):
- Next.js frontend
- Vercel API routes for analyze/publish backend logic
- Groq API for caption generation
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

- `GROQ_API_KEY`
- `GROQ_MODEL` (default: `meta-llama/llama-4-scout-17b-16e-instruct`)
- `META_ACCESS_TOKEN`
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`
- `DRAVIDIAN_IG_ID`
- `FIREANDICE_IG_ID`
- `BARLEYHOPS_IG_ID`
- `SCOREBAR_IG_ID`
- `SOUTHERNSPICE_IG_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_UPLOAD_PRESET` (unsigned preset)
- `AUTH_SECRET` (long random string)
- `TEAM_USERS` (JSON array of users and allowed brands)
- Optional for live in-app user management:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

Optional:
- `NEXT_PUBLIC_API_BASE_URL` (leave empty to use same-origin `/api/*` routes)

## Vercel Deploy (Free)

1. Import this GitHub repo into Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Add the required env vars above in Vercel Project Settings.
5. Deploy.

## API Routes

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/admin/users` (agency_manager only)
- `POST /api/admin/users` (agency_manager only)
- `DELETE /api/admin/users/:username` (agency_manager only)

- `POST /api/analyze`
  - Accepts JPG/PNG poster upload
  - Uses Groq vision model to detect brand and generate caption/hashtags
  - Uploads image to Cloudinary and returns `image_url` + generated copy

- `POST /api/publish`
  - Publishes to Instagram via Meta `media` + `media_publish` endpoints
  - Supports `target`: `post` or `story`
  - Enforces role rules:
    - `agency_manager` can publish all brands
    - `bar_manager` can only publish brands listed in `TEAM_USERS[].brands`

## Notes

- Existing `main.py` FastAPI server is still in repo as an alternative backend, but not required for free Vercel deployment.
