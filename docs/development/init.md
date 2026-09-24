Good — since you're not fixed on the name yet, I'll use `nurture-me` as the working slug (easy to rename later: it only appears in `package.json`, the repo name, and `.env` variables). Here's the initialization sequence using official CLI generators wherever one exists, in the order that avoids rework.

## 0. Prerequisites

```bash
node -v     # need 20.9+ for Next.js 16
docker -v
```

## 1. Scaffold Next.js (official generator)

```bash
pnpx create-next-app@latest nurture-me \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --turbopack

cd nurture-me
git init
git add -A && git commit -m "chore: scaffold next.js app"
```

This already gives you Tailwind, TypeScript, App Router, and Turbopack configured — nothing to hand-write there.

## 2. shadcn/ui (official generator)

```bash
pnpx shadcn@latest init
```

Answer its prompts (style, base color, CSS variables). Then pull only the components you'll actually start with:

```bash
pnpx shadcn@latest add button input card dialog form label select dropdown-menu avatar badge tabs sonner skeleton
```

You can `add` more anytime — no need to guess the full list up front.

## 3. State, data, and validation libraries (no generators — just install)

```bash
pnpm add zustand @tanstack/react-query zod
pnpm add -D @tanstack/eslint-plugin-query
```

## 4. Database: Prisma (official generator)

```bash
pnpm add prisma --save-dev
pnpm add @prisma/client
pnpx prisma init
```

This creates `prisma/schema.prisma` and `.env` for you — don't hand-write these.

## 5. Redis client (no generator)

```bash
pnpm add ioredis
```

## 6. Better Auth (official generator — do this *after* Prisma init, since it edits `schema.prisma`)

```bash
pnpm add better-auth
pnpx @better-auth/cli@latest init
```

This scaffolds `lib/auth.ts` (or wherever it detects) with a starter config. Point its `database` at the Prisma adapter, then generate the auth tables directly into your existing schema:

```bash
pnpx @better-auth/cli@latest generate
```

It will ask to modify `prisma/schema.prisma` in place — confirm with `y`. This is the CLI writing `User`, `Session`, `Account`, `Verification` models for you instead of you typing them.

Then create the database and apply everything with Prisma's own generator (once Postgres is running — step 7):

```bash
pnpm prisma migrate dev --name init
```

## 7. Docker Compose for local Postgres + Redis

No CLI generates this one — it's genuinely hand-written, but it's ~20 lines and standard:

```bash
mkdir -p docker
```

```yaml
# docker/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: nurture
      POSTGRES_PASSWORD: nurture
      POSTGRES_DB: nurture_me
    ports: ["5432:5432"]
    volumes: ["pg_data:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redis_data:/data"]

volumes:
  pg_data:
  redis_data:
```

```bash
docker compose -f docker/docker-compose.yml up -d
```

## 8. Testing tools (official generators)

**Playwright** (has its own scaffolder — use it, don't hand-roll config):
```bash
pnpm create playwright
```
Accept TypeScript, `tests/e2e` as the folder, and GitHub Actions workflow — it can even generate that CI file for you (say yes when asked).

**Vitest** — no scaffolder, minimal install:
```bash
pnpm add -D vitest @vitejs/plugin-react jsdom @vitest/ui
```

**React Testing Library**:
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**MSW** (has a generator for the service worker file):
```bash
pnpm add -D msw
pnpx msw init public/ --save
```

## 9. Wire up test config (small, unavoidable hand-edit)

Only `vitest.config.ts` needs writing by hand since there's no generator — everything else above was CLI-produced:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
})
```

## 10. GitHub Actions

If you accepted Playwright's offer in step 8, `.github/workflows/playwright.yml` already exists. Add one more for the general CI gate (lint/typecheck/unit/build) — again, no generator covers this, but keep it small and let it grow:

```bash
mkdir -p .github/workflows
```

## 11. Documentation scaffold

```bash
mkdir -p docs/architecture, docs/api
```

Prisma and Better Auth both generate their own reference docs on demand (`pnpx prisma docs` isn't a thing, but `prisma studio` gives you a live schema browser: `pnpx prisma studio`). For everything else, one `docs/setup.md` capturing these exact commands is the highest-leverage doc you can write on day one.

## 12. Sanity check

```bash
pnpm run dev
pnpx prisma studio        # verify User/Session tables exist
pnpx playwright test      # should run (no tests yet, but proves install)
pnpx vitest run           # same
```

---

That's the full init sequence — everything with an official generator used it (`create-next-app`, `shadcn`, `prisma init`, `@better-auth/cli`, `pnpm init playwright`, `msw init`); only the Docker Compose file, the CI YAML, and `vitest.config.ts` had to be hand-written because no tool generates those. Want me to generate the `docs/setup.md` capturing this sequence as an actual file you can commit?