# VideoTube

VideoTube is a full-stack video platform with:

- `backend/`: Express, MongoDB, JWT auth, Cloudinary uploads
- `frontend/`: React, Vite, Tailwind CSS

The landing page and auth flow are separate from the signed-in app, and the signed-in product includes feed, watch, channel, playlists, history, likes, studio, settings, and upload flows.

## Local setup

### 1. Backend env

Create `backend/.env` from `backend/.env.example`.

Required values:

- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CORS_ORIGIN`

### 2. Frontend env

Create `frontend/.env` from `frontend/.env.example`.

- Keep `VITE_DEV_API_URL=http://localhost:8001` for local development.
- Leave `VITE_API_BASE_URL` empty locally so Vite uses the dev proxy.

### 3. Run locally

Backend:

```powershell
cd "D:\Backend\Chai aur Backend\Day 03\backend"
npm run dev
```

Frontend:

```powershell
cd "D:\Backend\Chai aur Backend\Day 03\frontend"
npm run dev
```

## Publish online

Because the frontend uses `HashRouter`, you do not need special SPA rewrite rules for routes like `/#/watch/:id`.

### Backend deployment checklist

Deploy the `backend/` folder to any Node.js host and set these environment variables:

- `PORT`
- `NODE_ENV=production`
- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CORS_ORIGIN`

Set `CORS_ORIGIN` to a comma-separated list of allowed frontend origins, for example:

```text
https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

Start command:

```powershell
npm start
```

### Frontend deployment checklist

Build the `frontend/` folder on any static hosting platform.

Set:

```text
VITE_API_BASE_URL=https://your-backend-domain.com
```

Then build:

```powershell
cd "D:\Backend\Chai aur Backend\Day 03\frontend"
npm run build
```

Deploy the generated `frontend/dist/` output.

## Notes

- Guest users can browse public feed, watch pages, and channel pages.
- Signed-in users get likes, history, subscriptions, studio, settings, and uploads.
- Video uploads depend on valid Cloudinary credentials and supported video/image files.
