# VideoTube

VideoTube is a full-stack video platform with:

- `backend/`: Express, MongoDB, JWT auth, Cloudinary uploads
- `frontend/`: React, Vite, Tailwind CSS

The landing page and auth flow are separate from the signed-in app, and the signed-in product includes feed, watch, channel, playlists, history, likes, studio, settings, and upload flows.

## Local setup

### 1. Backend env

Create `backend/.env` from `backend/.env.example`.

Required values:

- `MONGODB_URI` using the standard Atlas URI from the dashboard
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
cd "D:\VideoTube\backend"
npm run dev
```

Frontend:

```powershell
cd "D:\VideoTube\frontend"
npm run dev
```

## Production deploy

Recommended stack:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media: Cloudinary

Because the frontend uses `HashRouter`, you do not need special SPA rewrite rules for routes like `/#/watch/:id`.

### 1. Deploy the backend on Render

Use the `backend/` folder as the service root.

- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/v1/healthcheck`

Set these environment variables:

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

Set `CORS_ORIGIN` to a comma-separated list of allowed frontend origins. Example:

```text
https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

There is also a ready backend blueprint in `render.yaml`.

### 2. Allow database access from MongoDB Atlas

In Atlas, add a Network Access rule so your deployed backend can connect.

- Fastest setup: `0.0.0.0/0`
- Better long term: restrict access to your exact deployment network

### 3. Deploy the frontend on Vercel

Use the `frontend/` folder as the project root.

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Set:

```text
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

### 4. Final production wiring

After Vercel gives you the real frontend URL, go back to Render and update:

```text
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

Then redeploy the backend.

### Production checklist

- Guest users can browse public feed, watch pages, channel pages, and comments.
- Signed-in users get likes, history, subscriptions, studio, settings, and uploads.
- Production cookies require HTTPS on both frontend and backend.
- Video uploads depend on valid Cloudinary credentials and supported video/image files.

### Official docs

- [Vercel Vite docs](https://vercel.com/docs/frameworks/frontend/vite)
- [Render Node/Express docs](https://render.com/docs/deploy-node-express-app)
- [Render Blueprint spec](https://render.com/docs/blueprint-spec)
- [MongoDB Atlas network access docs](https://www.mongodb.com/docs/atlas/security/add-ip-address-to-list/)
