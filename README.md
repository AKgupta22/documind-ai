# DocuMind AI

Personal AI document intelligence assistant. Users will upload PDFs and TXT files, ask questions about them, and use an AI agent to search, summarize, and extract action items.

**Current scope: Task 002 — UI Wireframe, Authentication & Dummy Components.** This repository contains the monorepo, a navigable Next.js prototype (authentication, app shell, dashboard, knowledge base, chat with agent activity, history, settings), the Express API, PostgreSQL via Docker Compose, Prisma, and a database-aware health endpoint. Account signup calls the real API, and the API exposes cookie-based login, refresh, and logout endpoints. The web login screen, email verification, uploads, retrieval, citations, agent executions, and AI responses in the web app remain **frontend simulations**. Real web login integration, email delivery, uploads, retrieval, embeddings, and AI providers are intentionally **not** implemented yet.

## Architecture

```text
Browser
  │  fetch NEXT_PUBLIC_API_URL/health
  ▼
apps/web (Next.js, :3000)  ──HTTP/CORS──►  apps/api (Express, :3001)
                                              │
                                              │ Prisma 7 + @prisma/adapter-pg
                                              ▼
                                        PostgreSQL (:5432, Docker)
```

- `apps/web` owns rendering and browser-side interaction only.
- `apps/api` owns HTTP endpoints, configuration, and all database access.
- `packages/shared` holds TypeScript contracts shared by both apps. It has no runtime dependencies.

## Frontend prototype

The web app is a complete navigable wireframe. All product data is fixed prototype data in
`apps/web/mocks`; every mock and simulated interaction carries a `TODO: REMOVE MOCK` marker.

| Route | Purpose |
| --- | --- |
| `/login` | Simulated sign-in with client validation |
| `/register` | API-backed registration with client validation |
| `/forgot-password` | Neutral reset-request confirmation |
| `/reset-password` | Mock-token password reset |
| `/verify-email` | Simulated email verification |
| `/dashboard` | Overview, usage, recent documents and conversations |
| `/documents` | Knowledge base with search, filters, upload and delete simulations |
| `/chat`, `/chat/[conversationId]` | Simulated chat, citations and expandable agent activity |
| `/history` | Grouped conversation history, search and delete confirmation |
| `/settings` | Profile, theme, preferences, memory placeholder and privacy actions |

Demo credentials: `demo@documind.ai` / `Demo@123`.

The web login prototype still uses a non-httpOnly mock cookie containing only display name and email; it does not consume the API auth cookies yet. Client-side route guards are a prototype convenience, **not security**. Production authorization must be enforced by the backend. Light, Dark and System themes are supported through the semantic tokens in `apps/web/app/globals.css`; no token values are hardcoded in components.

## Prerequisites

| Tool           | Version used | Notes                                              |
| -------------- | ------------ | -------------------------------------------------- |
| Node.js        | 24.x         | `>=22.12` is required by Prisma 7                  |
| pnpm           | 12.11.2      | `corepack enable` then `corepack prepare pnpm@12.11.2 --activate` |
| Docker         | any recent   | Docker Engine + Compose v2                         |
| PostgreSQL     | 17 (container) | Provided by `docker-compose.yml`; no local install needed |

## First-time setup

```bash
cd documind-ai

# 1. Root environment for Docker Compose
cp .env.example .env

# 2. Start PostgreSQL
docker compose up -d

# 3. API environment
cp apps/api/.env.example apps/api/.env

# 4. Web environment
cp apps/web/.env.example apps/web/.env.local

# 5. Install all workspace dependencies
pnpm install

# 6. Generate the Prisma client (also runs automatically before build/dev)
pnpm db:generate
```

The values in `.env.example` are local development placeholders. Replace them for any shared environment. `.env`, `.env.local`, and `.env.*` are gitignored; only `*.env.example` files are committed.

Auth cookies are configured per environment with `JWT_SALT`, `COOKIE_DOMAIN`, `COOKIE_SECURE`, and `COOKIE_SAME_SITE` in `apps/api/.env`. The web app sends cookies through the shared axios client (`withCredentials: true`) and refreshes a 401 once through `/auth/refresh`.

## Running locally

```bash
pnpm dev
```

This builds `@documind/shared` once, then starts:

- Web: <http://localhost:3000>
- API: <http://localhost:3001/api/v1>
- Health: <http://localhost:3001/api/v1/health>

