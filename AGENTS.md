# AGENTS.md

Single source of truth for AI coding assistants working in this repository (Claude, Kilo, Codex, Cursor, Copilot, Gemini, and others). Read this file before making changes. If a tool needs its own entry point, point it here instead of duplicating content.

## Product

DocuMind AI is a personal AI document intelligence assistant. Users upload PDF and TXT files, ask questions about them, and use an AI agent to search, summarize, and extract action items.

**Current scope: Task 002 — UI Wireframe, Authentication & Dummy Components.** The repository contains the monorepo, the Next.js App Router web app with a full navigable prototype (authentication screens, app shell, dashboard, knowledge base, chat with agent activity, history, settings), the Express API, PostgreSQL via Docker Compose, Prisma, and a database-aware health endpoint.

Account signup calls the real API, and the API exposes cookie-based login, refresh, and logout endpoints with 15-minute access tokens and 30-minute refresh tokens. The web login screen, email verification, uploads, AI responses, citations, and agent executions remain **frontend simulations**. Real web login integration, email delivery, uploads, retrieval, embeddings, and AI providers remain **not implemented**. Do not add them unless a task explicitly asks.

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

- `apps/web` owns rendering and browser-side interaction only. It never talks to the database.
- `apps/api` owns HTTP endpoints, configuration, and all database access.
- `packages/shared` holds TypeScript contracts (types and constants) shared by both apps. It has no runtime dependencies.

## Repository layout

```text
apps/api/
  prisma/schema/schema.prisma # datasource + generator
  prisma/schema/user.prisma   # User model
  prisma/schema/email-verification.prisma # email verification tokens
  prisma.config.ts            # Prisma 7 CLI config
  src/config/env.ts           # env loading + validation
  src/config/auth.ts          # token lifetimes, cookie names, auth config types
  src/controllers/            # request/response handlers
  src/middlewares/            # not-found and error middleware
  src/models/prisma.model.ts  # Prisma client factory (pg adapter)
  src/routes/                 # API route composition, auth and health routes
  src/services/               # business logic: auth, login, tokens, cookies, email, database checks
  src/app.ts                  # Express app: middleware, CORS, cookies, routes
  src/main.ts                 # HTTP server + graceful shutdown
  src/generated/prisma/       # generated client (gitignored, never edit)
  tests/                      # Vitest unit tests (node environment)
    auth/                     # signup/login validation, service, and route tests
    env/                      # environment configuration tests
    health/                   # health route + service tests
    middlewares/              # not-found and error middleware tests
apps/web/
  app/                        # App Router route groups: (auth), (app)
  components/ui/              # shadcn/ui primitives
  components/shared/          # cross-feature product components
  components/auth/            # authentication feature
  components/documents/       # knowledge base feature
  components/chat/            # chat, citations, agent activity
  components/dashboard/       # overview feature
  components/history/         # conversation history feature
  components/settings/        # settings feature
  hooks/                      # reusable client hooks
  lib/                        # auth mocks, formatting, theme, cn()
  mocks/                      # centralized prototype datasets
  services/                   # API-backed feature services
  utils/                      # shared axios client + interceptors
  test/                       # Vitest setup (jsdom)
packages/shared/src/index.ts  # API_PREFIX, HEALTH_PATH, HealthResponse
```

## Commands

Run from the repository root:

| Command            | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `pnpm dev`         | Build shared, then run API + web in watch mode      |
| `pnpm build`       | Topological production build of all packages        |
| `pnpm test`        | Run backend and frontend unit tests                 |
| `pnpm typecheck`   | Strict TypeScript check across all packages         |
| `pnpm db:generate` | Regenerate the Prisma client                        |
| `pnpm db:migrate`  | Create/apply a dev migration                        |
| `pnpm db:deploy`   | Apply committed migrations (CI/production)          |
| `pnpm db:studio`   | Open Prisma Studio                                  |

Isolated runs: `pnpm --filter @documind/api dev`, `pnpm --filter @documind/web dev`.

After code changes, always run `pnpm test`, `pnpm typecheck`, and `pnpm build` before reporting completion.

Isolated tests: `pnpm --filter @documind/api test` and `pnpm --filter @documind/web test`.

## Testing requirements

Unit tests are mandatory for both backend and frontend changes. A change is not complete until it includes or updates tests for the affected behavior.

- **Backend** (`apps/api/tests`): Vitest with the Node environment. Test services and helpers directly, and use `createApp` with a stubbed Prisma client for route tests. Never require a live PostgreSQL instance in unit tests. Include failure paths, validation errors, and response shapes.
- **Frontend** (`apps/web`): Vitest with jsdom, Testing Library, and `@testing-library/jest-dom`. Prefer colocated `*.test.ts` or `*.test.tsx` files beside the code. Test validation, formatting, mock-service behavior, route guards where practical, and user interactions such as filtering, form errors, and simulated flows.
- Mock external routers (`next/navigation`) and browser APIs explicitly. Do not call real APIs, databases, or email services from unit tests.
- Keep test data deterministic. Use fake timers for simulated delays and fixed system time for date grouping.
- Tests must not leave cookies, storage, timers, or console spies behind; restore them in setup or `afterEach`.
- When the real backend integration replaces a `TODO: REMOVE MOCK` path, replace the mock-based tests with contract tests for the real service.

