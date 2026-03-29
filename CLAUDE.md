# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (localhost:3000)
- `npm run build` — production build
- `npm run lint` — ESLint

No test framework is configured.

## Architecture

Linxy is a branded URL shortener built on **Next.js 16 App Router** with three data stores:

- **PostgreSQL** (`pg`) — links, domains, domain_user tables (schema in `init.sql`)
- **MongoDB** — `redirect_logs` collection for click analytics
- **Redis** (`ioredis`) — cache layer with TTL-based keys

Auth is handled by **Clerk** (`@clerk/nextjs`). API routes check `currentUser()` and return 401 if unauthenticated. User IDs from Clerk are stored as TEXT in PostgreSQL.

### Core redirect flow (`src/app/[tag]/page.tsx`)

1. Look up tag in Redis cache (`TAG[{origin}/{tag}]`, 30min TTL)
2. On cache miss, query PostgreSQL `links` table
3. Log click to MongoDB `redirect_logs` (async, non-blocking)
4. If link has `suspense=true`, render a countdown preview page; otherwise `redirect()` directly

### API routes (`src/app/api/`)

- `/api/links` (POST) — create link; validates alphanumeric tag, checks reserved tags, runs VirusTotal safety scan, verifies domain authorization
- `/api/links/[linkId]` (PUT/DELETE) — update/delete with Redis cache invalidation
- `/api/domains` (POST) — register custom domain
- `/api/domains/[domainId]/verify` (POST) — DNS verification (TXT + CNAME lookup)
- `/api/domains/[domainId]/users` — manage domain access

### Data layer (`src/lib/`)

- `db.ts` — PostgreSQL connection pool
- `mongodb.ts` — MongoDB client singleton (global cache in dev)
- `redis.ts` — Redis connection (`REDIS_URL` env var)
- `cache.ts` — cache helpers: URL cache (30min), VirusTotal scan cache (48hr), total clicks cache (5min)
- `virustotal.ts` — link safety scanning; submits URL, polls for result, caches outcome

### Reserved tags

`admin`, `login`, `signup`, `api`, `links`, `dashboard`, `settings`, `account`, `help`, `documentation`, `robots.txt`, `/`, `domains` — blocked from use as link slugs.

### Domain verification

Custom domains require a TXT record (`_linxy.{host}` → `linxy-verification={domainId}`) and a CNAME pointing to `DOMAIN_CNAME_TARGET`. DNS resolution uses Google and Cloudflare resolvers.

## Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss` plugin and `@theme` / `@custom-variant` syntax
- **OKLCh color space** for all theme colors (warm golden/yellow palette, light + dark modes) in `src/app/globals.css`
- **shadcn/ui** components (new-york style) in `src/components/ui/` with Radix UI primitives
- Dark mode via `next-themes` (default theme: dark)
- Animation: `motion/react` (Framer Motion) and `tw-animate-css`

## Environment Variables

Key vars needed in `.env.local`: `DATABASE_URL`, `MONGODB_URI`, `MONGODB_DB`, `REDIS_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `BASE_URL`, `DOMAIN_CNAME_TARGET`. Optional: `VIRUSTOTAL_API_KEY`.