`pnpm dev` runs both apps in watch mode. For isolated runs:

```bash
pnpm --filter @documind/api dev
pnpm --filter @documind/web dev
```

## Health endpoint

`GET /api/v1/health` verifies that the API process is up **and** that PostgreSQL answers a query (`SELECT 1`) through Prisma.

Healthy — HTTP `200`:

```json
{
  "status": "ok",
  "service": "documind-api",
  "timestamp": "2026-11-12T15:00:08.871Z",
  "uptimeSeconds": 7,
  "database": { "status": "up", "latencyMs": 94 }
}
```

Database unreachable — HTTP `503`:

```json
{
  "status": "error",
  "service": "documind-api",
  "timestamp": "2026-11-12T15:00:43.460Z",
  "uptimeSeconds": 42,
  "database": { "status": "down", "latencyMs": 1 }
}
```

The endpoint deliberately does **not** connect eagerly at boot, so the API can start while the database is down and report the failure instead of crashing. Prisma reconnects on the next successful query. Internal database error details are logged server-side, not returned to clients.

## Signup endpoint

`POST /api/v1/auth/signup` creates a user account.

```json
{
  "fullname": "Avery Morgan",
  "email": "avery@example.com",
  "password": "Password1"
}
```

Created — HTTP `201`:

```json
{
  "user": {
    "id": "b5f8c8d4-...",
    "fullname": "Avery Morgan",
    "email": "avery@example.com",
    "isEmailVerified": false
  }
}
```

- Passwords are hashed with `bcryptjs` at cost 8; plaintext passwords are never stored or returned.
- Emails are trimmed and lowercased; the unique index prevents duplicates and a race returns HTTP `409`.
- Invalid input returns HTTP `400` with `fieldErrors`.
- Signup creates a link-style verification token in `email_verifications`, storing only its SHA-256 hash with a 24-hour expiry.
- Email delivery is intentionally disabled with the provider call commented out in `services/email.service.ts`.
- `isEmailVerified` remains `false`, and login is blocked until the email is verified.
- The web register form calls this endpoint through `services/auth.service.ts` and the shared
  axios client; the web login and email verification screens remain simulated.

## Login endpoints

`POST /api/v1/auth/login` authenticates an existing, verified user and sets two `httpOnly`
cookies. Tokens are never returned in the response body.

```json
{
  "email": "avery@example.com",
  "password": "Password1"
}
```

Success — HTTP `200`:

```json
{
  "user": {
    "id": "b5f8c8d4-...",
    "fullname": "Avery Morgan",
    "email": "avery@example.com",
    "isEmailVerified": true
  }
}
```

- Access token cookie: 15 minutes (`dm_access_token`).
- Refresh token cookie: 30 minutes (`dm_refresh_token`).
- Both cookies are `httpOnly`, `path=/`, and use the configured `SameSite`/`Secure` policy.
- Only a SHA-256 hash of the refresh token is stored in `users.refresh_token`.
- Login is blocked with HTTP `403` while `isEmailVerified` is `false`, so a user cannot sign in
  immediately after signup.
- Invalid credentials return HTTP `401` without revealing whether the email exists.
- `POST /api/v1/auth/refresh` rotates both tokens using the refresh cookie.
- `POST /api/v1/auth/logout` clears both cookies and revokes the stored refresh token.
- CORS is configured with `credentials: true`, so `WEB_ORIGIN` must list every allowed web
  origin exactly.

Cookie deployment settings live in `apps/api/.env`:

```bash
JWT_SALT=replace-with-a-long-random-secret
# COOKIE_DOMAIN=          # optional shared parent domain, e.g. .documind.example
# COOKIE_SECURE=true      # defaults to true when NODE_ENV=production
# COOKIE_SAME_SITE=lax    # lax, strict, or none (none forces Secure)
```

Use `COOKIE_SAME_SITE=none` plus HTTPS when the web app and API are on different sites. Use a
shared `COOKIE_DOMAIN` when they are on different subdomains of the same site.

## Commands

| Command              | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `pnpm dev`           | Build shared, then run API + web in watch mode                 |
| `pnpm build`         | Topological production build of all packages                   |
| `pnpm test`          | Run backend and frontend unit tests                            |
| `pnpm typecheck`     | Strict TypeScript check across all packages                    |
| `pnpm db:generate`   | Regenerate the Prisma client                                   |
| `pnpm db:migrate`    | Create/apply a dev migration (for future models)               |
| `pnpm db:deploy`     | Apply committed migrations (CI/production)                     |
| `pnpm db:studio`     | Open Prisma Studio                                             |

