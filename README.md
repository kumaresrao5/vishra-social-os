# Vishra Social OS

Social media automation app:
- Frontend: Next.js + Tailwind
- Backend: FastAPI + Anthropic + Meta Graph API

## 1. Local Run

### Backend
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
npm install
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8000`

## 2. Cloudflare Pages Deployment (Frontend)

This project is configured for static export (`next.config.mjs` uses `output: "export"`), so it works on Cloudflare Pages.

### Cloudflare Pages settings
- Framework preset: `Next.js (Static HTML Export)` or `None`
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `20+`

### Environment variable on Pages
- `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`

## 3. Backend Hosting Requirement

Cloudflare Pages does not run FastAPI directly. Deploy `main.py` on a Python host (Render, Railway, Fly.io, VM, etc.), then:

- Set backend env vars from `.env.example`
- Set `PUBLIC_BASE_URL` to backend public URL
- Set `CORS_ORIGINS` to include your Pages domain, for example:
  - `https://your-project.pages.dev`
  - `https://www.yourdomain.com` (if custom domain)

## 4. Docker Backend Deployment (Recommended)

Docker assets are included:
- `Dockerfile`
- `.dockerignore`
- `render.yaml`

### Deploy backend on Render
1. Push this repository to GitHub.
2. In Render, create a new Blueprint and select this repo.
3. Render reads `render.yaml` and creates `vishra-social-os-api`.
4. Set required secret env vars in Render:
   - `ANTHROPIC_API_KEY`
   - `META_ACCESS_TOKEN`
   - `INSTAGRAM_BUSINESS_ACCOUNT_ID`
   - `PUBLIC_BASE_URL` (your Render backend URL)
   - `CORS_ORIGINS` (include your Cloudflare Pages URL)
5. Deploy and verify `GET /health`.

## 5. Connect Frontend (Cloudflare Pages) to Backend

In Cloudflare Pages project settings, set:
- `NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend-domain>`

Re-deploy Pages after setting env vars.

## 6. Instagram Publish Requirement

`/publish` calls Meta Graph API `media` and `media_publish`.  
The `image_url` must be publicly reachable by Meta.
