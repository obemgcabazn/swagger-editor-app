# Supabase Setup

Supabase is used for three project areas:

- Authentication with Supabase Auth.
- Saved OpenAPI schemas for authenticated users.
- Request history and analytics recorded by server-side request execution.

## Project Setup

- Add to `.env` from `.env.example`. Keys are publishebly openly - so .env.example have valid values

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-or-publishable-key"
SUPABASE_DEV_USER_EMAIL="test@test.com"
SUPABASE_DEV_USER_PASSWORD="test-pass"
```

## Database Schema

The initial migration is in:

```text
supabase/migrations/202606270001_initial_app_schema.sql
```

It creates:

- `saved_schemas`: one saved JSON/YAML OpenAPI schema per authenticated user.
- `request_history`: server-recorded request analytics for authenticated users.

All user-owned tables have Row Level Security enabled.

## Applying The New Schemas

Fast path through the dashboard:

1. Open **SQL Editor** in the Supabase project.
2. Paste the migration SQL.
3. Run it once.

CLI path:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

For local Supabase development, initialize the CLI project first:

```bash
npx supabase init
npx supabase start
npx supabase db reset
```

## App Access Pattern

Default pattern:

```text
Server Component / Route Handler / Server Action -> Supabase server client
```

Use server-side Supabase calls for:

- Reading the current user.
- Loading saved schemas.
- Saving schemas from app-owned endpoints/actions.
- Recording request analytics from the request execution route.
- Rendering History and Analytics pages.

We did not add a browser Supabase client. Add will add only if a feature needs realtime subscriptions or another client-only Supabase capability.

## Temporary Development Sign-In

Until the real authentication UI is implemented, a development-only route can sign in a manually created Supabase user:

```text
POST /api/dev/sign-in
```

Setup:

1. In the Supabase dashboard, create a test user in **Authentication > Users**.
2. Add the credentials to local `.env` or `.env.local`:

```bash
SUPABASE_DEV_USER_EMAIL="test@test.com"
SUPABASE_DEV_USER_PASSWORD="test-pass"
```

3. Start the app in development and call:

```bash
curl -i -X POST http://localhost:3000/api/dev/sign-in
```

The route uses normal Supabase Auth and sets real Supabase session cookies, so RLS-protected schema/history work can be tested before the real auth screens exist.

The route returns `404` outside `NODE_ENV=development` and should not be used as production authentication.

## Temporary Request Smoke Test

Until the real Swagger UI is implemented, a development-only page can verify request execution and history recording:

```text
/en/dev/swagger
```

The page has four actions:

1. Execute a baked-in external request while unauthenticated. The response should include `analytics.recorded: false`.
2. Call `POST /api/dev/sign-in` with the configured development user.
3. Execute another baked-in external request while authenticated. The response should include `analytics.recorded: true`, and a row should appear in `request_history`.
4. Call `POST /api/dev/sign-out` to clear Supabase auth cookies.

The page calls same-origin API routes from the browser, so cookies from development sign-in are reused automatically.

## Planned App Contracts

Implemented route:

- `POST /api/requests/execute`: execute external REST requests through the server and record analytics.

Request body:

```json
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "headers": {
    "authorization": "Bearer token"
  },
  "body": null
}
```

Supported methods are `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS`.

The route returns external API statuses inside the response payload instead of turning them into app-level HTTP errors. For example, an external `404` should be rendered in the Swagger Viewer response panel.

The route records request analytics for authenticated users. Unauthenticated users can still execute requests, but history is not recorded.

Routes/actions:

- `POST /api/requests/execute`: execute external REST requests through the server and record
  analytics.
- Initial saved schema load can happen directly in the main Server Component page.
- Schema saving can use a Server Action or `PUT /api/schemas/current`.
- Server-rendered History pages will query Supabase directly from Server Components or server helpers.

Authentication implementation should add Supabase session refresh to the existing Next proxy so cookies stay current during route changes.
