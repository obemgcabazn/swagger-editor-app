# Supabase Setup

Supabase is used for three project areas:

- Authentication with Supabase Auth.
- Saved OpenAPI schemas for authenticated users.
- Request history and analytics recorded by server-side request execution.

## Project Setup

1. Create a Supabase project from the Supabase dashboard.
2. Copy the project URL and anon/publishable key from **Project Settings > API**.
3. Create a local `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-or-publishable-key"
```

Do not commit `.env.local`. Use `.env.example` as the committed template.

Do not put the Supabase `service_role` key in the app unless a future server-only admin task explicitly needs it. Current app flows should use the anon key with Row Level Security.

## Database Schema

The initial migration is in:

```text
supabase/migrations/202606270001_initial_app_schema.sql
```

It creates:

- `saved_schemas`: one saved JSON/YAML OpenAPI schema per authenticated user.
- `request_history`: server-recorded request analytics for authenticated users.

All user-owned tables have Row Level Security enabled.

## Applying The Schema

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

## Team Access

The project owner should invite teammates in the Supabase dashboard:

1. Open **Project Settings > Team**.
2. Invite teammates by email.
3. Give them enough access to view project API settings, Auth, Table Editor, SQL Editor, and logs.

Each teammate should create their own `.env.local` with the shared project URL and anon/publishable key. These values are safe to use in browser-capable code when RLS is correctly configured, but they still should not be committed.

## App Access Pattern

Default pattern:

```text
Server Component / Route Handler / Server Action -> Supabase server client
```

Use server-side Supabase calls for:

- Reading the current user.
- Loading saved schemas.
- Saving schemas from app-owned endpoints/actions.
- Recording request analytics from the proxy route.
- Rendering History and Analytics pages.

Do not add a browser Supabase client by default. Add one only if a feature needs realtime subscriptions or another client-only Supabase capability.

## Planned App Contracts

Recommended future routes/actions:

- `POST /api/proxy`: execute external REST requests through the server and record analytics.
- `GET /api/schemas/current`: load the authenticated user's saved schema.
- `PUT /api/schemas/current`: validate and save the authenticated user's schema.
- Server-rendered History pages should query Supabase directly from Server Components or server helpers.

Authentication implementation should add Supabase session refresh to the existing Next proxy so cookies stay current during route changes.
