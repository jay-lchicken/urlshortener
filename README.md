# Linxy — Branded URL Shortener

Linxy is a full‑stack URL shortener with branded domains, link analytics, and team workflows. It uses Next.js App Router, Clerk auth, PostgreSQL for core data, MongoDB for click logs, and Redis for caching.

## Highlights

- Branded short links with custom domains
- Suspense redirects (preview destination before auto‑redirect)
- Real‑time click analytics and logs
- Domain verification + domain user access control
- Redis cache for hot paths

## Tech Stack

- Next.js 16 (App Router)
- Clerk (auth)
- PostgreSQL (links + domains)
- MongoDB (redirect_logs analytics)
- Redis (cache)
- Tailwind CSS

## Quick Start

1. Install dependencies
```bash
npm install
```

2. Configure environment variables

Create a `.env.local` with at least:
```
# App
BASE_URL=linxy.example.com

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# Optional: JSON array of allowed redirect origins
NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS=["https://linxy.example.com"]

# Postgres
DATABASE_URL=postgres://user:pass@localhost:5432/linxy

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=linxy

# Redis
REDIS_URL=redis://localhost:6379

# Domains
DOMAIN_CNAME_TARGET=linxy.example.com

# Optional: VirusTotal link safety checks
VIRUSTOTAL_API_KEY=...
```

3. Initialize the database

Run the SQL in `init.sql` against your PostgreSQL instance.

4. Start the dev server
```bash
npm run dev
```

Open `http://localhost:3000`.

## Data Model Overview

- PostgreSQL: `links`, `domains`, `domain_user`
- MongoDB: `redirect_logs` (click analytics)
- Redis: cache for hot reads (e.g. click totals and resolved links)

## Suspense Redirects

Links can be marked as `suspense` in the `links` table. When enabled, users see a short preview page (destination + countdown) before redirecting.

## Useful Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — lint code

## Deployment Notes

- Ensure `BASE_URL` matches the canonical host.
- `DOMAIN_CNAME_TARGET` should match the host you want custom domains to point to.
- For production, set proper SSL/TLS and configure Clerk redirect origins.
