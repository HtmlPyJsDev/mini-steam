# Mini Steam

A full-stack catalog platform for **legally free and open-source games**, with a Steam-style dark UI.

> Mini Steam **does not support piracy**. Only games whose license permits free
> redistribution may be added. The `license` field on every game is **mandatory**
> and is enforced both at the model level and in admin form validation.

## Tech stack

**Frontend:** React 18 + TypeScript + Vite + React Router
**Backend:** Node.js + Express + Mongoose (MongoDB) + JWT + bcrypt + multer
**Storage:** Cloudflare R2 (S3-compatible) via `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`

## Project structure

```
mini-steam/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── scripts/
│   │   └── seedAdmin.js
│   └── src/
│       ├── config/
│       │   ├── db.js
│       │   └── r2.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── admin.js
│       │   ├── upload.js
│       │   └── errorHandler.js
│       ├── models/
│       │   ├── User.js
│       │   └── Game.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── gameRoutes.js
│       │   └── adminRoutes.js
│       └── utils/
│           ├── asyncHandler.js
│           ├── createToken.js
│           └── r2Upload.js
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/
        │   ├── client.ts
        │   ├── auth.ts
        │   ├── games.ts
        │   └── admin.ts
        ├── components/
        │   ├── Navbar.tsx
        │   ├── GameCard.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── AdminRoute.tsx
        │   └── Loader.tsx
        ├── context/
        │   └── AuthContext.tsx
        ├── pages/
        │   ├── CatalogPage.tsx
        │   ├── GamePage.tsx
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── ProfilePage.tsx
        │   └── AdminPage.tsx
        └── styles/
            └── global.css
```

## API surface

Base prefix: `/api`

### Auth
- `POST /api/register` — `{ email, password }` → `{ token, user }`
- `POST /api/login` — `{ email, password }` → `{ token, user }`
- `GET  /api/me` — protected → `{ user }` (with populated `downloads`)

### Games (public)
- `GET /api/games` — list all games
- `GET /api/games/:id` — single game

### Download (auth required)
- `GET /api/download/:id` — adds the game to the user's download history and
  returns either a public R2 URL (default) or a presigned URL (if
  `R2_USE_PRESIGNED_URLS=true`).

### Admin (auth + role=admin required)
- `POST   /api/admin/games` — `multipart/form-data`:
  text fields `title`, `description`, `license`; files `cover` (1 image),
  `screenshots` (≤ 10 images), `gameFile` (zip / archive / installer).
- `PUT    /api/admin/games/:id` — same shape; any file field is optional and
  replaces the existing one when sent. Old game file is deleted from R2 when
  replaced.
- `DELETE /api/admin/games/:id` — removes the game and its file from R2.

## Setup — backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: MONGODB_URI, JWT_SECRET, R2_*, CLIENT_URL, ADMIN_*
npm run dev
```

The dev server listens on `http://localhost:5000` and exposes `/api`.

### Backend `.env`

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ministeam
JWT_SECRET=replace_with_strong_secret
CLIENT_URL=http://localhost:5173

R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_BASE_URL=https://your-public-r2-domain.example.com

# Set to "true" if your R2 bucket is private — backend will return presigned
# download URLs instead of public ones.
R2_USE_PRESIGNED_URLS=false
PRESIGNED_URL_TTL_SECONDS=3600

# Used by `npm run seed:admin`
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me
```

### Cloudflare R2 setup

The backend creates an `S3Client` with:

- `endpoint` = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- `region`   = `auto`
- credentials from `.env`

**Public vs. presigned URLs.** Cover images and screenshots are served directly
in the catalog UI, so they need to be reachable from the browser. There are two
ways to make that work:

1. **Public bucket / custom domain (recommended).** Configure the R2 bucket
   for **public access** (Settings → Public access → Allow Access) **or**
   attach a custom domain. Set `R2_PUBLIC_BASE_URL` to that public origin
   (for example `https://r2.example.com`). The backend stores
   `coverUrl`, `screenshots[]`, and `fileUrl` as `${R2_PUBLIC_BASE_URL}/<key>`.
2. **Private bucket.** Set `R2_USE_PRESIGNED_URLS=true`. Game downloads will
   then be served via presigned `GET` URLs from `@aws-sdk/s3-request-presigner`.
   In this mode you must still expose covers/screenshots via a public origin
   (a CDN in front of R2, or a public bucket dedicated to images), or wire up a
   separate presigned-URL flow for images.

### Create the first administrator

After setting `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, run:

```bash
cd backend
npm run seed:admin
```

The script creates the user if it doesn't exist, or promotes the existing
account to `admin` and resets its password. Then sign in with those credentials
and open `/admin` in the frontend.

You can also do it manually in the Mongo shell:

```js
use ministeam
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## Setup — frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit if needed: VITE_API_URL=http://localhost:5000/api
npm run dev
```

The dev server listens on `http://localhost:5173`.

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the full app

1. Start MongoDB locally (e.g. `mongod` or Docker).
2. Configure Cloudflare R2 (bucket + access key).
3. In `backend/`: `cp .env.example .env`, fill in values, `npm install`, `npm run seed:admin`, `npm run dev`.
4. In `frontend/`: `cp .env.example .env`, `npm install`, `npm run dev`.
5. Open <http://localhost:5173>.

## Pages

- `/` — game catalog grid
- `/game/:id` — game detail (cover, description, screenshot gallery, license, file size, Download button)
- `/login`, `/register` — auth forms
- `/profile` — protected; shows email and download history
- `/admin` — admin only; create / edit / delete games and upload assets to R2

## Security

- Passwords are stored as bcrypt hashes (10 rounds).
- JWT (HS256, 7-day TTL) is required for protected endpoints.
- An `admin` middleware blocks non-admin access to `/api/admin/*`.
- CORS is restricted to `CLIENT_URL`.
- File uploads are filtered: `cover`/`screenshots` accept only image MIME types;
  `gameFile` accepts common archive / installer types.
- The `license` field is required at the schema level — games with no license
  cannot be persisted.
- Users are always serialized via `toSafeJSON()` which strips the password hash.
- All async route handlers funnel through a centralized error handler with
  meaningful messages and validation details.

## Why this catalog complies with "free / open-source only"

- **License is mandatory.** `Game.license` is a required field at the Mongoose
  schema level *and* checked in the admin create/update routes
  (`requireFields(...)`). Any attempt to create a game with an empty or missing
  license is rejected with a 400 error.
- **Admin-only ingestion.** Only authenticated users with `role === 'admin'`
  can add or modify games. Regular users cannot upload anything.
- **Curated process.** The administrator must explicitly state the license
  (e.g. `GPL-3.0`, `MIT`, `CC0`, `Public Domain`, `Freeware (developer-approved)`)
  for every entry, which is shown next to the cover and on the game page so the
  legality is auditable.
- **No support for restricted IP.** The platform exposes no mechanism to host
  copyrighted or paid content — game files are uploaded by the admin and
  intended for redistribution only when the corresponding license permits it.

## Scripts reference

### Backend
- `npm run dev` — start with nodemon
- `npm start` — start with node
- `npm run seed:admin` — create / promote the first admin

### Frontend
- `npm run dev` — Vite dev server
- `npm run build` — TypeScript typecheck + production build
- `npm run typecheck` — typecheck only
- `npm run preview` — preview the built app
