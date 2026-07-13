# Swagger Editor App

Localized Swagger/OpenAPI editor, viewer, and REST client for the [RS School React course](https://rs.school/courses/reactjs). Built with Next.js (App Router), `next-intl` (en/ru), and Supabase.

**Deployed app:** https://swagger-editor-app-indol.vercel.app  
**Task:** [Swagger/OpenAPI UI](https://github.com/rolling-scopes-school/tasks/blob/master/react/modules/tasks/final.md)  
**Team:** Alex Freen, Aleksandr Khokhryakov, Palina Yarkevich  
**YouTube video:** [cross-check PR #12](https://github.com/obemgcabazn/swagger-editor-app/pull/12)\_

## Setup

```bash
npm install
cp .env.example .env.local
```

`.env.example` includes working Supabase keys for e2e tests. Optional `SUPABASE_DEV_USER_*` vars enable the dev sign-in route — see [docs/supabase.md](docs/supabase.md).

## Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve production build
```

## Tests

```bash
npm test           # unit tests (Vitest)
npm run test:watch # watch mode
npm run coverage   # coverage report (80% threshold)
```

## E2E

Playwright builds and starts the app automatically:

```bash
npm run test:e2e
```

Uses `.env.local` when present; otherwise falls back to `.env.example`. If browsers are missing on first run, Playwright will prompt you to run `npx playwright install chromium`.