API-only scripts are defined in `apps/api/package.json`; web scripts in `apps/web/package.json`.

## Project structure

```text
documind-ai/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   └── schema/
│   │   │       ├── schema.prisma    # datasource + generator
│   │   │       ├── user.prisma      # User model
│   │   │       └── email-verification.prisma # verification tokens
│   │   ├── prisma.config.ts         # Prisma 7 CLI config (schema, migrations, DATABASE_URL)
│   │   ├── src/
│   │   │   ├── config/env.ts        # env loading + validation
│   │   │   ├── controllers/         # request/response handlers
│   │   │   ├── middlewares/         # not-found and error middleware
│   │   │   ├── models/              # Prisma client factory (pg adapter)
│   │   │   ├── routes/              # API route composition, auth + health
│   │   │   ├── services/            # business logic, auth, email, health
│   │   │   ├── app.ts               # Express app: middleware, CORS, routes
│   │   │   ├── main.ts              # HTTP server + graceful shutdown
│   │   │   └── generated/prisma/    # generated client (gitignored)
│   │   ├── tests/                   # Vitest unit tests (Node), grouped by feature
│   │   │   ├── auth/
│   │   │   ├── env/
│   │   │   ├── health/
│   │   │   └── middlewares/
│   │   ├── .env.example
│   │   └── tsconfig.json
│   └── web/
│       ├── app/                     # App Router: (auth) and (app) route groups
│       ├── components/
│       │   ├── ui/                  # shadcn/ui primitives
│       │   ├── shared/              # app shell, headers, shared states
│       │   ├── auth/                # login, register, reset, verify
│       │   ├── dashboard/
│       │   ├── documents/
│       │   ├── chat/                # messages, citations, agent activity
│       │   ├── history/
│       │   └── settings/
│       ├── hooks/                   # media query hook
│       ├── lib/                     # auth session, format, theme, cn()
│       ├── mocks/                   # centralized prototype datasets
│       ├── services/                # API-backed feature services (auth)
│       ├── utils/                   # shared axios client + interceptors
│       ├── test/                    # Vitest jsdom setup
│       ├── .env.example
│       ├── next.config.ts
│       ├── vitest.config.mts
│       └── tsconfig.json
├── packages/
│   └── shared/
│       └── src/index.ts             # API_PREFIX, HealthResponse contract
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
├── .env.example
└── README.md
```

## How the frontend talks to the backend

The Task 002 product screens are prototype-only and do not call the API. The existing
`components/health-status.tsx` client widget remains available for future use; `/` now
redirects to the app or login.

1. The browser loads the Next.js app from port `3000`.
2. `components/health-status.tsx` calls
   `fetch(`${NEXT_PUBLIC_API_URL}/health`)` with `cache: 'no-store'` when rendered.
3. `NEXT_PUBLIC_API_URL` comes from `apps/web/.env.local` and is inlined into the
   browser bundle **at build time** (a `NEXT_PUBLIC_` constraint, not a runtime lookup).
4. The Express API mounts the health router under `/api/v1` and enables CORS for
   `WEB_ORIGIN` (default `http://localhost:3000`).
5. The response is typed as `HealthResponse` from `@documind/shared`, so the contract
   cannot drift silently between the two apps.

There is no direct database access from the web app, and no shared runtime code beyond
plain TypeScript types/constants.

## Key dependencies

