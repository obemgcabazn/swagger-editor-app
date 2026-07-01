import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv();

  // Server Components and most route handlers don't have a NextResponse to write to
  // cookies().set() works in Route Handlers and Server Actions, but expectedly thrown in Server Components
  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies (set is attempted when refresh needed).  Auth middleware/proxy will handle refreshes on next navigation
        }
      },
    },
  });
}

// Verified JWT claims — preferred for page guards and RLS-backed reads.
// Doesn't check if user was deleted, token revoked, or metadata like email changed since token was issued
// Pass an existing client when the caller also runs Supabase queries in the same handler.
export async function getAuthClaims(supabase?: SupabaseServerClient) {
  const client = supabase ?? (await createSupabaseServerClient());
  const { data, error } = await client.auth.getClaims();

  if (error || !data) {
    return null;
  }

  return data.claims;
}

// Fresh user record from the Auth server — use when metadata must be up to date.
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