## Environment

- Root `.env` feeds Docker Compose. `apps/api/.env` feeds the API. `apps/web/.env.local` feeds the web app.
- Only `*.env.example` files are committed. Never commit `.env`, `.env.local`, `.env.*`, credentials, or secrets.
- `NEXT_PUBLIC_API_URL` is inlined into the browser bundle at build time. Changing it requires a web rebuild.
- `WEB_ORIGIN` must exactly match the web origin (scheme + host + port, no trailing slash).
- `JWT_SALT` is required by the API and must be a long random value that differs per environment.
- Auth cookies are configured with `COOKIE_DOMAIN` (optional shared parent domain), `COOKIE_SECURE` (defaults to `true` when `NODE_ENV=production`), and `COOKIE_SAME_SITE` (`lax`, `strict`, or `none`; `none` forces `Secure`).
- The API must start even when PostgreSQL is down; the health endpoint reports the failure instead of crashing.

## Conventions

- TypeScript strict mode everywhere. No `any` unless unavoidable; prefer explicit types and shared contracts from `@documind/shared`.
- API code is CommonJS-compatible and built with `tsc`; web code uses the Next.js App Router.
- Follow the layer-folder pattern: `controllers/`, `services/`, `routes/`, `models/`, and `middlewares/`. Put request/response handling in controllers, logic in services, route wiring in routes, Express middleware in middlewares, and Prisma access in models. Keep side effects out of routes.
- Validate API request bodies with Zod schemas in the service layer and return field-level errors through the existing `fieldErrors` response shape.
- Web UI follows `design.md`. Use the installed Tailwind/shadcn foundation, semantic CSS tokens, and Lucide icons. Do not add a second token system or component library.
- Keep pages thin: routing and composition in `app/`, primitives in `components/ui/`, cross-feature components in `components/shared/`, and feature components in `components/<feature>/`.
- All prototype data and simulated behavior must live in `apps/web/mocks` and carry the exact `TODO: REMOVE MOCK — …` comment. Never import mocks into a production data path.
- New web API calls go through `apps/web/services` and the shared axios instance in `apps/web/utils/api-client.ts`; keep interceptors centralized there instead of adding axios instances per feature.
- Export named functions and interfaces. Do not use default exports in API or shared code.
- Keep the Prisma schema multi-file: `prisma/schema/schema.prisma` holds the datasource and generator, and each feature model lives in its own file such as `prisma/schema/user.prisma`.
- Store timestamps as `DateTime @db.Timestamptz(3)` so PostgreSQL keeps the instant in UTC and converts it to the connection timezone instead of storing a naive local time.
- Database access goes through the Prisma client created in `src/models/prisma.model.ts`. Never instantiate a second client or connect to PostgreSQL directly from routes or the web app.
- Hash passwords with `bcryptjs` at cost 8. Never store, log, or return plaintext passwords. Store only verification-token and refresh-token hashes, never raw tokens.
- Auth tokens travel only in `httpOnly` cookies. Never return access or refresh tokens in a JSON body, and never read them from browser storage. The web client relies on `withCredentials` and the centralized axios interceptor in `apps/web/utils/api-client.ts`.
- Errors returned to clients must not leak internal database or stack details; log them server-side.
- Keep `@documind/shared` dependency-free. Contracts used by both apps belong there.
- Use 2-space indentation, single quotes, semicolons, and trailing commas in multi-line literals, matching the current source.
- Do not add comments to code unless the task asks for them.
- Do not edit `src/generated/prisma/`, `dist/`, or `.next/`; these are build output.

## Change guardrails

- Stay within the requested scope. Do not introduce real uploads, retrieval, AI providers, queues, Redis, authentication backends, or new services unless the task explicitly requires them. Frontend simulations stay marked as simulations.
- Do not add dependencies without a concrete need; prefer the existing stack.
- Do not change ports, API prefix (`/api/v1`), health response shape, or environment variable names without updating the README and both apps.
- Do not commit or push unless explicitly asked.
- Update `README.md` and this file when setup, commands, architecture, or conventions change.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
docker compose up -d
curl -i http://localhost:3001/api/v1/health   # expect 200 + "database":{"status":"up"}
```

Frontend route smoke checks (with the web dev server running) should cover `/login`, `/dashboard`, `/documents`, `/chat`, `/chat/conv-1`, `/history`, and `/settings`. Demo credentials: `demo@documind.ai` / `Demo@123`.

Failure path: `docker compose stop postgres`, expect HTTP 503 with `"status":"down"`, then `docker compose start postgres`.

## Definition of done

- The change is implemented in the correct app or package and respects the boundaries above.
- Unit tests cover the new backend and/or frontend behavior, and `pnpm test` passes.
- `pnpm typecheck` and `pnpm build` pass.
- New behavior is verified (curl, browser, or database check as applicable).
- Documentation is updated if setup, commands, contracts, or conventions changed.
- Every simulation still carries its `TODO: REMOVE MOCK` marker and is not presented as real functionality.