| Dependency                        | Why it exists                                                        |
| --------------------------------- | -------------------------------------------------------------------- |
| `next`, `react`, `react-dom`      | Web application and App Router rendering                             |
| `express`                         | HTTP server, routing, middleware                                     |
| `cors`                            | Browser access control between the web origin and the API            |
| `@prisma/client`                  | Generated, type-safe database client                                 |
| `prisma` (dev)                    | CLI for `generate`, `migrate`, `validate`, `studio`                  |
| `@prisma/adapter-pg`, `pg`        | Prisma 7 requires a driver adapter; these connect to PostgreSQL      |
| `bcryptjs`                        | Password hashing for the signup flow at bcrypt cost 8                |
| `jsonwebtoken`                    | Signs and verifies access/refresh JWTs                               |
| `cookie-parser`                   | Reads the refresh-token cookie on refresh/logout                     |
| `zod`                             | Lightweight schema validation for signup and login requests          |
| `axios`                           | Web HTTP client with shared request/response interceptors            |
| `dotenv`                          | Loads `.env` at API startup and for `prisma.config.ts` CLI commands  |
| `tsx` (dev)                       | TypeScript execution + watch mode for the API during development     |
| `typescript`                      | Strict compilation for all packages                                  |
| `tailwindcss`, `@tailwindcss/postcss` | Utility styling mapped to the existing semantic CSS tokens       |
| Radix UI primitives               | Accessible shadcn/ui foundations for dialogs, menus, forms, sheets   |
| `lucide-react`                    | The single icon library used by the UI                               |
| `clsx`, `tailwind-merge`, `class-variance-authority` | `cn()` and component variants                   |
| `vitest`, Testing Library, `jsdom` (dev) | Unit tests for both apps                                     |

No AI provider, queue, Redis, or microservice dependencies are installed in this task.

## Database notes

- PostgreSQL is provisioned only through Docker Compose; credentials come from the root `.env`.
- Prisma 7 uses `prisma.config.ts` and the new `prisma-client` generator with
  `moduleFormat = "cjs"` so it fits the Express CommonJS build.
- The generated client is written to `apps/api/src/generated/prisma` and is gitignored.
  It is regenerated by `pnpm install`-time commands, `pnpm db:generate`, and before
  every API build/dev run.
- The Prisma schema is multi-file: `prisma/schema/schema.prisma` holds the datasource and
  generator, `user.prisma` defines the `User` model mapped to `users`, and
  `email-verification.prisma` defines `EmailVerification` mapped to `email_verifications`.
  `prisma.config.ts` points at the `prisma/schema` folder. Migrations for both tables live in
  `prisma/migrations`; use `pnpm db:migrate` for new development migrations.
- Timestamp columns use `@db.Timestamptz(3)`, so PostgreSQL stores the instant in UTC and
  converts it per connection timezone. The existing `email_verifications.createdAt` and
  `expiresAt` columns were migrated from `TIMESTAMP(3)` to `TIMESTAMPTZ(3)`.
- `users` now has `created_at` and `updated_at` (`createdAt`/`updatedAt` in Prisma, with
  `@updatedAt` maintained by Prisma). The migration backfilled existing users from their
  earliest email verification token's `createdAt`, falling back to the migration time when no
  token existed.

## Verifying the foundation

```bash
# 1. Dependencies and workspace links
pnpm install

# 2. Strict builds (shared → API → web)
pnpm build

# 3. Type checks and unit tests
pnpm typecheck
pnpm test

# 4. Database is up
docker compose ps
docker compose exec postgres pg_isready -U documind -d documind

# 5. Health endpoint (expect 200 + "database":{"status":"up"})
curl -i http://localhost:3001/api/v1/health

# 6. Failure path: stop PostgreSQL, expect 503 + "status":"down"
docker compose stop postgres
curl -i http://localhost:3001/api/v1/health
docker compose start postgres

# 7. Browser check
open http://localhost:3000/login   # demo@documind.ai / Demo@123
```

## Troubleshooting

- **`DATABASE_URL` errors at startup** — `apps/api/.env` is missing or the credentials
  do not match the root `.env` used by Compose.
- **Port already in use** — change `PORT` in `apps/api/.env`, `POSTGRES_PORT` in the root
  `.env`, or the Next.js port in `apps/web/package.json`; update `NEXT_PUBLIC_API_URL`
  and `WEB_ORIGIN` accordingly.
- **`ERR_PNPM_IGNORED_BUILDS`** — pnpm 12 blocks lifecycle scripts by default. The required
  approvals live in `pnpm-workspace.yaml` under `allowBuilds`.
- **Missing Prisma client types** — run `pnpm db:generate`.
- **CORS errors in the browser** — `WEB_ORIGIN` must exactly match the web origin
  (scheme + host + port), with no trailing slash. Auth uses credentialed requests, so a
  wildcard origin is not allowed.
- **Auth cookies are not sent across environments** — set `COOKIE_DOMAIN` for subdomain
  sharing, or `COOKIE_SAME_SITE=none` with `COOKIE_SECURE=true` and HTTPS for cross-site
  deployments.
- **Docker not installed** — install Docker Compose, or point `DATABASE_URL` at any
  reachable PostgreSQL 17 instance.
