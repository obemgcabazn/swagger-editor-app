create extension if not exists pgcrypto;

create type public.schema_format as enum ('json', 'yaml');

create table public.saved_schemas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Default schema',
  format public.schema_format not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_schemas_one_per_user unique (user_id),
  constraint saved_schemas_content_not_empty check (length(trim(content)) > 0)
);

create table public.request_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  method text not null,
  endpoint_url text not null,
  status_code integer,
  duration_ms integer,
  request_timestamp timestamptz not null default now(),
  request_size_bytes integer,
  response_size_bytes integer,
  error_details text,
  request_headers jsonb,
  response_headers jsonb,
  created_at timestamptz not null default now(),
  constraint request_history_method_valid check (
    method in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE')
  ),
  constraint request_history_url_not_empty check (length(trim(endpoint_url)) > 0),
  constraint request_history_status_valid check (
    status_code is null or (status_code >= 100 and status_code <= 599)
  ),
  constraint request_history_duration_non_negative check (
    duration_ms is null or duration_ms >= 0
  ),
  constraint request_history_request_size_non_negative check (
    request_size_bytes is null or request_size_bytes >= 0
  ),
  constraint request_history_response_size_non_negative check (
    response_size_bytes is null or response_size_bytes >= 0
  )
);

create index request_history_user_timestamp_idx
  on public.request_history (user_id, request_timestamp desc);

create index request_history_user_status_idx
  on public.request_history (user_id, status_code);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger saved_schemas_set_updated_at
before update on public.saved_schemas
for each row execute function public.set_updated_at();

alter table public.saved_schemas enable row level security;
alter table public.request_history enable row level security;

create policy "Users can read own saved schema"
on public.saved_schemas for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own saved schema"
on public.saved_schemas for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own saved schema"
on public.saved_schemas for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own saved schema"
on public.saved_schemas for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read own request history"
on public.request_history for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own request history"
on public.request_history for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can delete own request history"
on public.request_history for delete
to authenticated
using ((select auth.uid()) = user_id);
